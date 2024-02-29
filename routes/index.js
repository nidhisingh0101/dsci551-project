// routes/index.js
const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Homepage route
router.get('/', (req, res) => {
    res.sendFile('index.html', { root: './views' });
});

// Patient registration route
router.post('/patients', async (req, res) => {
    try {
        const { name, email } = req.body;
        const patient = new Patient({ name, email });
        await patient.save();
        res.send('Patient registered successfully');
    } catch (err) {
        res.status(400).send('Error registering patient');
    }
});

module.exports = router;
