const express = require('express');
const router = express.Router();
const { vendorLogin, createVendor, getAllVendors } = require('../controllers/authController');

router.post('/vendor/login', vendorLogin);
router.post('/admin/create-vendor', createVendor);
router.get('/admin/vendors', getAllVendors);

module.exports = router;
