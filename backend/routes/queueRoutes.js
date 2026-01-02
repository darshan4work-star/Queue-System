const express = require('express');
const router = express.Router();
const { createTokenWebhook, callNextToken, getVendorPublic, updateVendorSettings, cancelToken } = require('../controllers/queueController');

// Route for Missed Call Webhook (Token Generation)
router.post('/webhook/missed-call', createTokenWebhook);

// Route for Vendor Actions
router.post('/next', callNextToken);
router.post('/vendor/settings', updateVendorSettings);
router.post('/cancel', cancelToken);

// Public/Display Routes
router.get('/public/:shop_id', getVendorPublic);

module.exports = router;
