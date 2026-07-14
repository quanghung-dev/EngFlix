const pool = require('../db/index.js');
const Pusher = require('pusher');

let pusher = null;
if (
    process.env.PUSHER_APP_ID && process.env.PUSHER_APP_ID !== 'your_pusher_app_id' &&
    process.env.PUSHER_KEY && process.env.PUSHER_KEY !== 'your_pusher_key' &&
    process.env.PUSHER_SECRET && process.env.PUSHER_SECRET !== 'your_pusher_secret' &&
    process.env.PUSHER_CLUSTER && process.env.PUSHER_CLUSTER !== 'your_pusher_cluster'
) {
    pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_KEY,
        secret: process.env.PUSHER_SECRET,
        cluster: process.env.PUSHER_CLUSTER,
        useTLS: true
    });
} else {
    console.warn('Pusher is not configured or is using placeholder values. Real-time chat will not work until keys are filled in .env.');
}

// Lấy danh sách tin nhắn chat mới nhất, kèm thông tin người dùng
const getChatMessages = async (limit = 50, offset = 0) => {
    const query = `
        SELECT cm.id,
               cm.user_id,
               COALESCE(u.name, split_part(u.email, '@', 1)) AS username,
               u.avatar_url,
               COALESCE(u.level, 1) AS level,
               COALESCE(u.badge_type, 'none') AS badge_type,
               cm.content,
               cm.created_at
        FROM chat_messages cm
        JOIN users u ON cm.user_id = u.uid
        ORDER BY cm.created_at DESC
        LIMIT $1 OFFSET $2
    `;
    const countQuery = `SELECT COUNT(*) AS count FROM chat_messages`;
    
    const [dataRes, countRes] = await Promise.all([
        pool.query(query, [limit, offset]),
        pool.query(countQuery)
    ]);
    
    // Đảo ngược danh sách tin nhắn để hiển thị theo thứ tự thời gian tăng dần ở client
    const messages = dataRes.rows.reverse();
    const totalCount = parseInt(countRes.rows[0].count, 10);
    
    return {
        messages,
        total: totalCount
    };
};

// Gửi tin nhắn mới
const createChatMessage = async (userId, content) => {
    // 1. Chèn tin nhắn vào database
    const insertQuery = `
        INSERT INTO chat_messages (user_id, content)
        VALUES ($1, $2)
        RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [userId, content]);
    const newMessage = insertResult.rows[0];

    // 2. Lấy thông tin đầy đủ kèm thông tin người dùng để trả về client
    const detailQuery = `
        SELECT cm.id,
               cm.user_id,
               COALESCE(u.name, split_part(u.email, '@', 1)) AS username,
               u.avatar_url,
               COALESCE(u.level, 1) AS level,
               COALESCE(u.badge_type, 'none') AS badge_type,
               cm.content,
               cm.created_at
        FROM chat_messages cm
        JOIN users u ON cm.user_id = u.uid
        WHERE cm.id = $1
    `;
    const detailResult = await pool.query(detailQuery, [newMessage.id]);
    const responseMessage = detailResult.rows[0];

    if (pusher) {
        pusher.trigger('chat-channel', 'new-message', responseMessage).catch((err) => {
            console.error('Failed to trigger Pusher event:', err);
        });
    }

    return responseMessage;
};

module.exports = {
    getChatMessages,
    createChatMessage
};
