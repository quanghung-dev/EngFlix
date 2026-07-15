const pool = require('../db/index.js');

const getContent = async (lessonId) => {
    const query = `
        SELECT
            to_jsonb(l) AS lesson,
            (
                SELECT to_jsonb(c)
                FROM categories c
                WHERE c.id = l.category_id
            ) AS category,
            COALESCE(
                (
                    SELECT jsonb_agg(to_jsonb(t) ORDER BY t.sequence ASC, t.id ASC)
                    FROM transcripts t
                    WHERE t.lesson_id = l.id
                ),
                '[]'::jsonb
            ) AS transcripts
        FROM lessons l
        WHERE l.id = $1
    `;
    const result = await pool.query(query, [lessonId]);
    return result.rows[0] || null;
};

const getState = async (userId, lessonId, mode) => {
    const progressSelect = mode === 'dictation'
        ? `
            SELECT COALESCE(jsonb_agg(to_jsonb(tp) ORDER BY tp.completed_at DESC), '[]'::jsonb)
            FROM transcript_progress tp
            WHERE tp.user_id = $1 AND tp.lesson_id = l.id
        `
        : `
            SELECT COALESCE(jsonb_agg(to_jsonb(pp) ORDER BY pp.updated_at DESC), '[]'::jsonb)
            FROM pronunciation_progress pp
            WHERE pp.user_id = $1 AND pp.lesson_id = l.id
        `;

    const query = `
        SELECT
            (${progressSelect}) AS progress,
            COALESCE(
                (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', tb.id,
                            'user_id', tb.user_id,
                            'transcript_id', tb.transcript_id,
                            'lesson_id', t.lesson_id,
                            'note', tb.note,
                            'created_at', tb.created_at
                        )
                        ORDER BY tb.created_at DESC, tb.id DESC
                    )
                    FROM transcript_bookmarks tb
                    JOIN transcripts t ON t.id = tb.transcript_id
                    WHERE tb.user_id = $1 AND t.lesson_id = l.id
                ),
                '[]'::jsonb
            ) AS bookmarks,
            (
                SELECT to_jsonb(lh)
                FROM learning_history lh
                WHERE lh.user_id = $1 AND lh.lesson_id = l.id
            ) AS history
        FROM lessons l
        WHERE l.id = $2
    `;

    const result = await pool.query(query, [userId, lessonId]);
    return result.rows[0] || null;
};

module.exports = {
    getContent,
    getState
};
