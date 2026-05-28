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


module.exports = {
    deckExists,
    getVocabularyItems,
    addVocabularyItems,
    updateVocabularyItems,
    deleteVocabularyItems
};
