const pool = require('../db/index');

const createTranscriptBookmark = async (user_id, transcript_id, note) => {
    const query = `
        WITH inserted AS (
            INSERT INTO transcript_bookmarks (user_id, transcript_id, note)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, transcript_id) DO NOTHING
            RETURNING id, user_id, transcript_id, note, created_at, false AS already_exists
        )
        SELECT id, user_id, transcript_id, note, created_at, already_exists
        FROM inserted
        UNION ALL
        SELECT id, user_id, transcript_id, note, created_at, true AS already_exists
        FROM transcript_bookmarks
        WHERE user_id = $1
          AND transcript_id = $2
          AND NOT EXISTS (SELECT 1 FROM inserted)
        LIMIT 1;
    `;
    const values = [user_id, transcript_id, note ?? null];
    const result = await pool.query(query, values);
    return result.rows[0];
};
const getTranscriptBookmarksByUserId = async (user_id, lessonId, limit, offset) => {
    const query = `
        SELECT tb.id,
               tb.user_id,
               tb.transcript_id,
               t.lesson_id,
               tb.note,
               tb.created_at
        FROM transcript_bookmarks tb
        JOIN transcripts t ON tb.transcript_id = t.id
        WHERE tb.user_id = $1
          AND t.lesson_id = $2
        ORDER BY tb.created_at DESC
        LIMIT $3 OFFSET $4
    `;
    const countQuery = `
        SELECT COUNT(*) AS count
        FROM transcript_bookmarks tb
        JOIN transcripts t ON tb.transcript_id = t.id
        WHERE tb.user_id = $1
          AND t.lesson_id = $2
    `;
    const [dataResult, countResult] = await Promise.all([
        pool.query(query, [user_id, lessonId, limit, offset]),
        pool.query(countQuery, [user_id, lessonId])
    ]);
    return {
        bookmarks: dataResult.rows,
        totalCount: parseInt(countResult.rows[0].count, 10)
    };
};

const getAllTranscriptBookmarks = async (user_id, limit, offset) => {
    const query = `
        SELECT tb.id,
               tb.user_id,
               tb.transcript_id,
               t.lesson_id,
               l.title AS lesson_title,
               t.content AS original_content,
               t.phonetic AS phonetic_content,
               t.vietnamese AS vietnamese_content,
               tb.note,
               tb.created_at
        FROM transcript_bookmarks tb
        JOIN transcripts t ON tb.transcript_id = t.id
        JOIN lessons l ON t.lesson_id = l.id
        WHERE tb.user_id = $1
        ORDER BY tb.created_at DESC
        LIMIT $2 OFFSET $3
    `;
    const countQuery = `
        SELECT COUNT(*) AS count
        FROM transcript_bookmarks tb
        WHERE tb.user_id = $1
    `;
    const [dataResult, countResult] = await Promise.all([
        pool.query(query, [user_id, limit, offset]),
        pool.query(countQuery, [user_id])
    ]);
    return {
        bookmarks: dataResult.rows,
        totalCount: parseInt(countResult.rows[0].count, 10)
    };
};

const updateTranscriptBookmark = async (user_id, id, note) => {
    const query = `UPDATE transcript_bookmarks SET note = $1 WHERE id = $2 AND user_id = $3 RETURNING *`;
    const result = await pool.query(query, [note, id, user_id]);
    return result.rows[0];
};

const deleteTranscriptBookmark = async (user_id, id) => {
    const query = `DELETE FROM transcript_bookmarks WHERE user_id = $1 AND id = $2 RETURNING *`;
    const result = await pool.query(query, [user_id, id]);
    return result.rows[0];
};
module.exports = {
    createTranscriptBookmark,
    getTranscriptBookmarksByUserId,
    getAllTranscriptBookmarks,
    updateTranscriptBookmark,
    deleteTranscriptBookmark
};
