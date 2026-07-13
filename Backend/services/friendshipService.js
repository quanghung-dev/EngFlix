const pool = require('../db/index.js');

// Lấy danh sách bạn bè đã kết bạn (status = 'accepted')
const getFriends = async (userId) => {
    const query = `
        SELECT f.id AS friendship_id,
               u.uid AS user_id,
               COALESCE(u.name, split_part(u.email, '@', 1)) AS username,
               u.avatar_url,
               COALESCE(u.level, 1) AS level,
               COALESCE(u.badge_type, 'none') AS badge_type
        FROM friendships f
        JOIN users u ON (f.user_id = u.uid AND f.friend_id = $1) OR (f.friend_id = u.uid AND f.user_id = $1)
        WHERE f.status = 'accepted'
        ORDER BY u.name ASC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

// Lấy danh sách lời mời kết bạn đang chờ (status = 'pending' gửi tới userId)
const getPendingRequests = async (userId) => {
    const query = `
        SELECT f.id AS friendship_id,
               u.uid AS user_id,
               COALESCE(u.name, split_part(u.email, '@', 1)) AS username,
               u.avatar_url,
               COALESCE(u.level, 1) AS level,
               COALESCE(u.badge_type, 'none') AS badge_type,
               f.created_at
        FROM friendships f
        JOIN users u ON f.user_id = u.uid
        WHERE f.friend_id = $1 AND f.status = 'pending'
        ORDER BY f.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

const getFriendshipStatus = async (userId, targetUserId) => {
    if (userId === targetUserId) {
        return { friendship_id: null, state: 'none' };
    }

    const result = await pool.query(
        `
            SELECT id, user_id, friend_id, status
            FROM friendships
            WHERE (user_id = $1 AND friend_id = $2)
               OR (user_id = $2 AND friend_id = $1)
            ORDER BY CASE WHEN status = 'accepted' THEN 0 ELSE 1 END,
                     created_at DESC
            LIMIT 1
        `,
        [userId, targetUserId]
    );
    const friendship = result.rows[0];

    if (!friendship) {
        return { friendship_id: null, state: 'none' };
    }

    if (friendship.status === 'accepted') {
        return { friendship_id: friendship.id, state: 'accepted' };
    }

    return {
        friendship_id: friendship.id,
        state: friendship.user_id === userId ? 'pending_sent' : 'pending_received'
    };
};

// Gửi lời mời kết bạn
const sendFriendRequest = async (userId, friendId) => {
    if (userId === friendId) {
        throw new Error('You cannot add yourself as a friend');
    }

    // Kiểm tra xem đã có quan hệ bạn bè từ trước chưa (theo cả 2 chiều)
    const checkQuery = `
        SELECT * FROM friendships 
        WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
    `;
    const checkResult = await pool.query(checkQuery, [userId, friendId]);
    if (checkResult.rows.length > 0) {
        return checkResult.rows[0]; // Trả về quan hệ hiện tại
    }

    const insertQuery = `
        INSERT INTO friendships (user_id, friend_id, status)
        VALUES ($1, $2, 'pending')
        RETURNING *
    `;
    const result = await pool.query(insertQuery, [userId, friendId]);
    return result.rows[0];
};

// Chấp nhận lời mời kết bạn
const acceptFriendRequest = async (userId, friendshipId) => {
    const query = `
        UPDATE friendships 
        SET status = 'accepted'
        WHERE id = $1 AND friend_id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [friendshipId, userId]);
    return result.rows[0];
};

// Từ chối hoặc huỷ kết bạn (xoá bản ghi khỏi DB)
const declineOrRemoveFriend = async (userId, friendshipId) => {
    const query = `
        DELETE FROM friendships 
        WHERE id = $1 AND (user_id = $2 OR friend_id = $2)
        RETURNING *
    `;
    const result = await pool.query(query, [friendshipId, userId]);
    return result.rows[0];
};

// Tìm kiếm người dùng khác trong hệ thống kèm trạng thái quan hệ kết bạn
const searchUsersToAdd = async (userId, searchQuery) => {
    const query = `
        SELECT u.uid AS user_id,
               COALESCE(u.name, split_part(u.email, '@', 1)) AS username,
               u.avatar_url,
               COALESCE(u.level, 1) AS level,
               COALESCE(u.badge_type, 'none') AS badge_type,
               (
                   SELECT f.status FROM friendships f 
                   WHERE f.user_id = $1 AND f.friend_id = u.uid
                   LIMIT 1
               ) AS sent_status,
               (
                   SELECT f.status FROM friendships f 
                   WHERE f.user_id = u.uid AND f.friend_id = $1
                   LIMIT 1
               ) AS received_status,
               (
                   SELECT f.id FROM friendships f 
                   WHERE (f.user_id = $1 AND f.friend_id = u.uid) OR (f.user_id = u.uid AND f.friend_id = $1)
                   LIMIT 1
               ) AS friendship_id
        FROM users u
        WHERE u.uid != $1
          AND (u.name ILIKE $2 OR u.email ILIKE $2)
        ORDER BY u.name ASC
        LIMIT 20
    `;
    const result = await pool.query(query, [userId, `%${searchQuery}%`]);
    return result.rows.map(row => {
        let friendshipState = 'none';
        if (row.sent_status === 'pending') {
            friendshipState = 'pending_sent';
        } else if (row.received_status === 'pending') {
            friendshipState = 'pending_received';
        } else if (row.sent_status === 'accepted' || row.received_status === 'accepted') {
            friendshipState = 'accepted';
        }
        
        return {
            user_id: row.user_id,
            username: row.username,
            avatar_url: row.avatar_url,
            level: row.level,
            badge_type: row.badge_type,
            friendship_id: row.friendship_id,
            friendship_state: friendshipState
        };
    });
};

module.exports = {
    getFriends,
    getPendingRequests,
    getFriendshipStatus,
    sendFriendRequest,
    acceptFriendRequest,
    declineOrRemoveFriend,
    searchUsersToAdd
};
