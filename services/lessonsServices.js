const pool = require('../db/index');
const { AppError } = require('../utils/AppError');


const getLessons = async (category_id, level, limit, offset) => {
    const conditions = [];
    const values = [];

    if (category_id) {
        values.push(category_id);
        conditions.push(`category_id = $${values.length}`);
    }

    if (level) {
        values.push(level);
        conditions.push(`level = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const totalCountQuery = `SELECT COUNT(*) FROM lessons ${whereClause}`;

    values.push(limit);
    const limitParamIndex = values.length;
    values.push(offset);
    const offsetParamIndex = values.length;

    const lessonsQuery = `
        SELECT *
        FROM lessons
        ${whereClause}
        ORDER BY id ASC
        LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
    `;

    const [lessonsResult, totalCountResult] = await Promise.all([
        pool.query(lessonsQuery, values),
        pool.query(totalCountQuery, values.slice(0, values.length - 2))
    ]);

    return {
        lessons: lessonsResult.rows,
        totalCount: parseInt(totalCountResult.rows[0].count)
    };
};

const getAllLessons = async () => {
    const query = 'SELECT * FROM lessons';
    const result = await pool.query(query);
    return result.rows;
};

const getLessonsByCategory = async (categoryId, limit, offset) => {
    const lessonsQuery = 'SELECT * FROM lessons WHERE category_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    const totalCountQuery = 'SELECT COUNT(*) FROM lessons WHERE category_id = $1';
    const [lessonsResult, totalCountResult] = await Promise.all([
        pool.query(lessonsQuery, [categoryId, limit, offset]),
        pool.query(totalCountQuery, [categoryId])
    ]);

    return {
        lessons: lessonsResult.rows,
        totalCount: parseInt(totalCountResult.rows[0].count)
    };
};

const getLessonById = async (id) => {
    const query = 'SELECT * FROM lessons WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
        throw new AppError('Không tìm thấy bài học này', 404);
    }
    return result.rows[0];
};

const createLesson = async ({ category_id, title, video_url, description }) => {
    const query = 'INSERT INTO lessons (category_id, title, video_url, description) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await pool.query(query, [category_id, title, video_url, description]);
    return result.rows[0];
};

const updateLesson = async (id, { category_id, title, video_url, description }) => {
    const query = 'UPDATE lessons SET category_id = $1, title = $2, video_url = $3, description = $4 WHERE id = $5 RETURNING *';
    const result = await pool.query(query, [category_id, title, video_url, description, id]);
    if (result.rows.length === 0) {
        throw new AppError('Không tìm thấy bài học để cập nhật', 404);
    }
    return result.rows[0];
};

const deleteLesson = async (id) => {
    const query = 'DELETE FROM lessons WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);       
    if (result.rows.length === 0) {
        throw new AppError('Không tìm thấy bài học để xóa', 404);
    }
    return result.rows[0];
};

module.exports = {
    getLessons,
    getAllLessons,
    getLessonsByCategory,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson
};
