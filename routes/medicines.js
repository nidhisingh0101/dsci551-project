import express from "express"
const router = express.Router();
import { MedicineModels } from "../server.js";
import { customHash } from "../utils.js";

// POST route to add a new medicine
router.post('/', async (req, res) => {
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

export default router;