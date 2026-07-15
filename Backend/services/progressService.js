const pool = require('../db/index.js');

const getStreakCount = async (userId) => {
    const query = `
        WITH activity_dates AS (
            SELECT DISTINCT (updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS activity_date
            FROM learning_history
            WHERE user_id = $1
            UNION
            SELECT DISTINCT (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS activity_date
            FROM pronunciation_attempts
            WHERE user_id = $1
            UNION
            SELECT DISTINCT (completed_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS activity_date
            FROM dictation_status
            WHERE user_id = $1
            UNION
            SELECT DISTINCT (completed_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS activity_date
            FROM shadowing_status
            WHERE user_id = $1
        )
        SELECT activity_date
        FROM activity_dates
        ORDER BY activity_date DESC
    `;

    const result = await pool.query(query, [userId]);
    const vnDate = (date = new Date()) => {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(date);
        const value = (type) => parts.find((part) => part.type === type)?.value;
        return `${value('year')}-${value('month')}-${value('day')}`;
    };

    const dates = result.rows.map((row) => {
        const date = new Date(row.activity_date);
        return date.toISOString().split('T')[0];
    });
    if (dates.length === 0) return 0;

    const today = vnDate();
    const yesterday = vnDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    let streak = 1;
    let currentDate = new Date(dates[0]);
    for (let index = 1; index < dates.length; index += 1) {
        const nextDate = new Date(dates[index]);
        const differenceInDays = Math.ceil(
            (currentDate.getTime() - nextDate.getTime()) / (24 * 60 * 60 * 1000)
        );
        if (differenceInDays === 1) {
            streak += 1;
            currentDate = nextDate;
        } else if (differenceInDays > 1) {
            break;
        }
    }
    return streak;
};

const getProgressStats = async (userId) => {
    const historyCountQuery = `
        SELECT COUNT(*)::int AS count
        FROM learning_history
        WHERE user_id = $1
          AND completed_dictation IS TRUE
          AND completed_pronunciation IS TRUE
    `;

    const weeklyProgressQuery = `
        SELECT COALESCE(d.date::date, h.activity_date) AS activity_date,
               COALESCE(h.lessons_completed, 0)::int AS lessons_completed
        FROM (
            SELECT ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date - i)::date AS date
            FROM generate_series(0, 6) i
        ) d
        LEFT JOIN (
            SELECT (updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS activity_date,
                   COUNT(*) AS lessons_completed
            FROM learning_history
            WHERE user_id = $1
              AND completed_dictation IS TRUE
              AND completed_pronunciation IS TRUE
              AND updated_at >= (
                  (((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date - 6)::timestamp
                      AT TIME ZONE 'Asia/Ho_Chi_Minh')
                      AT TIME ZONE 'UTC'
              )
            GROUP BY 1
        ) h ON d.date = h.activity_date
        ORDER BY activity_date ASC
    `;

    const shadowingAttemptsQuery = `
        SELECT id, score, created_at
        FROM (
            SELECT id,
                   overall_score::int AS score,
                   created_at
            FROM pronunciation_attempts
            WHERE user_id = $1
            ORDER BY created_at DESC, id DESC
            LIMIT 10
        ) latest_attempts
        ORDER BY created_at ASC, id ASC
    `;

    const vocabStatsQuery = `
        SELECT
            COUNT(*)::int AS total_words,
            COUNT(*) FILTER (
                WHERE vi.next_review_at IS NULL OR vi.next_review_at <= NOW()
            )::int AS words_to_review
        FROM vocabulary_items vi
        JOIN vocabulary_decks vd ON vi.deck_id = vd.id
        WHERE vd.user_id = $1
          AND vd.is_default IS FALSE
    `;

    const [
        streak,
        historyCountResult,
        weeklyProgressResult,
        shadowingAttemptsResult,
        vocabStatsResult
    ] = await Promise.all([
        getStreakCount(userId),
        pool.query(historyCountQuery, [userId]),
        pool.query(weeklyProgressQuery, [userId]),
        pool.query(shadowingAttemptsQuery, [userId]),
        pool.query(vocabStatsQuery, [userId])
    ]);

    const totalLessons = historyCountResult.rows[0].count;
    const { total_words: totalWords, words_to_review: wordsToReview } = vocabStatsResult.rows[0];

    return {
        streak,
        total_lessons: totalLessons,
        total_minutes: totalLessons * 15,
        weekly_progress: weeklyProgressResult.rows,
        shadowing_attempts: shadowingAttemptsResult.rows,
        total_words: totalWords,
        words_to_review: wordsToReview
    };
};

module.exports = {
    getProgressStats
};
