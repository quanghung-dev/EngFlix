const pool = require('../db/index.js');

const getOverview = async (previewLimit, lessonLimit) => {
    const query = `
        WITH ranked_lessons AS (
            SELECT
                l.*,
                ROW_NUMBER() OVER (
                    PARTITION BY l.category_id
                    ORDER BY l.created_at DESC, l.id DESC
                ) AS preview_rank
            FROM lessons l
        ),
        category_rows AS (
            SELECT
                c.id,
                to_jsonb(c)
                    || jsonb_build_object(
                        'lessons',
                        COALESCE(
                            jsonb_agg(
                                to_jsonb(rl) - 'preview_rank'
                                ORDER BY rl.created_at DESC, rl.id DESC
                            ) FILTER (
                                WHERE rl.id IS NOT NULL
                                  AND rl.preview_rank <= $1
                            ),
                            '[]'::jsonb
                        ),
                        'total_lessons', COUNT(rl.id)::int
                    ) AS category
            FROM categories c
            LEFT JOIN ranked_lessons rl ON rl.category_id = c.id
            GROUP BY c.id
        ),
        limited_lessons AS (
            SELECT *
            FROM lessons
            ORDER BY created_at DESC, id DESC
            LIMIT $2
        )
        SELECT
            COALESCE(
                (SELECT jsonb_agg(category ORDER BY id) FROM category_rows),
                '[]'::jsonb
            ) AS categories,
            COALESCE(
                (SELECT jsonb_agg(to_jsonb(l) ORDER BY l.created_at DESC, l.id DESC) FROM limited_lessons l),
                '[]'::jsonb
            ) AS lessons,
            (SELECT COUNT(*)::int FROM lessons) AS total_lessons
    `;

    const result = await pool.query(query, [previewLimit, lessonLimit]);
    return result.rows[0];
};

module.exports = {
    getOverview
};
