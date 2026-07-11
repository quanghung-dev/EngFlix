-- Tạo bảng mối quan hệ bạn bè friendships
CREATE TABLE IF NOT EXISTS friendships (
    id         SERIAL PRIMARY KEY,
    user_id    VARCHAR(255) NOT NULL REFERENCES users (uid) ON DELETE CASCADE,
    friend_id  VARCHAR(255) NOT NULL REFERENCES users (uid) ON DELETE CASCADE,
    status     VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' (đang chờ), 'accepted' (đã kết bạn)
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    -- Đảm bảo không tạo trùng lặp mối quan hệ giữa 2 người
    CONSTRAINT uq_friendships UNIQUE (user_id, friend_id)
);

-- Index tối ưu truy vấn bạn bè
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships (user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships (friend_id);
