const express = require('express');
const router = express.Router();
const { saveForm, getForm, checkUserAndSubmit, updateCustomer } = require('../controllers/formController');

// Save Form Structure (Admin)
router.post('/save', saveForm);

// Get Form Structure (Public/Admin)
router.get('/:vendor_id', getForm);

// Submit Form Data (Public)
router.post('/submit', checkUserAndSubmit);

// Update Customer Data (Vendor)
router.put('/customer', updateCustomer);

module.exports = router;
