const { pool } = require('../config/db');

// Vendor Login
const vendorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find vendor by email
        const result = await pool.query(
            "SELECT id, shop_id, name, password_hash, email FROM vendors WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        const vendor = result.rows[0];

        // Simple password check (In production, use bcrypt)
        if (vendor.password_hash !== password) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        res.json({
            success: true,
            vendor: {
                id: vendor.id,
                shop_id: vendor.shop_id,
                name: vendor.name,
                email: vendor.email
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: 'Login Failed' });
    }
};

// Super Admin Create Vendor
const createVendor = async (req, res) => {
    try {
        const { name, phone, email, password, shop_id, business_type } = req.body;

        // Check availability
        const check = await pool.query(
            "SELECT id FROM vendors WHERE shop_id = $1 OR email = $2 OR phone_number = $3",
            [shop_id, email, phone]
        );

        if (check.rows.length > 0) {
            return res.status(400).json({ error: "Vendor with this Shop ID, Email or Phone already exists." });
        }

        const newVendor = await pool.query(
            `INSERT INTO vendors (name, phone_number, email, password_hash, shop_id, business_type) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, shop_id, name, email, phone_number, business_type`,
            [name, phone, email, password, shop_id, business_type]
        );

        res.status(201).json({ success: true, vendor: newVendor.rows[0] });

    } catch (error) {
        console.error("Create Vendor Error:", error);
        res.status(500).json({ error: "Failed to create vendor" });
    }
};

const getAllVendors = async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, shop_id, phone_number, email, is_paused, business_type FROM vendors ORDER BY created_at DESC");
        res.json({ success: true, vendors: result.rows });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch vendors" });
    }
};

module.exports = { vendorLogin, createVendor, getAllVendors };
