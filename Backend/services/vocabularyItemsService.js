const pool = require('../db/index');

const deckExists = async (deckId) => {
    const query = 'SELECT 1 FROM vocabulary_decks WHERE id = $1 LIMIT 1';
    const result = await pool.query(query, [deckId]);
    return result.rows.length > 0;
};

const getVocabularyItems = async (deckId, limit, offset) => {
    const dataQuery = `
        SELECT *
        FROM vocabulary_items
        WHERE deck_id = $1
        ORDER BY id ASC
        LIMIT $2 OFFSET $3
    `;
    const countQuery = 'SELECT COUNT(*) FROM vocabulary_items WHERE deck_id = $1';

    const [dataResult, countResult] = await Promise.all([
        pool.query(dataQuery, [deckId, limit, offset]),
        pool.query(countQuery, [deckId])
    ]);

    return {
        result: dataResult.rows,
        totalCount: parseInt(countResult.rows[0].count, 10)
    };
};

const addVocabularyItems = async (deckId, { lesson_id, transcript_id, phrase, normalized_phrase, meaning, example_sentence, note }) => {
    const query = `
        INSERT INTO vocabulary_items (
            deck_id,
            lesson_id,
            transcript_id,
            phrase,
            normalized_phrase,
            meaning,
            example_sentence,
            note
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;
    const values = [
        deckId,
        lesson_id ?? null,
        transcript_id ?? null,
        phrase,
        normalized_phrase,
        meaning,
        example_sentence ?? null,
        note ?? null
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateVocabularyItems = async (deckId, itemId, { lesson_id, transcript_id, phrase, normalized_phrase, meaning, example_sentence, note }) => {
    const query = `
        UPDATE vocabulary_items
        SET lesson_id = $1,
            transcript_id = $2,
            phrase = $3,
            normalized_phrase = $4,
            meaning = $5,
            example_sentence = $6,
            note = $7,
            updated_at = NOW()
        WHERE id = $8 AND deck_id = $9
        RETURNING *
    `;
    const values = [
        lesson_id ?? null,
        transcript_id ?? null,
        phrase,
        normalized_phrase,
        meaning,
        example_sentence ?? null,
        note ?? null,
        itemId,
        deckId
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteVocabularyItems = async (deckId, itemId) => {
    const query = 'DELETE FROM vocabulary_items WHERE id = $1 AND deck_id = $2 RETURNING *';
    const result = await pool.query(query, [itemId, deckId]);
    return result.rows[0];
};

const getUserVocabularyForQuiz = async (userId) => {
    // 1. Lấy tất cả từ vựng của user này
    const query = `
        SELECT vi.id, vi.phrase, vi.meaning, vi.example_sentence, vi.note
        FROM vocabulary_items vi
        JOIN vocabulary_decks vd ON vi.deck_id = vd.id
        WHERE vd.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    const userWords = result.rows;

    // 2. Lấy danh sách từ vựng hệ thống hoặc từ vựng của người khác làm đáp án nhiễu (distractors)
    const distractorQuery = `
        SELECT phrase, meaning 
        FROM vocabulary_items 
        LIMIT 100
    `;
    const distractorResult = await pool.query(distractorQuery);
    const databaseWords = distractorResult.rows;

    // Danh sách từ dự phòng khẩn cấp nếu database trống
    const fallbackDistractors = [
        { phrase: "noticed", meaning: "nhận thấy, chú ý" },
        { phrase: "vision", meaning: "tầm nhìn, thị lực" },
        { phrase: "evil", meaning: "thế lực tà ác, xấu xa" },
        { phrase: "floaty", meaning: "vật trôi nổi" },
        { phrase: "trailer", meaning: "đoạn giới thiệu phim" },
        { phrase: "swimming", meaning: "bơi lội" },
        { phrase: "land", meaning: "vùng đất" },
        { phrase: "west", meaning: "phía tây" },
        { phrase: "notified", meaning: "thông báo" },
        { phrase: "completed", meaning: "hoàn thành" },
        { phrase: "pronunciation", meaning: "phát âm" },
        { phrase: "dictation", meaning: "chính tả, nghe chép" },
        { phrase: "shadowing", meaning: "nhại giọng" },
        { phrase: "vocabulary", meaning: "từ vựng" }
    ];

    const allDistractors = [...databaseWords, ...fallbackDistractors];

    // Tạo bộ câu hỏi trắc nghiệm (Tối đa 10 câu)
    // Nếu người dùng có ít hơn 1 câu, ta dùng luôn từ dự phòng để làm câu hỏi!
    const sourceWords = userWords.length > 0 ? userWords : fallbackDistractors.slice(0, 10);
    
    // Shuffle câu hỏi
    const shuffledSource = sourceWords.sort(() => 0.5 - Math.random()).slice(0, 10);

    const questions = shuffledSource.map(word => {
        // Lọc ra các nghĩa dịch khác với nghĩa của từ hiện tại
        const filteredDistractors = allDistractors
            .filter(d => d.phrase.toLowerCase() !== word.phrase.toLowerCase() && d.meaning !== word.meaning)
            .map(d => d.meaning);

        // Lấy ngẫu nhiên 3 nghĩa dịch nhiễu
        const randomDistractors = filteredDistractors
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        // Trộn đáp án đúng vào 3 đáp án nhiễu
        const choices = [word.meaning, ...randomDistractors]
            .sort(() => 0.5 - Math.random());

        return {
            id: word.id || Math.floor(Math.random() * 10000),
            phrase: word.phrase,
            meaning: word.meaning,
            note: word.note || "từ vựng",
            example_sentence: word.example_sentence || "",
            choices
        };
    });

    return questions;
};

module.exports = {
    deckExists,
    getVocabularyItems,
    addVocabularyItems,
    updateVocabularyItems,
    deleteVocabularyItems,
    getUserVocabularyForQuiz
};
