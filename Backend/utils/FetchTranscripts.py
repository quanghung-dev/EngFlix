"""
video_pipeline.py (Phiên bản chạy bằng Groq API)
-----------------
Pipeline hoàn chỉnh cho Parroto:
    1. Nhận category + list URL YouTube
    2. Với mỗi video: lấy metadata, transcript, dịch qua Groq → lưu .json
    3. Ngay sau đó: chuyển .json → .sql (INSERT sẵn cho PostgreSQL)

Thư viện cần cài:
    pip install yt-dlp youtube-transcript-api groq python-dotenv
"""

import json
import sys
import os
import re
import asyncio
import time
from datetime import datetime, timezone
import argparse
import psycopg2
from psycopg2.extras import RealDictCursor

import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled
from openai import OpenAI, RateLimitError, APIError
from dotenv import load_dotenv


# Fix Windows console encoding issues for Vietnamese characters
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Check if '--cli' is present in command-line arguments
IS_CLI = '--cli' in sys.argv

# Override default print if running in CLI mode to output logs to stderr, keeping stdout clean for the JSON output.
_original_print = print
def print(*args, **kwargs):
    if IS_CLI:
        if 'file' not in kwargs:
            kwargs['file'] = sys.stderr
    _original_print(*args, **kwargs)


# ══════════════════════════════════════════════
# CẤU HÌNH DEEPSEEK & PIPELINE
# ══════════════════════════════════════════════
MODEL          = "deepseek-v4-flash"
BATCH_SIZE     = 50     # Dịch nhiều câu cùng lúc trong mỗi batch
MAX_CONCURRENT = 10     # Tăng số luồng chạy song song
MAX_RETRIES    = 5      # Số lần thử lại tối đa
RETRY_DELAY    = 2      # Giảm thời gian chờ giữa các lần retry khi rate-limit để phục hồi nhanh
CALL_DELAY     = 0      # Bỏ hoàn toàn độ trễ giữa các lượt gọi thành công đối với DeepSeek

# Thư mục output JSON (cùng cấp script)
OUTPUT_DIR     = os.path.join(os.path.dirname(os.path.abspath(__file__)), "File_Json_Extract")
# Thư mục output SQL (con của OUTPUT_DIR)
SQL_DIR        = os.path.join(OUTPUT_DIR, "sql")


# ══════════════════════════════════════════════
# KHỞI TẠO
# ══════════════════════════════════════════════
load_dotenv()

api_key = os.getenv("DEEPSEEK_API_KEY")
if not api_key:
    raise ValueError("Không tìm thấy DEEPSEEK_API_KEY trong file .env")

client = OpenAI(
    api_key=api_key,
    base_url="https://api.deepseek.com"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(SQL_DIR, exist_ok=True)


# ══════════════════════════════════════════════
# PHẦN 1 — YOUTUBE METADATA (yt-dlp)
# ══════════════════════════════════════════════

def get_video_metadata(video_url: str) -> dict:
    """Lấy title, duration, thumbnail_url từ YouTube."""
    ydl_opts = {"quiet": True, "skip_download": True, "noplaylist": True}
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            return {
                "title":         info.get("title", "Unknown Title"),
                "duration":      int(info.get("duration", 0)),
                "thumbnail_url": info.get("thumbnail", ""),
            }
    except yt_dlp.utils.DownloadError as e:
        raise RuntimeError(f"yt-dlp không lấy được metadata: {e}")


# ══════════════════════════════════════════════
# PHẦN 2 — TRANSCRIPT (youtube-transcript-api)
# ══════════════════════════════════════════════

def get_transcript(video_url: str) -> list[dict]:
    """Lấy transcript tiếng Anh, fallback ngôn ngữ khác nếu không có."""
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11})", video_url)
    if not match:
        raise ValueError(f"URL không hợp lệ: {video_url}")
    video_id = match.group(1)

    try:
        ytt_api = YouTubeTranscriptApi()
        transcript_list = ytt_api.list(video_id)
        try:
            transcript = transcript_list.find_transcript(["en"])
        except NoTranscriptFound:
            transcript = next(iter(transcript_list))
        raw_list = list(transcript.fetch())
    except TranscriptsDisabled:
        raise RuntimeError("Video này không cho phép phụ đề (TranscriptsDisabled).")
    except Exception as e:
        raise RuntimeError(f"Lỗi khi lấy transcript: {e}")

    transcripts = []
    for index, snippet in enumerate(raw_list, start=1):
        end_ts = round(raw_list[index].start, 3) if index < len(raw_list) \
                 else round(snippet.start + snippet.duration, 3)
        transcripts.append({
            "sequence":        index,
            "content":         snippet.text.replace("\n", " ").strip(),
            "phonetic":        "",
            "vietnamese":      "",
            "start_timestamp": round(snippet.start, 3),
            "end_timestamp":   end_ts,
        })
    return transcripts


