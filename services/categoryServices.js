const { AppError } = require('../utils/AppError');
const pool = require('../db/index.js');


const getAllCategories = async () => {
    const query = 'SELECT * FROM categories';
    const result = await pool.query(query);
    return result.rows; 
};

const getCategoryById = async (id) => {
    const query = 'SELECT * FROM categories WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
        throw new AppError('Khong tim thay danh muc nay', 404);
    }
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
    if (result.rows.length === 0) {
        throw new AppError('Không tìm thấy danh mục này', 404);
    }
    return result.rows[0];
};
const deleteCategory = async (id) => {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
        throw new AppError('Không tìm thấy danh mục này', 404);
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
