const pool = require('../db/index.js');

// Lấy danh sách bài viết trang cộng đồng (bảng tin chung)
const getPostsFeed = async (currentUserId, limit = 20, offset = 0) => {
    const query = `
        SELECT p.id,
               p.user_id,
               COALESCE(u.name, split_part(u.email, '@', 1)) AS username,
               u.avatar_url,
               COALESCE(u.level, 1) AS level,
               COALESCE(u.badge_type, 'none') AS badge_type,
               p.content,
               p.image_url,
               p.created_at,
               (SELECT COUNT(*)::int FROM post_likes WHERE post_id = p.id) AS likes_count,
               (SELECT COUNT(*)::int FROM post_comments WHERE post_id = p.id) AS comments_count,
               EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $1) AS is_liked
        FROM posts p
        JOIN users u ON p.user_id = u.uid
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
    `;
    const countQuery = `SELECT COUNT(*)::int AS count FROM posts`;
    const [dataResult, countResult] = await Promise.all([
        pool.query(query, [currentUserId, limit, offset]),
        pool.query(countQuery)
    ]);
    return {
        posts: dataResult.rows,
        total: countResult.rows[0].count
    };
};

// Lấy danh sách bài viết của 1 học viên cụ thể (Trang cá nhân)
const getUserPosts = async (currentUserId, targetUserId, limit = 20, offset = 0) => {
    const query = `
        SELECT p.id,
               p.user_id,
               COALESCE(u.name, split_part(u.email, '@', 1)) AS username,
               u.avatar_url,
               COALESCE(u.level, 1) AS level,
               COALESCE(u.badge_type, 'none') AS badge_type,
               p.content,
               p.image_url,
               p.created_at,
               (SELECT COUNT(*)::int FROM post_likes WHERE post_id = p.id) AS likes_count,
               (SELECT COUNT(*)::int FROM post_comments WHERE post_id = p.id) AS comments_count,
               EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $1) AS is_liked
        FROM posts p
        JOIN users u ON p.user_id = u.uid
        WHERE p.user_id = $2
        ORDER BY p.created_at DESC
        LIMIT $3 OFFSET $4
    `;
    const countQuery = `SELECT COUNT(*)::int AS count FROM posts WHERE user_id = $1`;
    const [dataResult, countResult] = await Promise.all([
        pool.query(query, [currentUserId, targetUserId, limit, offset]),
        pool.query(countQuery, [targetUserId])
    ]);
    return {
        posts: dataResult.rows,
        total: countResult.rows[0].count
    };
};

// Tạo bài viết mới
const createPost = async (userId, content, imageUrl = null) => {
    const insertQuery = `
        INSERT INTO posts (user_id, content, image_url)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [userId, content, imageUrl]);
    const newPost = insertResult.rows[0];

    // Lấy thông tin bài viết đầy đủ kèm theo profile tác giả
    const detailQuery = `
        SELECT p.id,
               p.user_id,
               COALESCE(u.name, split_part(u.email, '@', 1)) AS username,
               u.avatar_url,
               COALESCE(u.level, 1) AS level,
               COALESCE(u.badge_type, 'none') AS badge_type,
               p.content,
               p.image_url,
               p.created_at,
               0 AS likes_count,
               0 AS comments_count,
               false AS is_liked
        FROM posts p
        JOIN users u ON p.user_id = u.uid
        WHERE p.id = $1
    `;
    const detailResult = await pool.query(detailQuery, [newPost.id]);
    return detailResult.rows[0];
};

// Xoá bài viết
const deletePost = async (userId, postId) => {
    const query = `
        DELETE FROM posts 
        WHERE id = $1 AND user_id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [postId, userId]);
    return result.rows[0];
};

// Thích hoặc huỷ thích bài viết
const toggleLike = async (userId, postId) => {
    // Kiểm tra xem đã like chưa
    const checkQuery = `SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2`;
    const checkResult = await pool.query(checkQuery, [postId, userId]);
    
    let isLiked = false;
    if (checkResult.rows.length > 0) {
        // Đã like -> Huỷ thích
        await pool.query(`DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
        isLiked = false;
    } else {
        // Chưa like -> Thích bài viết
        await pool.query(`INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)`, [postId, userId]);
        isLiked = true;
    }

    // Lấy số lượng like mới nhất
    const countResult = await pool.query(`SELECT COUNT(*)::int AS count FROM post_likes WHERE post_id = $1`, [postId]);
    return {
        is_liked: isLiked,
        likes_count: countResult.rows[0].count
    };
};

// Lấy danh sách bình luận của bài viết
const getPostComments = async (postId) => {
    const query = `
        SELECT pc.id,
               pc.post_id,
               pc.user_id,
               COALESCE(u.name, split_part(u.email, '@', 1)) AS username,
               u.avatar_url,
               COALESCE(u.level, 1) AS level,
               COALESCE(u.badge_type, 'none') AS badge_type,
               pc.content,
               pc.created_at
        FROM post_comments pc
        JOIN users u ON pc.user_id = u.uid
        WHERE pc.post_id = $1
        ORDER BY pc.created_at ASC
    `;
    const result = await pool.query(query, [postId]);
    return result.rows;
};

// Viết bình luận mới
const createComment = async (userId, postId, content) => {
    const insertQuery = `
        INSERT INTO post_comments (user_id, post_id, content)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [userId, postId, content]);
    const newComment = insertResult.rows[0];

    // Lấy thông tin bình luận chi tiết kèm profile người bình luận
    const detailQuery = `
        SELECT pc.id,
               pc.post_id,
               pc.user_id,
               COALESCE(u.name, split_part(u.email, '@', 1)) AS username,
               u.avatar_url,
               COALESCE(u.level, 1) AS level,
               COALESCE(u.badge_type, 'none') AS badge_type,
               pc.content,
               pc.created_at
        FROM post_comments pc
        JOIN users u ON pc.user_id = u.uid
        WHERE pc.id = $1
    `;
    const detailResult = await pool.query(detailQuery, [newComment.id]);
    return detailResult.rows[0];
};

module.exports = {
    getPostsFeed,
    getUserPosts,
    createPost,
    deletePost,
    toggleLike,
    getPostComments,
    createComment
};