# ══════════════════════════════════════════════
# PHẦN 3 — GROQ API HELPERS
# ══════════════════════════════════════════════

def _call_deepseek(prompt: str) -> str:
    """Gọi DeepSeek đồng bộ với retry khi 429. Có throttle CALL_DELAY sau mỗi lần thành công."""
    for attempt in range(MAX_RETRIES):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2 # Temperature thấp để output JSON ổn định hơn
            )
            result = response.choices[0].message.content.strip()
            time.sleep(CALL_DELAY)  # throttle chủ động
            return result
        except RateLimitError as e:
            wait = RETRY_DELAY * (2 ** attempt)
            print(f"  ⚠ Rate limit 429. Chờ {wait}s (lần {attempt+1}/{MAX_RETRIES})...")
            time.sleep(wait)
        except APIError as e:
            raise RuntimeError(f"DeepSeek API lỗi: {e}")
            
    raise RuntimeError(f"DeepSeek API thất bại sau {MAX_RETRIES} lần thử.")


def _extract_json_array(text: str) -> list:
    match = re.search(r"```(?:json)?\s*(\[.*?\])\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    match = re.search(r"(\[.*\])", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    raise ValueError("Không tìm thấy JSON array trong response DeepSeek.")


def _extract_json_object(text: str) -> dict:
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    match = re.search(r"(\{.*\})", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    raise ValueError("Không tìm thấy JSON object trong response DeepSeek.")


# ── 3a. Description ───────────────────────────

def get_description(title: str, sample_transcript: str) -> str:
    """Tóm tắt nội dung video 2-3 câu bằng tiếng Việt."""
    prompt = (
        f'Video title: "{title}"\n'
        f"Sample transcript:\n{sample_transcript[:500]}\n\n"
        "Summarize the content of this video in 2-3 concise sentences in Vietnamese. "
        "Return ONLY the summary text, no extra formatting."
    )
    try:
        return _call_deepseek(prompt)
    except Exception as e:
        print(f"  ⚠ Không tóm tắt được description: {e}")
        return ""


# ── 3b. Level (CEFR) ──────────────────────────

def get_level(sample_transcript: str) -> str:
    """Đánh giá độ khó CEFR: A1 / A2 / B1 / B2 / C1 / C2. Mặc định B1."""
    VALID_LEVELS = {"A1", "A2", "B1", "B2", "C1", "C2"}
    prompt = (
        "Evaluate the English difficulty level of the following transcript using the CEFR scale.\n"
        "Choose exactly ONE level from: A1, A2, B1, B2, C1, C2\n"
        "- A1: Beginner  - A2: Elementary  - B1: Intermediate\n"
        "- B2: Upper-Intermediate  - C1: Advanced  - C2: Proficient\n\n"
        f"Transcript sample:\n{sample_transcript[:800]}\n\n"
        'Return ONLY a JSON object: {"level": "<A1|A2|B1|B2|C1|C2>"}'
    )
    try:
        text  = _call_deepseek(prompt)
        data  = _extract_json_object(text)
        level = str(data.get("level", "B1")).strip().upper()
        return level if level in VALID_LEVELS else "B1"
    except Exception as e:
        print(f"  ⚠ Không đánh giá được level: {e}")
        return "B1"


# ── 3c. Dịch transcript (async batch) ─────────

def _build_translate_prompt(sentences: list[str]) -> str:
    return (
        "Act as an expert movie and YouTube subtitle translator. Your task is to translate the following English sentences into Vietnamese and provide the American IPA phonetic transcription.\n\n"
        "CRITICAL RULES FOR TRANSLATION:\n"
        "1. DO NOT translate word-for-word (literal translation). Understand the context, slang, and idioms, then express them in natural, conversational Vietnamese.\n"
        "2. Make it sound like a real person speaking. (e.g., 'my man' should be 'anh bạn' instead of 'người đàn ông của tôi').\n"
        "3. If a sentence contains descriptive tags like [music], [laughter], or symbols like >>, keep them exactly as they are in the translation.\n\n"
        "Return ONLY a JSON array with exactly the same number of items as input. Do not include any other text.\n"
        "Format:\n"
        '[{"content":"<original>","vietnamese":"<translation>","phonetic":"<IPA>"}]\n\n'
        "Sentences to translate:\n" + "\n".join(sentences)
    )


async def _translate_batch_async(
    batch: list[dict],
    semaphore: asyncio.Semaphore,
    batch_index: int,
    total_batches: int,
) -> list[dict]:
    async with semaphore:
        sentences = [f"{i+1}. {item['content']}" for i, item in enumerate(batch)]
        prompt = _build_translate_prompt(sentences)

        for attempt in range(MAX_RETRIES):
            try:
                response = await asyncio.to_thread(
                    client.chat.completions.create,
                    model=MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2
                )
                text = response.choices[0].message.content.strip()

                try:
                    results = _extract_json_array(text)
                except Exception:
                    print(f"  ✗ Batch {batch_index+1}/{total_batches} JSON parse error.")
                    print(f"    Raw: {text[:200]}")
                    return batch

                for item, result in zip(batch, results):
                    item["vietnamese"] = result.get("vietnamese", "")
                    item["phonetic"]   = result.get("phonetic", "")

                print(f"  ✓ Batch {batch_index+1}/{total_batches} hoàn thành ({len(batch)} câu)")
                await asyncio.sleep(CALL_DELAY)
                return batch

            except RateLimitError as e:
                wait = RETRY_DELAY * (2 ** attempt)
                print(f"  ⚠ Rate limit batch {batch_index+1}. Chờ {wait}s (lần {attempt+1})...")
                await asyncio.sleep(wait)
            except APIError as e:
                print(f"  ✗ API error batch {batch_index+1}: {e}")
                return batch

        print(f"  ✗ Batch {batch_index+1} thất bại sau {MAX_RETRIES} lần thử.")
        return batch


async def translate_transcripts_async(transcripts: list[dict]) -> list[dict]:
    batches = [transcripts[i:i + BATCH_SIZE] for i in range(0, len(transcripts), BATCH_SIZE)]
    total = len(batches)
    print(f"  → {len(transcripts)} câu | {total} batches | concurrent={MAX_CONCURRENT}")
    semaphore = asyncio.Semaphore(MAX_CONCURRENT)
    tasks = [
        _translate_batch_async(batch, semaphore, i, total)
        for i, batch in enumerate(batches)
    ]
    await asyncio.gather(*tasks)
    return transcripts


# ══════════════════════════════════════════════
# PHẦN 4 — PIPELINE VIDEO → JSON
# ══════════════════════════════════════════════

async def build_video_json(video_url: str, category: str) -> dict:
    """Chạy toàn bộ pipeline: metadata + transcript + Groq → trả về dict."""
    print("\n" + "═"*50)
    print(f"🎬 Đang xử lý: {video_url}")
    print("═"*50)

    print("\n[1/4] Lấy metadata video...")
    metadata = get_video_metadata(video_url)
    print(f"  Title    : {metadata['title']}")
    print(f"  Duration : {metadata['duration']}s")

    print("\n[2/4] Lấy transcript...")
    transcripts = get_transcript(video_url)
    print(f"  → {len(transcripts)} câu")

    sample_text = " ".join(t["content"] for t in transcripts[:20])

    print("\n[3/4] Gọi DeepSeek: tóm tắt & đánh giá độ khó...")
    description = get_description(metadata["title"], sample_text)
    level       = get_level(sample_text)
    print(f"  Level      : {level}")
    print(f"  Description: {description[:80]}...")

    print("\n[4/4] Dịch transcript (async batch)...")
    transcripts = await translate_transcripts_async(transcripts)

    return {
        "category":      category,
        "created_at":    datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "description":   description,
        "duration":      metadata["duration"],
        "level":         level,
        "thumbnail_url": metadata["thumbnail_url"],
        "video_url":     video_url,
        "title":         metadata["title"],
        "transcripts":   transcripts,
    }


def _safe_filename(name: str) -> str:
    return re.sub(r'[\\/*?:"<>|\s]+', "_", name)[:100]


def save_json(data: dict) -> str:
    """Lưu dict ra file JSON. Trả về đường dẫn file."""
    filename    = _safe_filename(data["title"]) + ".json"
    output_file = os.path.join(OUTPUT_DIR, filename)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    return output_file


# ══════════════════════════════════════════════
# PHẦN 5 — CHUYỂN JSON → SQL
# ══════════════════════════════════════════════

def _sql_str(value) -> str:
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def _sql_float(value) -> str:
    return "NULL" if value is None else str(float(value))


def _sql_int(value) -> str:
    return "NULL" if value is None else str(int(value))


def generate_sql(data: dict) -> str:
    category_name = data.get("category", "Uncategorized")
    title         = data.get("title", "")
    description   = data.get("description", "")
    video_url     = data.get("video_url", "")
    thumbnail_url = data.get("thumbnail_url", "")
    level         = data.get("level", "B1")
    duration      = data.get("duration", 0)
    created_at    = data.get("created_at", "")
    transcripts   = data.get("transcripts", [])

    lines = [
        "-- ================================================",
        f"-- Generated by video_pipeline.py (DeepSeek Version)",
        f"-- Source title : {title}",
        f"-- Generated at : {datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}",
        "-- ================================================",
        "",
        "BEGIN;",
        "",

        # [1] Category
        "-- [1] Thêm category (bỏ qua nếu đã tồn tại)",
        f"INSERT INTO categories (name)",
        f"VALUES ({_sql_str(category_name)})",
        f"ON CONFLICT (name) DO NOTHING;",
        "",

        # [2] Lesson
        "-- [2] Thêm lesson",
        "INSERT INTO lessons",
        "    (category_id, title, description, video_url, thumbnail_url, level, duration, created_at)",
        "VALUES (",
        f"    (SELECT id FROM categories WHERE name = {_sql_str(category_name)} LIMIT 1),",
        f"    {_sql_str(title)},",
        f"    {_sql_str(description)},",
        f"    {_sql_str(video_url)},",
        f"    {_sql_str(thumbnail_url)},",
        f"    {_sql_str(level)},",
        f"    {_sql_float(duration)},",
        f"    {_sql_str(created_at)}::timestamptz",
        ");",
        "",
    ]

    # [3] Transcripts
    if transcripts:
        lines.append(f"-- [3] Thêm {len(transcripts)} transcripts")
        lines.append(
            "INSERT INTO transcripts\n"
            "    (lesson_id, sequence, content, phonetic, vietnamese, start_timestamp, end_timestamp)\n"
            "VALUES"
        )
        lesson_subquery = f"(SELECT id FROM lessons WHERE video_url = {_sql_str(video_url)} LIMIT 1)"
        rows = []
        for t in transcripts:
            rows.append(
                f"    ({lesson_subquery}, "
                f"{_sql_int(t.get('sequence'))}, "
                f"{_sql_str(t.get('content', ''))}, "
                f"{_sql_str(t.get('phonetic', ''))}, "
                f"{_sql_str(t.get('vietnamese', ''))}, "
                f"{_sql_float(t.get('start_timestamp', 0))}, "
                f"{_sql_float(t.get('end_timestamp', 0))})"
            )
        lines.append(",\n".join(rows) + ";")
    else:
        lines.append("-- [3] Không có transcript.")

    lines += ["", "COMMIT;", ""]
    return "\n".join(lines)


def save_sql(data: dict) -> str:
    filename    = _safe_filename(data["title"]) + ".sql"
    output_file = os.path.join(SQL_DIR, filename)
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(generate_sql(data))
    return output_file


# ══════════════════════════════════════════════
# PHẦN 6 — ENTRY POINT
# ══════════════════════════════════════════════

def input_url_list() -> list[str]:
    print("\nNhập các YouTube URL (1 URL mỗi dòng).")
    print("Nhấn Enter trên dòng trống để bắt đầu xử lý:\n")
    urls = []
    while True:
        line = input(f"  URL {len(urls)+1}: ").strip()
        if not line:
            if not urls:
                print("  ⚠ Chưa có URL nào, vui lòng nhập ít nhất 1 URL.")
                continue
            break
        if not line.startswith("http"):
            print("  ⚠ URL không hợp lệ, bỏ qua.")
            continue
        urls.append(line)
    return urls


async def main():
    print("📁 JSON  folder:", OUTPUT_DIR)
    print("📁 SQL   folder:", SQL_DIR)

    while True:
        print("\n" + "═"*50)

        category = input("Category (vd: English Learning, Science... | q để thoát): ").strip()
        if category.lower() == "q":
            break
        if not category:
            category = "Uncategorized"

        urls = input_url_list()
        print(f"\n🚀 Bắt đầu xử lý {len(urls)} video | Category: \"{category}\"")

        success, failed = 0, []

        for idx, url in enumerate(urls, start=1):
            print(f"\n[{idx}/{len(urls)}] {url}")
            try:
                data = await build_video_json(url, category)

                json_file = save_json(data)
                print(f"  💾 JSON : {json_file}")

                sql_file = save_sql(data)
                print(f"  💾 SQL  : {sql_file}")

                success += 1

            except RuntimeError as e:
                print(f"  ❌ Lỗi: {e}")
                failed.append((url, str(e)))
            except Exception as e:
                print(f"  ❌ Lỗi không xác định: {e}")
                failed.append((url, str(e)))

        print("\n" + "═"*50)
        print(f"📊 Kết quả: {success}/{len(urls)} video thành công")
        if failed:
            print(f"   ❌ Thất bại ({len(failed)} video):")
            for url, reason in failed:
                print(f"      • {url}")
                print(f"        → {reason}")

        again = input("\nXử lý thêm batch khác? (Enter để tiếp / q để thoát): ").strip()
        if again.lower() == "q":
            break

    print("\n👋 Thoát.")


def get_db_connection():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        return psycopg2.connect(database_url)

    port = os.getenv("DB_PORT", "5432")
    return psycopg2.connect(
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=port,
        database=os.getenv("DB_DATABASE")
    )


def get_category_name(category_id: int) -> str:
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT name FROM categories WHERE id = %s", (category_id,))
            row = cur.fetchone()
            if row:
                return row[0]
    except Exception as e:
        print(f"Error fetching category name: {e}")
    finally:
        conn.close()
    return "Uncategorized"


def save_to_db(data: dict, category_id: int) -> dict:
    conn = get_db_connection()
    try:
        with conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Insert lesson
                cur.execute(
                    """
                    INSERT INTO lessons 
                    (category_id, title, description, video_url, thumbnail_url, level, duration, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s::timestamptz)
                    RETURNING *;
                    """,
                    (
                        category_id,
                        data["title"],
                        data["description"],
                        data["video_url"],
                        data["thumbnail_url"],
                        data["level"],
                        float(data["duration"]),
                        data["created_at"]
                    )
                )
                lesson = cur.fetchone()
                lesson_id = lesson["id"]

                # Insert transcripts
                transcripts = data.get("transcripts", [])
                if transcripts:
                    for t in transcripts:
                        cur.execute(
                            """
                            INSERT INTO transcripts
                            (lesson_id, sequence, content, phonetic, vietnamese, start_timestamp, end_timestamp)
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """,
                            (
                                lesson_id,
                                int(t.get("sequence")),
                                t.get("content", ""),
                                t.get("phonetic", ""),
                                t.get("vietnamese", ""),
                                float(t.get("start_timestamp", 0.0)),
                                float(t.get("end_timestamp", 0.0))
                            )
                        )
                
                # Convert datetime to string
                if lesson.get("created_at"):
                    lesson["created_at"] = lesson["created_at"].isoformat()
                return dict(lesson)
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


async def run_cli():
    parser = argparse.ArgumentParser(description="Import lesson from YouTube to DB")
    parser.add_argument("--cli", action="store_true")
    parser.add_argument("--category-id", type=int, required=True)
    parser.add_argument("--url", type=str, required=True)
    args = parser.parse_args()

    category_name = get_category_name(args.category_id)
    data = await build_video_json(args.url, category_name)
    lesson = save_to_db(data, args.category_id)
    _original_print(json.dumps(lesson, ensure_ascii=False))


if __name__ == "__main__":
    if IS_CLI:
        asyncio.run(run_cli())
    else:
        asyncio.run(main())