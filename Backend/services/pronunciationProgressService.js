const pool = require('../db/index');

const COMPLETED_SCORE_THRESHOLD = 80;

const getPronunciationProgress = async (userId, lessonId, limit, offset) => {
    const query = `SELECT lesson_id, transcript_id, best_score FROM pronunciation_progress WHERE user_id = $1 AND lesson_id = $2 ORDER BY last_attempt_at DESC NULLS LAST, updated_at DESC LIMIT $3 OFFSET $4`;
    const countQuery = `SELECT COUNT(*) FROM pronunciation_progress WHERE user_id = $1 AND lesson_id = $2`;
    const [progress, total] = await Promise.all([
        pool.query(query, [userId, lessonId, limit, offset]),
        pool.query(countQuery, [userId, lessonId])
    ]);
    return { progress: progress.rows, total: parseInt(total.rows[0].count) };
}


const refreshPronunciationProgress = async (userId, transcriptId) => {
    const query = `
        WITH summary AS (
            SELECT
                user_id,
                lesson_id,
                transcript_id,
                COUNT(*)::integer AS attempts_count,
                MAX(overall_score) AS best_score,
                MAX(created_at) AS last_attempt_at
            FROM pronunciation_attempts
            WHERE user_id = $1 AND transcript_id = $2
            GROUP BY user_id, lesson_id, transcript_id
        ),
        best_attempt AS (
            SELECT id
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
            attempts_count,
            completed,
            completed_at,
            last_attempt_at,
            created_at,
            updated_at
        )
        SELECT
            summary.user_id,
            summary.lesson_id,
            summary.transcript_id,
            best_attempt.id,
            summary.best_score,
            summary.attempts_count,
            summary.best_score >= $3,
            CASE WHEN summary.best_score >= $3 THEN NOW() ELSE NULL END,
            summary.last_attempt_at,
            NOW(),
            NOW()
        FROM summary
        CROSS JOIN best_attempt
        ON CONFLICT (user_id, transcript_id)
        DO UPDATE SET
            lesson_id = EXCLUDED.lesson_id,
            best_attempt_id = EXCLUDED.best_attempt_id,
            best_score = EXCLUDED.best_score,
            attempts_count = EXCLUDED.attempts_count,
            completed = EXCLUDED.completed,
            completed_at = COALESCE(pronunciation_progress.completed_at, EXCLUDED.completed_at),
            last_attempt_at = EXCLUDED.last_attempt_at,
            updated_at = NOW()
        RETURNING *
    `;

    const result = await pool.query(query, [userId, transcriptId, COMPLETED_SCORE_THRESHOLD]);
    return result.rows[0];
};

module.exports = {
    getPronunciationProgress,
    refreshPronunciationProgress
};
