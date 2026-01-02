const { pool } = require('../config/db');

async function updateSchema() {
    try {
        console.log("Updating schema...");

        // Add email column if it doesn't exist
        try {
            await pool.query('ALTER TABLE vendors ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;');
            console.log("Added email column.");
        } catch (e) {
            console.log("Email column might already exist or error: " + e.message);
        }

        // Add logo_url column if it doesn't exist
        try {
            await pool.query('ALTER TABLE vendors ADD COLUMN IF NOT EXISTS logo_url TEXT;');
            console.log("Added logo_url column.");
        } catch (e) {
            console.log("Logo_url column might already exist or error: " + e.message);
        }

        console.log("Schema update complete.");
        process.exit(0);
    } catch (error) {
        console.error("Schema update failed:", error);
        process.exit(1);
    }
}

updateSchema();
