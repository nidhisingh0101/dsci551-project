const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 7000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/healthcare', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define schemas
const PatientSchema = new mongoose.Schema({
    name: String,
    age: Number,
    gender: String
});

const MedicineSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    description: String,
    price: Number,
    company: String
});

// Define models
const Patient = mongoose.model('Patient', PatientSchema);
const Medicine = mongoose.model('Medicine', MedicineSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Routes
app.post('/patients', async (req, res) => {
    try {
        // Extract patient data from the request body
        const { name, age, gender } = req.body;

        // Create a new Patient document
        const patient = new Patient({
            name,
            age,
            gender
        });

        // Save the patient document to the database
        const savedPatient = await patient.save();

        // Send the saved patient document as the response
        res.status(201).json(savedPatient);
    } catch (error) {
        // If an error occurs, send an error response
        res.status(500).json({ error: error.message });
    }
});

app.post('/medicines', async (req, res) => {
    try {
        // Extract medicine data from the request body
        const { name, quantity, description, price, company } = req.body;

        // Create a new Medicine document
        const medicine = new Medicine({
            name,
            quantity,
            description,
            price,
            company
        });

        // Save the medicine document to the database
        const savedMedicine = await medicine.save();

        // Send the saved medicine document as the response
        res.status(201).json(savedMedicine);
    } catch (error) {
        // If an error occurs, send an error response
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
