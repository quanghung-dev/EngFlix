CREATE TABLE IF NOT EXISTS users (
    uid         VARCHAR(255) PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    name        VARCHAR(255),
    user_role   VARCHAR(255) NOT NULL,
    avatar_url  VARCHAR(500),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_email UNIQUE (email)
);