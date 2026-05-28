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
const getTranscriptBookmarksByUserId = async (user_id, limit, offset) => {
    const query = `SELECT * FROM transcript_bookmarks WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
    const countQuery = `SELECT COUNT(*) FROM transcript_bookmarks WHERE user_id = $1`;
    const values = [user_id, limit, offset];
    const [dataResult, countResult] = await Promise.all([
        pool.query(query, values),
        pool.query(countQuery, [user_id])
    ]);
    return {
        bookmarks: dataResult.rows,
        totalCount: parseInt(countResult.rows[0].count, 10)
    };
}
const  updateTranscriptBookmark = async (user_id,id, note) => {
    const query = `UPDATE transcript_bookmarks SET note = $1 WHERE id = $2 AND user_id = $3 RETURNING *`;
    const result = await pool.query(query, [note, id, user_id]);
    return result.rows[0];
};

const deleteTranscriptBookmark = async (user_id,id) => {
    const query = `DELETE FROM transcript_bookmarks WHERE user_id = $1 AND id = $2 RETURNING *`;
    const result = await pool.query(query, [user_id,id]);
    return result.rows[0];
};
module.exports = {
    createTranscriptBookmark,
    getTranscriptBookmarksByUserId,
    updateTranscriptBookmark,
    deleteTranscriptBookmark
};
