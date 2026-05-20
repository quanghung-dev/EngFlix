const { Pool } = require('pg');
const pool = require('../db/index');
const { errorResponse } = require('../utils/response');

const getVocabulary = async ( limit, offset) => {
    const dataQuery = `SELECT * FROM vocabulary_categories ORDER BY id ASC LIMIT $1 OFFSET $2`;
    const countQuery = 'SELECT COUNT(*) FROM vocabulary_categories';
    const [dataResult , countResult ] = await Promise.all([
        pool.query(dataQuery,[limit,offset]),
        pool.query(countQuery)
    ]) 
    return {
        data: dataResult.rows,
        totalCount: parseInt(countResult.rows[0].count)
    }
}

const createVocabularyCategory = async (name, description) => {
    const query = 'INSERT INTO vocabulary_categories (name, description) VALUES ($1,$2) RETURNING *';
    const result = await pool.query(query, [name, description]);
    return result.rows[0];
};

const getVocabularyCategorybyCategory = async (id) => {
    const query = 'SELECT * FROM vocabulary_categories WHERE id = $1'
    const result = await pool.query(query,[id]);
    return result.rows[0];
};

const updateVocabularyCategory = async (id,name, description) => {
    const query = 'UPDATE vocabulary_categories SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *'
    const result = await pool.query(query,[name,description,id]);
    return result.rows[0];
};

const deleteVocabularyCategory = async (id) => {
    const query = 'DELETE FROM vocabulary_categories WHERE id = $1 RETURNING *'
    const result = await pool.query(query,[id]);
    return result.rows[0];
};
module.exports = {
    getVocabulary,
    createVocabularyCategory,
    getVocabularyCategorybyCategory,
    updateVocabularyCategory,
    deleteVocabularyCategory
}
