const fs = require('fs');
const path = require('path');
const pool = require('../db/index.js');

async function runMigrations() {
    const client = await pool.connect();
    try {
        console.log('Bắt đầu chạy migration...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) NOT NULL UNIQUE,
                run_at TIMESTAMP DEFAULT NOW()
            );
        `);
        const migrationsDir = path.join(__dirname, '../migrations');
        const files = fs.readdirSync(migrationsDir).sort();
        for (const file of files ){
            if (!file.endsWith('.sql')) continue;
            const check = await client.query('SELECT id FROM schema_migrations WHERE migration_name = $1', [file]);
            if (check.rows.length > 0) {
                console.log(`Bỏ qua: ${file} (đã chạy)`);
                continue;
            }
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf-8');
            console.log(`Đang chạy migration: ${file}...`);
            await client.query('BEGIN');
            await client.query(sql);
            await client.query('INSERT INTO schema_migrations (migration_name) VALUES ($1)', [file]);
            await client.query('COMMIT');
            console.log(`✅ Thành công: ${file}`);
        }
        console.log('Hoàn tất migration!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Lỗi chạy migration:', err);
    } finally{
        client.release();
        process.exit();
    }
    
}
runMigrations();