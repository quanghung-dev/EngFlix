const pool = require('../db/index');

const getAccessibleDeck = async (deckId, userId = null) => {
    const query = `
        SELECT id, user_id, is_default
        FROM vocabulary_decks
        WHERE id = $1
          AND (is_default = true OR (is_default = false AND user_id = $2))
        LIMIT 1
    `;
    const result = await pool.query(query, [deckId, userId]);
    return result.rows[0] || null;
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

const addVocabularyItems = async (userId, deckId, item) => {
    const query = `
        INSERT INTO vocabulary_items (
            deck_id,
            lesson_id,
            transcript_id,
            phrase,
            normalized_phrase,
            meaning,
            example_sentence,
            example_translation,
            note,
            source_sentence
        )
        SELECT $1, $2, $3, $4, $5, $6, $7, $11, $8, $10
        FROM vocabulary_decks
        WHERE id = $1
          AND user_id = $9
          AND is_default = false
        ON CONFLICT (deck_id, normalized_phrase)
        DO UPDATE SET
            meaning = EXCLUDED.meaning,
            example_sentence = EXCLUDED.example_sentence,
            example_translation = EXCLUDED.example_translation,
            note = EXCLUDED.note,
            source_sentence = EXCLUDED.source_sentence,
            updated_at = NOW()
        RETURNING *
    `;
    const values = [
        deckId,
        item.lesson_id ?? null,
        item.transcript_id ?? null,
        item.phrase,
        item.normalized_phrase,
        item.meaning,
        item.example_sentence ?? null,
        item.note ?? null,
        userId,
        item.source_sentence ?? null,
        item.example_translation ?? null
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateVocabularyItems = async (userId, deckId, itemId, item) => {
    const query = `
        UPDATE vocabulary_items
        SET lesson_id = $1,
            transcript_id = $2,
            phrase = $3,
            normalized_phrase = $4,
            meaning = $5,
            example_sentence = $6,
            example_translation = $12,
            note = $7,
            source_sentence = $11,
            updated_at = NOW()
        FROM vocabulary_decks vd
        WHERE vocabulary_items.id = $8
          AND vocabulary_items.deck_id = $9
          AND vd.id = vocabulary_items.deck_id
          AND vd.user_id = $10
          AND vd.is_default = false
        RETURNING vocabulary_items.*
    `;
    const values = [
        item.lesson_id ?? null,
        item.transcript_id ?? null,
        item.phrase,
        item.normalized_phrase,
        item.meaning,
        item.example_sentence ?? null,
        item.note ?? null,
        itemId,
        deckId,
        userId,
        item.source_sentence ?? null,
        item.example_translation ?? null
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteVocabularyItems = async (userId, deckId, itemId) => {
    const query = `
        DELETE FROM vocabulary_items
        USING vocabulary_decks vd
        WHERE vocabulary_items.id = $1
          AND vocabulary_items.deck_id = $2
          AND vd.id = vocabulary_items.deck_id
          AND vd.user_id = $3
          AND vd.is_default = false
        RETURNING vocabulary_items.*
    `;
    const result = await pool.query(query, [itemId, deckId, userId]);
    return result.rows[0];
};

const FALLBACK_QUIZ_WORDS = [
    { phrase: 'noticed', meaning: 'nhận thấy, chú ý' },
    { phrase: 'vision', meaning: 'tầm nhìn, thị lực' },
    { phrase: 'evil', meaning: 'xấu xa, tà ác' },
    { phrase: 'floaty', meaning: 'vật trôi nổi' },
    { phrase: 'trailer', meaning: 'đoạn giới thiệu phim' },
    { phrase: 'swimming', meaning: 'bơi lội' },
    { phrase: 'land', meaning: 'vùng đất' },
    { phrase: 'west', meaning: 'phía tây' },
    { phrase: 'notified', meaning: 'được thông báo' },
    { phrase: 'completed', meaning: 'hoàn thành' },
    { phrase: 'pronunciation', meaning: 'phát âm' },
    { phrase: 'dictation', meaning: 'nghe chép chính tả' },
    { phrase: 'shadowing', meaning: 'luyện nói nhại' },
    { phrase: 'vocabulary', meaning: 'từ vựng' }
];

const normalizeQuizText = (value) => String(value || '').trim().toLocaleLowerCase('vi');

const shuffle = (items) => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
};

const getUniqueQuizWords = (words) => {
    const seen = new Set();
    return words.filter((word) => {
        const phrase = normalizeQuizText(word.phrase);
        const meaning = normalizeQuizText(word.meaning);
        const key = `${phrase}\u0000${meaning}`;
        if (!phrase || !meaning || seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
};

const getUniqueQuizQuestions = (words) => {
    const seenPhrases = new Set();
    return getUniqueQuizWords(words).filter((word) => {
        const phrase = normalizeQuizText(word.phrase);
        if (seenPhrases.has(phrase)) {
            return false;
        }
        seenPhrases.add(phrase);
        return true;
    });
};

const buildQuizChoices = (word, distractors) => {
    const correctAnswer = String(word.meaning).trim();
    const normalizedPhrase = normalizeQuizText(word.phrase);
    const seenMeanings = new Set([normalizeQuizText(correctAnswer)]);
    const uniqueDistractors = [];

    for (const distractor of shuffle(distractors)) {
        if (normalizeQuizText(distractor.phrase) === normalizedPhrase) {
            continue;
        }
        const meaning = String(distractor.meaning || '').trim();
        const normalizedMeaning = normalizeQuizText(meaning);
        if (!normalizedMeaning || seenMeanings.has(normalizedMeaning)) {
            continue;
        }
        seenMeanings.add(normalizedMeaning);
        uniqueDistractors.push(meaning);
        if (uniqueDistractors.length === 3) {
            break;
        }
    }

    return shuffle([correctAnswer, ...uniqueDistractors]);
};

const getUserVocabularyForQuiz = async (userId) => {
    const [userResult, publicResult] = await Promise.all([
        pool.query(
            `
                SELECT vi.id, vi.phrase, vi.meaning, vi.example_sentence, vi.example_translation, vi.note
                FROM vocabulary_items vi
                JOIN vocabulary_decks vd ON vi.deck_id = vd.id
                WHERE vd.user_id = $1
                  AND vd.is_default = false
                ORDER BY vi.id ASC
            `,
            [userId]
        ),
        pool.query(`
            SELECT vi.id, vi.phrase, vi.meaning, vi.example_sentence, vi.example_translation, vi.note
            FROM vocabulary_items vi
            JOIN vocabulary_decks vd ON vi.deck_id = vd.id
            WHERE vd.is_default = true
            ORDER BY vi.id ASC
            LIMIT 100
        `)
    ]);

    const personalWords = getUniqueQuizQuestions(userResult.rows);
    const publicWords = getUniqueQuizQuestions(publicResult.rows);
    const source = personalWords.length > 0 ? 'personal' : 'sample';
    const sourceWords = source === 'personal'
        ? personalWords
        : (publicWords.length > 0 ? publicWords : FALLBACK_QUIZ_WORDS);
    const allDistractors = getUniqueQuizWords([
        ...personalWords,
        ...publicWords,
        ...FALLBACK_QUIZ_WORDS
    ]);

    const questions = shuffle(sourceWords)
        .slice(0, 10)
        .map((word, index) => ({
            id: word.id ?? -(index + 1),
            phrase: String(word.phrase).trim(),
            meaning: String(word.meaning).trim(),
            note: word.note || 'từ vựng',
            example_sentence: word.example_sentence || '',
            example_translation: word.example_translation || '',
            choices: buildQuizChoices(word, allDistractors)
        }));

    return { questions, source };
};

const reviewItem = async (userId, deckId, itemId, isCorrect) => {
    const checkQuery = `
        SELECT vi.*
        FROM vocabulary_items vi
        JOIN vocabulary_decks vd ON vi.deck_id = vd.id
        WHERE vi.id = $1
          AND vi.deck_id = $2
          AND vd.user_id = $3
    `;
    const checkResult = await pool.query(checkQuery, [itemId, deckId, userId]);
    if (checkResult.rows.length === 0) return null;

    const item = checkResult.rows[0];

    let reviewInterval = item.review_interval || 1;
    let easeFactor = item.ease_factor || 2.5;
    let correctCount = item.correct_count || 0;
    let incorrectCount = item.incorrect_count || 0;

    if (isCorrect) {
        correctCount += 1;
        if (correctCount === 1) {
            reviewInterval = 1;
        } else if (correctCount === 2) {
            reviewInterval = 6;
        } else {
            reviewInterval = Math.round(reviewInterval * easeFactor);
        }
        easeFactor = easeFactor + 0.1;
    } else {
        incorrectCount += 1;
        correctCount = 0;
        reviewInterval = 1;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
    }

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + reviewInterval);

    const updateQuery = `
        UPDATE vocabulary_items
        SET review_interval = $1,
            ease_factor = $2,
            correct_count = $3,
            incorrect_count = $4,
            next_review_at = $5,
            updated_at = NOW()
        WHERE id = $6
        RETURNING *
    `;
    const updateValues = [
        reviewInterval,
        easeFactor,
        correctCount,
        incorrectCount,
        nextReviewAt.toISOString(),
        itemId
    ];
    const updateResult = await pool.query(updateQuery, updateValues);
    return updateResult.rows[0];
};

module.exports = {
    getAccessibleDeck,
    getVocabularyItems,
    addVocabularyItems,
    updateVocabularyItems,
    deleteVocabularyItems,
    getUserVocabularyForQuiz,
    reviewItem
};
