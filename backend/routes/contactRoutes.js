const express = require('express');
const router = express.Router();

// Mock database for contact messages
const messages = [];

router.post('/submit', (req, res) => {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const newMessage = {
        id: Date.now(),
        name,
        email,
        message,
        timestamp: new Date()
    };

    messages.push(newMessage);
    console.log('New Contact Message:', newMessage);

    // In a real app, send email here

    res.json({ success: true, message: 'Message received!' });
});

module.exports = router;
