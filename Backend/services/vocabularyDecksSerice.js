const { Pool } = require('pg');
const pool = require('../db/index');
const { errorResponse } = require('../utils/response');
const getVocabularyDecks = async (category_id, limit, offset) => {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (category_id) {
        conditions.push(`category_id = $${paramIndex++}`);
        values.push(category_id);
    }

    const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    const dataQuery = `SELECT * FROM vocabulary_decks ${whereClause} ORDER BY id ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    const countQuery = `SELECT COUNT(*) FROM vocabulary_decks ${whereClause}`;

    const [dataResult, countResult] = await Promise.all([
        pool.query(dataQuery, [...values, limit, offset]),
        pool.query(countQuery, values)
    ]);

    return {
        result: dataResult.rows,
        totalCount: parseInt(countResult.rows[0].count)
    };
};

const createVocabularyDecks = async (category_id, name, description, level, thumbnail_url) => {
    const query = 'INSERT INTO vocabulary_decks (category_id, name, description, level, thumbnail_url) VALUES ($1,$2,$3,$4,$5) RETURNING *'
    const result = await pool.query(query,[category_id || null, name, description, level, thumbnail_url])
    return result.rows[0];
};

const upadteVocabularyDecks = async (id, name, description, level, thumbnail_url) => {
    const query = `
        UPDATE vocabulary_decks
        SET name = $1,
            description = $2,
            level = $3,
            thumbnail_url = $4,
            updated_at = NOW()
        WHERE id = $5
        RETURNING *
    `;
    const result = await pool.query(query, [name, description, level, thumbnail_url, id]);
    return result.rows[0];
};

const deleteVocabularyDecks = async (id) => {
    const query = 'DELETE FROM vocabulary_decks WHERE id = $1 RETURNING *'
    const result = await pool.query(query,[id])
    return result.rows[0]
};
module.exports = {
getVocabularyDecks,
createVocabularyDecks,
upadteVocabularyDecks,
deleteVocabularyDecks
}
