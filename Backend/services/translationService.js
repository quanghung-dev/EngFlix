const OpenAI = require("openai");

const apiKey = process.env.DEEPSEEK_API_KEY;

// Khởi tạo client OpenAI kết nối sang API DeepSeek
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: apiKey || 'dummy-key', // tránh lỗi crash khi khởi chạy nếu thiếu key
});

const translateWordWithAI = async (word) => {
    if (!apiKey) {
        // Fallback khẩn cấp nếu chưa cấu hình API key
        return {
            phrase: word,
            phonetic: "/.../",
            meaning: "Nghĩa dịch (Chưa cấu hình API Key DeepSeek)",
            note: "N/A",
            example_sentence: "Please configure DEEPSEEK_API_KEY in .env file.",
            example_translation: "Vui lòng cấu hình DEEPSEEK_API_KEY trong tệp .env."
        };
    }

    try {
        const prompt = `
You are a bilingual English-Vietnamese dictionary assistant.
Translate the English word/phrase: "${word}".
Provide the IPA phonetic, part of speech/note, Vietnamese meaning, an English example sentence containing this word, and the Vietnamese translation of the example sentence.

Return ONLY a raw JSON object matching this structure:
{
  "phrase": "${word}",
  "phonetic": "phonetic symbol between slashes /.../",
  "meaning": "Vietnamese translation",
  "note": "part of speech (e.g. verb, noun, adjective)",
  "example_sentence": "an example sentence in English",
  "example_translation": "Vietnamese translation of the example sentence"
}

Do not include any markdown format like \`\`\`json, do not write any introductory or concluding text. Return only the JSON object.
`;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a precise dictionary JSON generator." },
                { role: "user", content: prompt }
            ],
            model: "deepseek-chat", // or deepseek-v4-flash, using standard deepseek-chat
            stream: false,
            temperature: 0.1
        });

        const text = completion.choices[0].message.content.trim();
        
        // Làm sạch mã markdown nếu AI lỡ trả về ```json ... ```
        const cleanJsonText = text
            .replace(/^```json/i, '')
            .replace(/^```/i, '')
            .replace(/```$/i, '')
            .trim();

        const data = JSON.parse(cleanJsonText);
        return data;
    } catch (error) {
        console.error("AI translation error:", error);
        // Fallback nếu có lỗi API
        return {
            phrase: word,
            phonetic: "/.../",
            meaning: "Dịch tự động",
            note: "Từ vựng",
            example_sentence: `This is an example containing the word ${word}.`,
            example_translation: `Đây là ví dụ chứa từ ${word}.`
        };
    }
};

module.exports = {
    translateWordWithAI
};
