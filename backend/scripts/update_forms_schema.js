const { pool } = require('../config/db');

async function updateSchema() {
    try {
        console.log("Updating schema for Forms...");

        // Add business_type to vendors
        try {
            await pool.query('ALTER TABLE vendors ADD COLUMN IF NOT EXISTS business_type VARCHAR(50);');
            console.log("Added business_type to vendors.");
        } catch (e) { console.log(e.message); }

        // Create vendor_forms
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vendor_forms (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                vendor_id UUID UNIQUE REFERENCES vendors(id),
                fields JSONB DEFAULT '[]',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Created vendor_forms table.");

        // Create vendor_customers
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vendor_customers (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                vendor_id UUID REFERENCES vendors(id),
                phone_number VARCHAR(20) NOT NULL,
                profile_data JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(vendor_id, phone_number)
            );
        `);
        console.log("Created vendor_customers table.");

        console.log("Schema update complete.");
        process.exit(0);
    } catch (error) {
        console.error("Schema update failed:", error);
        process.exit(1);
    }
}

updateSchema();
