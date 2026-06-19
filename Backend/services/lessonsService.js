const pool = require('../db/index');
const { AppError } = require('../utils/AppError');
const { spawn } = require('child_process');
const path = require('path');



const getLessons = async (category_id, level, search, limit, offset) => {
    let dataQuery = 'SELECT * FROM lessons';
    let countQuery = 'SELECT COUNT(*) FROM lessons';
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    if (category_id) {
        conditions.push(`category_id = $${paramIndex++}`);
        values.push(category_id);
    }
    if (level) {
        conditions.push(`level = $${paramIndex++}`);
        values.push(level);
    }

    if (search) {
        conditions.push(`title ILIKE $${paramIndex++}`);
        values.push(`%${search}%`); 
    }
    let whereClause = '';
    if (conditions.length > 0) {
        whereClause = ' WHERE ' + conditions.join(' AND ');
    }
    const finalCountQuery = countQuery + whereClause;
    const finalDataQuery = `${dataQuery} ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    const dataValues = [...values, limit, offset];
    const [lessonsResult, totalCountResult] = await Promise.all([
        pool.query(finalDataQuery, dataValues),
        pool.query(finalCountQuery, values)
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
        return false;
    }
    return true;
};

const createLessonFromYoutube = async (categoryId, youtubeUrl) => {
    // 1. Check if the lesson already exists in this category
    const videoIdMatch = youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        const checkQuery = 'SELECT * FROM lessons WHERE category_id = $1 AND video_url LIKE $2';
        const checkResult = await pool.query(checkQuery, [categoryId, `%${videoId}%`]);
        if (checkResult.rows.length > 0) {
            return checkResult.rows[0];
        }
    } else {
        const checkQuery = 'SELECT * FROM lessons WHERE category_id = $1 AND video_url = $2';
        const checkResult = await pool.query(checkQuery, [categoryId, youtubeUrl]);
        if (checkResult.rows.length > 0) {
            return checkResult.rows[0];
        }
    }

    // 2. If not, spawn Python script
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../utils/FetchTranscripts.py');
        const pythonProcess = spawn('python', [
            scriptPath,
            '--cli',
            '--category-id',
            categoryId.toString(),
            '--url',
            youtubeUrl
        ]);

        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
            process.stderr.write(data);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new AppError(`Lỗi xử lý video: ${stderrData.trim() || `Thoát với mã lỗi ${code}`}`, 500));
            }
            try {
                const jsonMatch = stdoutData.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    return reject(new AppError('Không nhận được kết quả JSON từ script Python', 500));
                }
                const lesson = JSON.parse(jsonMatch[0]);
                resolve(lesson);
            } catch (err) {
                reject(new AppError(`Lỗi phân tích kết quả từ script Python: ${err.message}`, 500));
            }
        });
    });
};

module.exports = {
    getLessons,
    getAllLessons,
    getLessonsByCategory,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
    createLessonFromYoutube
};

