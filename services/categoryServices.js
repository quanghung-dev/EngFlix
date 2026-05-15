const { AppError } = require('../utils/AppError');
const pool = require('../db/index.js');


const getAllCategories = async (limit, offset) => {
    const categoriesQuery = 'SELECT * FROM categories LIMIT $1 OFFSET $2';
    const totalCountQuery = 'SELECT COUNT(*) FROM categories';

    const [categoriesResult, totalCountResult] = await Promise.all([
        pool.query(categoriesQuery, [limit, offset]),
        pool.query(totalCountQuery)
    ]);

    return {
        categories: categoriesResult.rows,
        totalCount: parseInt(totalCountResult.rows[0].count)
    };
};

const getCategoryById = async (id) => {
    const query = 'SELECT * FROM categories WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const createCategory = async (name) => {
    const query = 'INSERT INTO categories (name) VALUES ($1) RETURNING *';
    const result  = await pool.query(query,[name]);
    return result.rows[0];
};
const updateCategory = async (id, name) => {   
    const query = 'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [name, id]);
    return result.rows[0];
};
const deleteCategory = async (id) => {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
        return false;
    }
    return true;
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
