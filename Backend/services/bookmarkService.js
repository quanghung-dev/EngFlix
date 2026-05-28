const pool = require('../db/index.js');

const createBookmark = async (userId, lessonId) => {
    const query = `
        WITH inserted AS (
            INSERT INTO bookmarks (user_id, lesson_id, created_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id, lesson_id) DO NOTHING
            RETURNING user_id, lesson_id, created_at, true AS created
        ),
        bookmark AS (
            SELECT user_id, lesson_id, created_at, created
            FROM inserted
            UNION ALL
            SELECT user_id, lesson_id, created_at, false AS created
            FROM bookmarks
            WHERE user_id = $1
              AND lesson_id = $2
              AND NOT EXISTS (SELECT 1 FROM inserted)
        )
        SELECT b.user_id, b.lesson_id, b.created_at, b.created,
               l.category_id, l.title, l.description, l.video_url, l.thumbnail_url, l.level, l.duration
        FROM bookmark b
        JOIN lessons l ON b.lesson_id = l.id
        LIMIT 1;
    `;
    const result = await pool.query(query, [userId, lessonId]);
    const { created, ...bookmark } = result.rows[0];
    return { bookmark, created };
};

const removeBookmark = async (userId, lessonId) => {
    const query = 'DELETE FROM bookmarks WHERE user_id = $1 AND lesson_id = $2 RETURNING *';
    const result = await pool.query(query, [userId, lessonId]);
    return result.rows[0]
};

const getBookmarks = async (userId, lessonId, limit, offset) => {
    const conditions = ['b.user_id = $1'];
    const values = [userId];
    let paramIndex = 2;
    if (lessonId) {
        conditions.push(`b.lesson_id = $${paramIndex++}`);
        values.push(lessonId);
    }
    const whereClause = 'WHERE ' + conditions.join(' AND ');
    const dataQuery = `
        SELECT b.user_id, b.lesson_id, b.created_at,
               l.category_id, l.title, l.description, l.video_url, l.thumbnail_url, l.level, l.duration
        FROM bookmarks b
        JOIN lessons l ON b.lesson_id = l.id
        ${whereClause}
        ORDER BY b.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const countQuery = `
        SELECT COUNT(*) 
        FROM bookmarks b
        ${whereClause}
    `;
    const dataValues = [...values, limit, offset];
    const [bookmarksResult, totalCountResult] = await Promise.all([
        pool.query(dataQuery, dataValues),
        pool.query(countQuery, values)
    ]);
    return {
        bookmarks: bookmarksResult.rows,
        totalCount: parseInt(totalCountResult.rows[0].count)
    };
};
module.exports = {
    createBookmark,
    removeBookmark,
    getBookmarks
};
