const pool = require('../db/index');

const recordHistory = async (userId, lessonId, completedDictation, completedPronunciation) => {
    const query = `
        INSERT INTO learning_history (user_id, lesson_id, completed_dictation, completed_pronunciation, updated_at)
        VALUES ($1, $2, COALESCE($3, false), $4, NOW())
        ON CONFLICT (user_id, lesson_id)
        DO UPDATE SET
            completed_dictation = COALESCE($3, learning_history.completed_dictation),
            completed_pronunciation = COALESCE($4, learning_history.completed_pronunciation),
            updated_at = NOW()
        RETURNING *
    `;
    const result = await pool.query(query, [userId, lessonId, completedDictation, completedPronunciation]);
    return result.rows[0];
};



const getHistoryByLesson = async (userId, lessonId) => {
    const query = `
        SELECT *
        FROM learning_history
        WHERE user_id = $1
          AND lesson_id = $2
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
        ORDER BY updated_at DESC, id DESC
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
    const query = `
        SELECT *
        FROM learning_history
        WHERE user_id = $1
          AND completed_dictation IS TRUE
          AND completed_pronunciation IS TRUE
        ORDER BY updated_at DESC, id DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

const getLearningHistoryUnfinished = async (userId) => {
    const query = `
        SELECT *
        FROM learning_history
        WHERE user_id = $1
          AND NOT (
              completed_dictation IS TRUE
              AND completed_pronunciation IS TRUE
          )
        ORDER BY updated_at DESC, id DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

const getLearningHistorySummary = async (userId) => {
    const query = `
        SELECT
            COUNT(*) FILTER (
                WHERE completed_dictation IS TRUE
                  AND completed_pronunciation IS TRUE
            ) AS completed_count,
            COUNT(*) FILTER (
                WHERE NOT (
                    completed_dictation IS TRUE
                    AND completed_pronunciation IS TRUE
                )
            ) AS unfinished_count
        FROM learning_history
        WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return {
        completed_count: parseInt(result.rows[0].completed_count),
        unfinished_count: parseInt(result.rows[0].unfinished_count)
    };
};

const getLearningHistorySummaryByLesson = async (userId, lessonId) => {
    const query = `
        SELECT
            COUNT(*) FILTER (
                WHERE completed_dictation IS TRUE
                  AND completed_pronunciation IS TRUE
            ) AS completed,
            COUNT(*) FILTER (
                WHERE NOT (
                    completed_dictation IS TRUE
                    AND completed_pronunciation IS TRUE
                )
            ) AS uncompleted
        FROM learning_history
        WHERE user_id = $1
          AND lesson_id = $2
    `;
    const result = await pool.query(query, [userId, lessonId]);
    return {
        completed: parseInt(result.rows[0].completed, 10),
        uncompleted: parseInt(result.rows[0].uncompleted, 10)
    };
};

module.exports = {
    recordHistory,
    getHistoryByLesson,
    getHistories,
    getLearningHistoryFinished,
    getLearningHistoryUnfinished,
    getLearningHistorySummary,
    getLearningHistorySummaryByLesson
};
