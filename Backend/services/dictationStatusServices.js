const pool = require('../db/index');

const getdictationStatus = async (userId, lessonId, limit, offset) => {
    const conditions = ['ds.user_id = $1'];
    const values = [userId];
    let paramIndex = 2;

    if (lessonId) {
        conditions.push(`ds.lesson_id = $${paramIndex++}`);
        values.push(lessonId);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const dataQuery = `
        SELECT
            ds.user_id,
            ds.transcript_id,
            ds.lesson_id,
            ds.completed_at,
            t.sequence,
            t.content,
            t.start_timestamp,
            t.end_timestamp
        FROM dictation_status ds
        JOIN transcripts t ON t.id = ds.transcript_id
        ${whereClause}
        ORDER BY ds.completed_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const countQuery = `
        SELECT COUNT(*)
        FROM dictation_status ds
        ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
        pool.query(dataQuery, [...values, limit, offset]),
        pool.query(countQuery, values)
    ]);

    return {
        result: dataResult.rows,
        totalCount: parseInt(countResult.rows[0].count, 10)
    };
};

const setdictationStatus = async (userId, transcriptId) => {
    const query = `
        WITH target_transcript AS (
            SELECT id, lesson_id
            FROM transcripts
            WHERE id = $2
        ),
        inserted AS (
            INSERT INTO dictation_status (user_id, transcript_id, lesson_id, completed_at)
            SELECT $1, id, lesson_id, NOW()
            FROM target_transcript
            ON CONFLICT (user_id, transcript_id) DO NOTHING
            RETURNING user_id, transcript_id, lesson_id, completed_at, false AS already_exists
        ),
        updated AS (
            UPDATE dictation_status ds
            SET lesson_id = target_transcript.lesson_id,
                completed_at = NOW()
            FROM target_transcript
            WHERE ds.user_id = $1
              AND ds.transcript_id = target_transcript.id
              AND NOT EXISTS (SELECT 1 FROM inserted)
            RETURNING ds.user_id, ds.transcript_id, ds.lesson_id, ds.completed_at, true AS already_exists
        )
        SELECT *
        FROM inserted
        UNION ALL
        SELECT *
        FROM updated
        LIMIT 1
    `;
    const result = await pool.query(query, [userId, transcriptId]);
    return result.rows[0];
};

module.exports = {
    getdictationStatus,
    setdictationStatus
};
