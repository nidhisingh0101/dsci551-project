import express from "express"
const router = express.Router();
import { PatientModels } from "../server.js";
import { customHash } from "../utils.js";

// POST route to add a new patient
router.post('/', async (req, res) => {
    try {
        // Extract patient data from the request body
        const { name, age, gender } = req.body;
        const str = JSON.stringify(req.body)
        const dbIndex = customHash({ string: str, max: PatientModels.length })
        // console.log(dbIndex)

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

export default router