const pool = require('../db/index');

const getPronunciationProgress = async (userId, lessonId, limit, offset) => {
    const query = `SELECT * FROM pronunciation_progress WHERE user_id = $1 AND lesson_id = $2 ORDER BY updated_at DESC LIMIT $3 OFFSET $4`;
    const countQuery = `SELECT COUNT(*) FROM pronunciation_progress WHERE user_id = $1 AND lesson_id = $2`;
    const [progress, total] = await Promise.all([
        pool.query(query, [userId, lessonId, limit, offset]),
        pool.query(countQuery, [userId, lessonId])
    ]);
    return { progress: progress.rows, total: parseInt(total.rows[0].count) };
}

const updatePronunciationProgress = async (userId, transcriptId) => {
    const query = `
        WITH summary AS (
            SELECT
                user_id,
                lesson_id,
                transcript_id,
                MAX(overall_score) AS best_score
            FROM pronunciation_attempts
            WHERE user_id = $1 AND transcript_id = $2
            GROUP BY user_id, lesson_id, transcript_id
        ),
        best_attempt AS (
            SELECT id, feedback
            FROM pronunciation_attempts
            WHERE user_id = $1 AND transcript_id = $2
            ORDER BY overall_score DESC, created_at DESC, id DESC
            LIMIT 1
        )
        INSERT INTO pronunciation_progress (
            user_id,
            lesson_id,
            transcript_id,
            best_attempt_id,
            best_score,
            feedback,
            created_at,
            updated_at
        )
        SELECT
            summary.user_id,
            summary.lesson_id,
            summary.transcript_id,
            best_attempt.id,
            summary.best_score,
            best_attempt.feedback,
            NOW(),
            NOW()
        FROM summary
        CROSS JOIN best_attempt
        ON CONFLICT (user_id, transcript_id)
        DO UPDATE SET
            lesson_id = EXCLUDED.lesson_id,
            best_attempt_id = EXCLUDED.best_attempt_id,
            best_score = EXCLUDED.best_score,
            feedback = EXCLUDED.feedback,
            updated_at = NOW()
        RETURNING *
    `;

    const result = await pool.query(query, [userId, transcriptId]);
    return result.rows[0];
};

module.exports = {
    getPronunciationProgress,
    updatePronunciationProgress
};
