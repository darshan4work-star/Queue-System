const { pool } = require('../config/db');

// Save Form Structure
const saveForm = async (req, res) => {
    try {
        const { vendor_id, fields } = req.body;
        // Upsert logic
        await pool.query(
            `INSERT INTO vendor_forms (vendor_id, fields) 
             VALUES ($1, $2) 
             ON CONFLICT (vendor_id) 
             DO UPDATE SET fields = $2, created_at = NOW()`,
            [vendor_id, JSON.stringify(fields)]
        );
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to save form" });
    }
};

// Get Form
const getForm = async (req, res) => {
    try {
        const { vendor_id } = req.params;
        const result = await pool.query("SELECT fields FROM vendor_forms WHERE vendor_id = $1", [vendor_id]);

        if (result.rows.length > 0) {
            res.json({ success: true, fields: result.rows[0].fields });
        } else {
            res.json({ success: true, fields: [] }); // No form
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to get form" });
    }
};

// Check User & Submit Data
const checkUserAndSubmit = async (req, res) => {
    try {
        const { vendor_id, phone_number, profile_data } = req.body;

        // Save User Data (Upsert)
        await pool.query(
            `INSERT INTO vendor_customers (vendor_id, phone_number, profile_data)
             VALUES ($1, $2, $3)
             ON CONFLICT (vendor_id, phone_number)
             DO UPDATE SET profile_data = $3, created_at = NOW()`,
            [vendor_id, phone_number, JSON.stringify(profile_data)]
        );

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to submit data" });
    }
};

// Update Customer Data (Vendor)
const updateCustomer = async (req, res) => {
    try {
        const { vendor_id, phone_number, profile_data } = req.body;

        // Merge existing data? Or Overwrite? Usually overwrite for edit form.
        await pool.query(
            `UPDATE vendor_customers 
             SET profile_data = $1 
             WHERE vendor_id = $2 AND phone_number = $3`,
            [JSON.stringify(profile_data), vendor_id, phone_number]
        );

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update customer" });
    }
};

module.exports = { saveForm, getForm, checkUserAndSubmit, updateCustomer };
