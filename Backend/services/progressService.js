const pool = require('../db/index.js');

// Lấy số ngày học liên tiếp (Streak) của người dùng
const getStreakCount = async (userId) => {
    const query = `
        WITH activity_dates AS (
            SELECT DISTINCT updated_at::date AS activity_date
            FROM learning_history
            WHERE user_id = $1
            UNION
            SELECT DISTINCT created_at::date AS activity_date
            FROM pronunciation_attempts
            WHERE user_id = $1
            UNION
            SELECT DISTINCT completed_at::date AS activity_date
            FROM dictation_status
            WHERE user_id = $1
            UNION
            SELECT DISTINCT completed_at::date AS activity_date
            FROM shadowing_status
            WHERE user_id = $1
        )
        SELECT activity_date 
        FROM activity_dates 
        ORDER BY activity_date DESC
    `;
    
    const result = await pool.query(query, [userId]);
    const dates = result.rows.map(r => new Date(r.activity_date));
    
    if (dates.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Kiểm tra xem lần hoạt động gần nhất có phải hôm nay hoặc hôm qua không
    const latestDate = dates[0];
    latestDate.setHours(0, 0, 0, 0);
    
    if (latestDate.getTime() !== today.getTime() && latestDate.getTime() !== yesterday.getTime()) {
        return 0; // Đã quá 1 ngày không học -> reset streak về 0
    }
    
    let streak = 1;
    let currentDate = latestDate;
    
    for (let i = 1; i < dates.length; i++) {
        const nextDate = dates[i];
        nextDate.setHours(0, 0, 0, 0);
        
        const diffTime = currentDate.getTime() - nextDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            streak++;
            currentDate = nextDate;
        } else if (diffDays > 1) {
            break; // Đứt quãng -> dừng đếm
        }
    }
    
    return streak;
};

// Lấy dữ liệu thống kê tổng hợp cho Dashboard
const getProgressStats = async (userId) => {
    // 1. Tính toán Streak học tập
    const streak = await getStreakCount(userId);

    // 2. Tính toán tổng số bài học đã tham gia
    const historyCountRes = await pool.query(
        `
            SELECT COUNT(*)::int AS count
            FROM learning_history
            WHERE user_id = $1
              AND completed_dictation IS TRUE
              AND completed_pronunciation IS TRUE
        `,
        [userId]
    );
    const totalLessons = historyCountRes.rows[0].count;
    // Mỗi bài học ước tính 15 phút học
    const totalMinutes = totalLessons * 15;

    // 3. Lấy số lượng bài học hoàn thành theo ngày (7 ngày gần nhất) để vẽ biểu đồ
    const weeklyProgressQuery = `
        SELECT COALESCE(d.date::date, h.activity_date) AS activity_date,
               COALESCE(h.lessons_completed, 0)::int AS lessons_completed
        FROM (
            SELECT (CURRENT_DATE - i)::date AS date
            FROM generate_series(0, 6) i
        ) d
        LEFT JOIN (
            SELECT updated_at::date AS activity_date,
                   COUNT(*) AS lessons_completed
            FROM learning_history
            WHERE user_id = $1
              AND completed_dictation IS TRUE
              AND completed_pronunciation IS TRUE
              AND updated_at >= CURRENT_DATE - INTERVAL '6 days'
            GROUP BY updated_at::date
        ) h ON d.date = h.activity_date
        ORDER BY activity_date ASC
    `;
    const weeklyProgressRes = await pool.query(weeklyProgressQuery, [userId]);

    // 4. Lấy lịch sử 10 lần phát âm Shadowing gần nhất để vẽ biểu đồ tiến độ phát âm
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
    const shadowingAttemptsRes = await pool.query(shadowingAttemptsQuery, [userId]);

    // 5. Lấy thống kê từ vựng đã lưu
    const vocabStatsQuery = `
        SELECT COUNT(*)::int AS total_words
        FROM vocabulary_items vi
        JOIN vocabulary_decks vd ON vi.deck_id = vd.id
        WHERE vd.user_id = $1
          AND vd.is_default = false
    `;
    const vocabStatsRes = await pool.query(vocabStatsQuery, [userId]);
    const totalWords = vocabStatsRes.rows[0].total_words;

    return {
        streak,
        total_lessons: totalLessons,
        total_minutes: totalMinutes,
        weekly_progress: weeklyProgressRes.rows,
        shadowing_attempts: shadowingAttemptsRes.rows,
        total_words: totalWords
    };
};

module.exports = {
    getProgressStats
};
