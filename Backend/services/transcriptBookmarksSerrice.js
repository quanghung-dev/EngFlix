const pool = require('../db/index');

const createTranscriptBookmark = async (user_id, transcript_id, note) => {
    const query = `INSERT INTO transcript_bookmarks (user_id, transcript_id, note) VALUES ($1, $2, $3) RETURNING *`;
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
const  updateTranscriptBookmark = async (id, note) => {
    const query = `UPDATE transcript_bookmarks SET note = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
    const result = await pool.query(query, [note, id]);
    return result.rows[0];
};

const deleteTranscriptBookmark = async (id) => {
    const query = `DELETE FROM transcript_bookmarks WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};
module.exports = {
    createTranscriptBookmark,
    getTranscriptBookmarksByUserId,
    updateTranscriptBookmark,
    deleteTranscriptBookmark
};