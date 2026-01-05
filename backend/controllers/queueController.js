const TokenService = require('../services/tokenService');
const { pool } = require('../config/db'); // Direct pool access for auth check

// Generate Token (Public)
const createTokenWebhook = async (req, res) => {
    try {
        const { shop_id, user_phone, skip_form, is_guest } = req.body;

        if (!shop_id || (!user_phone && !is_guest)) {
            return res.status(400).json({ error: "Shop ID and Phone required" });
        }

        const vendorRes = await pool.query("SELECT id, is_paused FROM vendors WHERE shop_id = $1", [shop_id]);
        if (vendorRes.rows.length === 0) return res.status(404).json({ error: "Shop not found" });

        const vendor = vendorRes.rows[0];
        const vendorId = vendor.id;

        if (vendor.is_paused) return res.status(400).json({ error: "Queue is paused" });

        // Check if Form Required
        const formRes = await pool.query("SELECT fields FROM vendor_forms WHERE vendor_id = $1 AND is_active = TRUE", [vendorId]);
        const hasForm = formRes.rows.length > 0 && formRes.rows[0].fields.length > 0;

        // Skip form if guest OR explicitly skipped
        if (hasForm && !skip_form && !is_guest) {
            // Check if customer exists
            const customerRes = await pool.query("SELECT id FROM vendor_customers WHERE vendor_id = $1 AND phone_number = $2", [vendorId, user_phone]);
            const isExistingCustomer = customerRes.rows.length > 0;

            if (!isExistingCustomer) {
                // New Customer: Return empty form
                return res.json({
                    success: false,
                    requires_form: true,
                    form_fields: formRes.rows[0].fields
                });
            } else {
                // Existing Customer: Fetch previous data and Return form with PREFILL
                const existingDataRes = await pool.query("SELECT profile_data FROM vendor_customers WHERE vendor_id = $1 AND phone_number = $2", [vendorId, user_phone]);
                const previousData = existingDataRes.rows.length > 0 ? existingDataRes.rows[0].profile_data : {};

                return res.json({
                    success: false,
                    requires_form: true,
                    form_fields: formRes.rows[0].fields,
                    previous_data: previousData // Send back for prefill
                });
            }
        }

        // Create Token
        // Use provided phone OR null if guest
        const phoneToSave = is_guest ? null : user_phone;
        const token = await TokenService.createToken(vendorId, phoneToSave);

        // Emit Update
        const queueStatus = await TokenService.getQueueStatus(vendorId);

        if (req.io) {
            req.io.to(shop_id).emit('queue_update', queueStatus);
        }

        res.status(201).json({ success: true, token, queueStatus });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
}

const callNextToken = async (req, res) => {
    try {
        const { vendor_id, shop_id } = req.body;
        const targetShopId = shop_id || 'store1';

        if (!vendor_id) {
            return res.status(400).json({ error: 'Vendor ID required' });
        }

        const nextToken = await TokenService.callNextToken(vendor_id);
        const queueStatus = await TokenService.getQueueStatus(vendor_id);

        if (req.io) {
            req.io.to(targetShopId).emit('queue_update', queueStatus);
        }

        res.json({ success: true, nextToken, queueStatus });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const getVendorPublic = async (req, res) => {
    try {
        const { shop_id } = req.params;
        const vRes = await pool.query("SELECT id, name, shop_id, custom_message, logo_url, is_paused FROM vendors WHERE shop_id = $1", [shop_id]);

        if (vRes.rows.length === 0) {
            return res.status(404).json({ error: "Vendor not found" });
        }

        const vendor = vRes.rows[0];
        const queueStatus = await TokenService.getQueueStatus(vendor.id);

        res.json({ success: true, vendor, queue: queueStatus });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server Error" });
    }
};

const updateVendorSettings = async (req, res) => {
    try {
        const { vendor_id, custom_message, shop_id } = req.body;
        await pool.query("UPDATE vendors SET custom_message = $1 WHERE id = $2", [custom_message, vendor_id]);

        // Emit update to display
        if (req.io) {
            const queueStatus = await TokenService.getQueueStatus(vendor_id); // Refetch to be safe or just send msg
            // Actually display needs the message, queueStatus might not have it depending on service implementation
            // Let's attach message to event if needed or client refetches.
            // Best to emit a 'settings_update' or include in 'queue_update'

            // Let's modify TokenService.getQueueStatus to include vendor info if possible, or just emit separate event.
            // For simplicity, let's emit a generic update that causes refetch or carries data.
            req.io.to(shop_id).emit('message_update', { custom_message });
        }
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Update failed" });
    }
};

const cancelToken = async (req, res) => {
    try {
        const { token_id, vendor_id, shop_id } = req.body;

        await pool.query("UPDATE tokens SET status = 'CANCELLED' WHERE id = $1 AND vendor_id = $2", [token_id, vendor_id]);

        // Emit Update
        if (req.io) {
            const queueStatus = await TokenService.getQueueStatus(vendor_id);
            req.io.to(shop_id).emit('queue_update', queueStatus);
        }

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to cancel token" });
    }
};

module.exports = { createTokenWebhook, callNextToken, getVendorPublic, updateVendorSettings, cancelToken };
