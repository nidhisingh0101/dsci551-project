const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// POST route to add a new patient
router.post('/', async (req, res) => {
    try {
        const patient = new Patient(req.body);
        const savedPatient = await patient.save();
        res.status(201).json(savedPatient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
