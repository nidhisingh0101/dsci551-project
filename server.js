import express from "express"
import bodyParser from 'body-parser';
import { createConnectionAndModels } from "./config/database.js";
import { customHash } from "./utils.js";

const app = express();
const port = 7000;

// MongoDB connection
const { PatientModels, MedicineModels } = createConnectionAndModels()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS)
// app.use(express.static('public'));

// Routes

app.get('/', (req, res) => res.send({message: "Full Sex"}))

app.post('/patients', async (req, res) => {
    try {
        // Extract patient data from the request body
        const { name, age, gender } = req.body;
        const str = JSON.stringify(req.body)
        const dbIndex = customHash({ string: str, max: PatientModels.length })
        console.log(dbIndex)

        // Create a new Patient document
        const patient = new PatientModels[dbIndex]({
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

        const str = JSON.stringify(req.body)
        const dbIndex = customHash({ string: str, max: MedicineModels.length })

        // Create a new Medicine document
        const medicine = new MedicineModels[dbIndex]({
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
