const pool = require('../db/index');

const getTranscriptProgressById = async (userId, lessonId) => {
    const query = `
        SELECT *
        FROM transcript_progress
        WHERE user_id = $1 AND lesson_id = $2
        ORDER BY completed_at DESC
    `;
    const result = await pool.query(query, [userId, lessonId]);
    return result.rows;
};

const createTranscriptProgress = async (userId, lessonId, transcriptId) => {
    const query = `
        WITH target_transcript AS (
            SELECT id, lesson_id
            FROM transcripts
            WHERE id = $3 AND lesson_id = $2
        )
        INSERT INTO transcript_progress (user_id, lesson_id, transcript_id, completed_at)
        SELECT $1, lesson_id, id, NOW()
        FROM target_transcript
        ON CONFLICT (user_id, transcript_id)
        DO UPDATE SET
            lesson_id = EXCLUDED.lesson_id,
            completed_at = EXCLUDED.completed_at
        RETURNING user_id, lesson_id, transcript_id, completed_at
    `;
    const result = await pool.query(query, [userId, lessonId, transcriptId]);
    return result.rows[0];
};

module.exports = {
    getTranscriptProgressById,
    createTranscriptProgress
};
