const pool = require('../db/index.js');

const createBookmark = async (userId, lessonId, transcriptId, note) => {
    const query = `
        WITH target_transcript AS (
            SELECT id
            FROM transcripts
            WHERE id = $3
              AND lesson_id = $2
        ),
        inserted AS (
            INSERT INTO bookmarks (user_id, lesson_id, transcript_id, note, created_at)
            SELECT $1, $2, id, $4, NOW()
            FROM target_transcript
            ON CONFLICT (user_id, transcript_id) DO NOTHING
            RETURNING lesson_id, transcript_id, note, created_at, true AS created
        ),
        bookmark AS (
            SELECT lesson_id, transcript_id, note, created_at, created
            FROM inserted
            UNION ALL
            SELECT lesson_id, transcript_id, note, created_at, false AS created
            FROM bookmarks
            WHERE user_id = $1
              AND transcript_id = $3
              AND EXISTS (SELECT 1 FROM target_transcript)
              AND NOT EXISTS (SELECT 1 FROM inserted)
        )
        SELECT lesson_id, transcript_id, note, created_at, created
        FROM bookmark
        LIMIT 1;
    `;
    const result = await pool.query(query, [userId, lessonId, transcriptId, note ?? null]);
    if (!result.rows[0]) {
        return { bookmark: null, created: false };
    }

    const { created, ...bookmark } = result.rows[0];
    return { bookmark, created };
};

const removeBookmark = async (userId, transcriptId) => {
    const query = `
        DELETE FROM bookmarks
        WHERE user_id = $1
          AND transcript_id = $2
        RETURNING lesson_id, transcript_id, note, created_at
    `;
    const result = await pool.query(query, [userId, transcriptId]);
    return result.rows[0];
};

const updateBookmarks = async (userId, transcriptId, note) => {
    const query = `
        UPDATE bookmarks
        SET note = $1
        WHERE user_id = $2
          AND transcript_id = $3
        RETURNING lesson_id, transcript_id, note, created_at
    `;
    const result = await pool.query(query, [note, userId, transcriptId]);
    return result.rows[0];
};

const getBookmarks = async (userId, lessonId, limit, offset) => {
    const conditions = ['b.user_id = $1'];
    const values = [userId];
    let paramIndex = 2;

    if (lessonId) {
        conditions.push(`b.lesson_id = $${paramIndex++}`);
        values.push(lessonId);
    }

    const whereClause = 'WHERE ' + conditions.join(' AND ');
    const dataQuery = `
        SELECT b.lesson_id,
               l.title AS lesson_title,
               JSON_AGG(
                   JSON_BUILD_OBJECT(
                       'transcript_id', b.transcript_id,
                       'content', t.content,
                       'phonetic', t.phonetic,
                       'vietnamese', t.vietnamese,
                       'note', b.note,
                       'created_at', b.created_at
                   )
                   ORDER BY b.created_at DESC
               ) AS transcripts
        FROM bookmarks b
        JOIN lessons l ON b.lesson_id = l.id
        JOIN transcripts t ON b.transcript_id = t.id
        ${whereClause}
        GROUP BY b.lesson_id, l.title
        ORDER BY MAX(b.created_at) DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const countQuery = `
        SELECT COUNT(DISTINCT b.lesson_id) AS count
        FROM bookmarks b
        ${whereClause}
    `;
    const dataValues = [...values, limit, offset];
    const [bookmarksResult, totalCountResult] = await Promise.all([
        pool.query(dataQuery, dataValues),
        pool.query(countQuery, values)
    ]);
    return {
        bookmarks: bookmarksResult.rows,
        totalCount: parseInt(totalCountResult.rows[0].count)
    };
};
module.exports = {
    createBookmark,
    removeBookmark,
    getBookmarks,
    updateBookmarks
};
