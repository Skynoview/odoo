const fs = require('fs');
const path = require('path');
const { pool } = require('./src/config/database');

async function applyMigration() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'migrations', '004_refactor_vehicles_table.sql'), 'utf8');

        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            if (statement.toUpperCase().startsWith('USE')) continue;
            await pool.execute(statement);
            console.log('Executed statement successfully.');
        }
        console.log('✅ Migration 004 applied successfully.');
    } catch (err) {
        console.error('❌ Migration 004 failed:', err.message);
    } finally {
        process.exit();
    }
}

applyMigration();
