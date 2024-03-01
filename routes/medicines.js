// routes/medicines.js
const express = require('express');
const router = express.Router();
const Medicine = require('../models/Maedicine');

// Homepage route
router.get('/', (req, res) => {
    res.sendFile('index.html', { root: './views' });
});

// Patient registration route
router.post('/', async (req, res) => {
    try {
        const { name, email } = req.body;
        const medicine = new Medicine({ name, email });
        await medicine.save();
        res.send('successfully');
    } catch (err) {
        res.status(400).send('Error');
    }
});

module.exports = router;