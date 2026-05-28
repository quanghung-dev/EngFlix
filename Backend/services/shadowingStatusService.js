const pool = require('../db/index');

const getShadowingStatus = async (userId, lessonId, limit, offset) => {
    const conditions = ['ss.user_id = $1'];
    const values = [userId];
    let paramIndex = 2;

    if (lessonId) {
        conditions.push(`ss.lesson_id = $${paramIndex++}`);
        values.push(lessonId);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const dataQuery = `
        SELECT
            ss.user_id,
            ss.transcript_id,
            ss.lesson_id,
            ss.completed_at,
            t.sequence,
            t.content,
            t.start_timestamp,
            t.end_timestamp
        FROM shadowing_status ss
        JOIN transcripts t ON t.id = ss.transcript_id
        ${whereClause}
        ORDER BY ss.completed_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const countQuery = `
        SELECT COUNT(*)
        FROM shadowing_status ss
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

const setShadowingStatus = async (userId, transcriptId) => {
    const query = `
        WITH target_transcript AS (
            SELECT id, lesson_id
            FROM transcripts
            WHERE id = $2
        ),
        inserted AS (
            INSERT INTO shadowing_status (user_id, transcript_id, lesson_id, completed_at)
            SELECT $1, id, lesson_id, NOW()
            FROM target_transcript
            ON CONFLICT (user_id, transcript_id) DO NOTHING
            RETURNING user_id, transcript_id, lesson_id, completed_at, false AS already_exists
        ),
        updated AS (
            UPDATE shadowing_status ss
            SET lesson_id = target_transcript.lesson_id,
                completed_at = NOW()
            FROM target_transcript
            WHERE ss.user_id = $1
              AND ss.transcript_id = target_transcript.id
              AND NOT EXISTS (SELECT 1 FROM inserted)
            RETURNING ss.user_id, ss.transcript_id, ss.lesson_id, ss.completed_at, true AS already_exists
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
    getShadowingStatus,
    setShadowingStatus
};
