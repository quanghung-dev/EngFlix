const pool = require('../db/index');

const recordHistory = async (userId, lessonId, durationWatched, completed) => {
    const query = `
        WITH updated AS (
            UPDATE learning_history
            SET
                duration_watched = $3,
                completed = $4
            WHERE user_id = $1
              AND lesson_id = $2
            RETURNING *
        ),
        inserted AS (
            INSERT INTO learning_history (user_id, lesson_id, duration_watched, completed, created_at)
            SELECT $1, $2, $3, $4, NOW()
            WHERE NOT EXISTS (SELECT 1 FROM updated)
            RETURNING *
        )
        SELECT * FROM updated
        UNION ALL
        SELECT * FROM inserted
        ORDER BY created_at DESC, id DESC
        LIMIT 1;
    `;
    const result = await pool.query(query, [userId, lessonId, durationWatched, completed]);
    return result.rows[0];
};

const getHistoryByLesson = async (userId, lessonId) => {
    const query = `
        SELECT *
        FROM learning_history
        WHERE user_id = $1
          AND lesson_id = $2
        ORDER BY created_at DESC, id DESC
        LIMIT 1
    `;
    const result = await pool.query(query, [userId, lessonId]);
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows[0];
};

const getHistories = async (userId, limit, offset) => {
    const dataQuery = `
        SELECT *
        FROM learning_history
        WHERE user_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT $2 OFFSET $3
    `;
    const countQuery = 'SELECT COUNT(*) FROM learning_history WHERE user_id = $1';
    const [historiesResult, totalCountResult] = await Promise.all([
        pool.query(dataQuery, [userId, limit, offset]),
        pool.query(countQuery, [userId])
    ]);
    return {
        histories: historiesResult.rows,
        totalCount: parseInt(totalCountResult.rows[0].count)
    };
};
const getLearningHistoryFinished = async (userId) => {
    const query = `SELECT * FROM learning_history WHERE user_id = $1 AND completed = true ORDER BY created_at DESC, id DESC`
    const result = await pool.query(query,[userId])
    return result.rows
};

const getLearningHistoryUnfinished = async (userId) => {
    const query = `SELECT * FROM learning_history WHERE user_id = $1 AND completed = false ORDER BY created_at DESC, id DESC`
    const result = await pool.query(query,[userId])
    return result.rows
};

const getLearningHistorySummary = async (userId) => {
    const query = `
        SELECT
            COUNT(*) FILTER (WHERE completed = true) AS completed_count,
            COUNT(*) FILTER (WHERE completed = false) AS unfinished_count
        FROM learning_history
        WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return {
        completed_count: parseInt(result.rows[0].completed_count),
        unfinished_count: parseInt(result.rows[0].unfinished_count)
    };
};

const testGetgetLearningHistory = async () => {
    const query = `SELECT * FROM learning_history ORDER BY created_at DESC `
    const result = await pool.query(query)
    return result.rows
}

module.exports = {
    recordHistory,
    getHistoryByLesson,
    getHistories,
    getLearningHistoryFinished,
    getLearningHistoryUnfinished,
    getLearningHistorySummary,
    testGetgetLearningHistory
};
