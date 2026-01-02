const { pool } = require('../config/db');

class TokenService {
    async createToken(vendorId, userPhone) {
        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const countRes = await pool.query(
                `SELECT COUNT(*) FROM tokens 
         WHERE vendor_id = $1 AND created_at >= $2`,
                [vendorId, todayStart]
            );

            // CHECK FOR DUPLICATE ACTIVE TOKEN
            const existingToken = await pool.query(
                `SELECT * FROM tokens 
                 WHERE vendor_id = $1 AND user_phone_number = $2 AND created_at >= $3 
                 AND status IN ('PENDING', 'SERVING')
                 ORDER BY created_at DESC LIMIT 1`,
                [vendorId, userPhone, todayStart]
            );

            if (existingToken.rows.length > 0) {
                return existingToken.rows[0];
            }

            const currentCount = parseInt(countRes.rows[0].count, 10);
            const tokenNumber = `A${(currentCount + 1).toString().padStart(2, '0')}`;

            const result = await pool.query(
                `INSERT INTO tokens (vendor_id, token_number, user_phone_number, status) 
         VALUES ($1, $2, $3, 'PENDING') 
         RETURNING *`,
                [vendorId, tokenNumber, userPhone]
            );

            return result.rows[0];
        } catch (err) {
            console.error('Error creating token:', err);
            throw err;
        }
    }

    async callNextToken(vendorId) {
        try {
            await pool.query(
                `UPDATE tokens SET status = 'COMPLETED', completed_at = NOW() 
         WHERE vendor_id = $1 AND status = 'SERVING'`,
                [vendorId]
            );

            const nextRes = await pool.query(
                `SELECT * FROM tokens 
         WHERE vendor_id = $1 AND status = 'PENDING' 
         ORDER BY created_at ASC 
         LIMIT 1`,
                [vendorId]
            );

            if (nextRes.rows.length === 0) {
                return null;
            }

            const nextToken = nextRes.rows[0];

            const updateRes = await pool.query(
                `UPDATE tokens SET status = 'SERVING', served_at = NOW() 
         WHERE id = $1 
         RETURNING *`,
                [nextToken.id]
            );

            return updateRes.rows[0];
        } catch (err) {
            console.error('Error calling next token:', err);
            throw err;
        }
    }

    async getQueueStatus(vendorId) {
        try {
            // Get Serving Token with Customer Details
            const servingRes = await pool.query(
                `SELECT t.token_number, t.user_phone_number, vc.profile_data, 
                 (SELECT COUNT(*) FROM tokens WHERE vendor_id = $1 AND user_phone_number = t.user_phone_number) as visit_count
                 FROM tokens t
                 LEFT JOIN vendor_customers vc ON t.vendor_id = vc.vendor_id AND t.user_phone_number = vc.phone_number
                 WHERE t.vendor_id = $1 AND t.status = 'SERVING' 
                 ORDER BY t.served_at DESC LIMIT 1`,
                [vendorId]
            );

            // Get Waiting List (Next 3) with Customer Details
            const waitingListRes = await pool.query(
                `SELECT t.id, t.token_number, t.user_phone_number, vc.profile_data
                 FROM tokens t
                 LEFT JOIN vendor_customers vc ON t.vendor_id = vc.vendor_id AND t.user_phone_number = vc.phone_number
                 WHERE t.vendor_id = $1 AND t.status = 'PENDING' 
                 ORDER BY t.created_at ASC LIMIT 3`,
                [vendorId]
            );

            // Get Waiting Count
            const countRes = await pool.query(
                `SELECT COUNT(*) FROM tokens WHERE vendor_id = $1 AND status = 'PENDING'`,
                [vendorId]
            );
            const waitingCount = parseInt(countRes.rows[0].count, 10);

            // Get Last Token
            const lastTokenRes = await pool.query(
                `SELECT token_number FROM tokens WHERE vendor_id = $1 ORDER BY created_at DESC LIMIT 1`,
                [vendorId]
            );
            const lastToken = lastTokenRes.rows.length > 0 ? lastTokenRes.rows[0].token_number : '--';

            let serving = '--';
            let servingDetails = null;

            if (servingRes.rows.length > 0) {
                serving = servingRes.rows[0].token_number;
                servingDetails = {
                    user_phone_number: servingRes.rows[0].user_phone_number,
                    visit_count: servingRes.rows[0].visit_count,
                    profile_data: servingRes.rows[0].profile_data
                };
            }

            return {
                serving,
                servingDetails,
                waiting: waitingCount, // used by display
                waitingCount, // used by vendor
                waitingList: waitingListRes.rows.map(r => r.token_number), // simple list for display
                waitingListDetails: waitingListRes.rows.map(r => ({
                    id: r.id,
                    token: r.token_number,
                    phone: r.user_phone_number,
                    profile_data: r.profile_data // Keep nested for modal
                })),
                last: lastToken
            };
        } catch (err) {
            console.error('Error getting queue status:', err);
            throw err;
        }
    }
}

module.exports = new TokenService();
