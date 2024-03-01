const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// POST route to add a new medicine
router.post('/', async (req, res) => {
    try {
        const medicine = new Medicine(req.body);
        const savedMedicine = await medicine.save();
        res.status(201).json(savedMedicine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
