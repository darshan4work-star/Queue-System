const { pool } = require('./config/db');

async function migrate() {
    try {
        console.log("Running migration...");
        await pool.query("ALTER TABLE vendors ADD COLUMN IF NOT EXISTS can_customize BOOLEAN DEFAULT FALSE;");
        console.log("Migration successful: Added can_customize to vendors table.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        pool.end();
    }
}

migrate();
