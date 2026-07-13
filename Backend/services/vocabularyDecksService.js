const pool = require('../db/index');
const getVocabularyDecks = async (category_id, limit, offset) => {
    const conditions = ['is_default = true'];
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

const getVocabularyDecksByUserId = async (userId, limit, offset) => {
    const dataQuery = `
        SELECT *
        FROM vocabulary_decks
        WHERE user_id = $1
          AND is_default = false
        ORDER BY id ASC
        LIMIT $2 OFFSET $3
    `;
    const countQuery = `
        SELECT COUNT(*)
        FROM vocabulary_decks
        WHERE user_id = $1
          AND is_default = false
    `;

    const [dataResult, countResult] = await Promise.all([
        pool.query(dataQuery, [userId, limit, offset]),
        pool.query(countQuery, [userId])
    ]);

    return {
        result: dataResult.rows,
        totalCount: parseInt(countResult.rows[0].count)
    };
};

const createVocabularyDecks = async (userId, category_id, name, description, level, thumbnail_url) => {
    const query = `
        INSERT INTO vocabulary_decks (user_id, category_id, name, description, level, thumbnail_url, is_default)
        VALUES ($1,$2,$3,$4,$5,$6,false)
        RETURNING *
    `
    const result = await pool.query(query,[userId, category_id || null, name, description, level, thumbnail_url])
    return result.rows[0];
};

const updateVocabularyDecks = async (userId, id, name, description, level, thumbnail_url) => {
    const query = `
        UPDATE vocabulary_decks
        SET name = $1,
            description = $2,
            level = $3,
            thumbnail_url = $4,
            updated_at = NOW()
        WHERE id = $5
          AND user_id = $6
          AND is_default = false
        RETURNING *
    `;
    const result = await pool.query(query, [name, description, level, thumbnail_url, id, userId]);
    return result.rows[0];
};

const deleteVocabularyDecks = async (userId, id) => {
    const query = `
        DELETE FROM vocabulary_decks
        WHERE id = $1
          AND user_id = $2
          AND is_default = false
        RETURNING *
    `;
    const result = await pool.query(query, [id, userId]);
    return result.rows[0]
};
module.exports = {
getVocabularyDecks,
getVocabularyDecksByUserId,
createVocabularyDecks,
updateVocabularyDecks,
deleteVocabularyDecks
}
