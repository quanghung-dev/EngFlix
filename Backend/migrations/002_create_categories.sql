CREATE TABLE IF NOT EXISTS categories (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT uq_categories_name UNIQUE (name)
);