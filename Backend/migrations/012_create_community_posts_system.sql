-- Tạo bảng posts
CREATE TABLE IF NOT EXISTS posts (
    id         SERIAL PRIMARY KEY,
    user_id    VARCHAR(255) NOT NULL REFERENCES users (uid) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    image_url  VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index tăng tốc tìm bài viết của người dùng hoặc bài viết mới nhất
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);

-- Tạo bảng lượt thích bài viết post_likes
CREATE TABLE IF NOT EXISTS post_likes (
    id         SERIAL PRIMARY KEY,
    post_id    INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    user_id    VARCHAR(255) NOT NULL REFERENCES users (uid) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    -- Đảm bảo mỗi người dùng chỉ like bài viết tối đa 1 lần
    CONSTRAINT uq_post_likes UNIQUE (post_id, user_id)
);

-- Tạo bảng bình luận bài viết post_comments
CREATE TABLE IF NOT EXISTS post_comments (
    id         SERIAL PRIMARY KEY,
    post_id    INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    user_id    VARCHAR(255) NOT NULL REFERENCES users (uid) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index tăng tốc tải bình luận bài viết
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments (post_id);
