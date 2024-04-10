import express from "express"
const router = express.Router();
import { MedicineModels } from "../server.js";
import { customHash } from "../utils/hash.js";
import { LRUCache } from "../utils/cache.js";
import { cacheMiddleware } from "../middleware/cache.js";


const cache = new LRUCache(15);

// POST route to add a new medicine
router.post('/add', cacheMiddleware('Medicine','name',cache) ,async (req, res) => {
    // Extract medicine data from the request body
    const { name, quantity, description, price, company } = req.body;

    const key = `Medicine:${name}`
    const dbIndex = customHash({ string: key, max: MedicineModels.length })
    console.log(dbIndex)
    // Create a new Medicine document
    const medicine = new MedicineModels[dbIndex]({
        name,
        quantity,
        description,
        price,
        company
    })

    // Save the medicine document to the database
    medicine.save()
    .then((savedData) => {
        cache.put(key,savedData)
        res.status(200).json(savedData)
    })
    .catch((error) => res.status(400).json(error))
});

router.get('/get', cacheMiddleware('Medicine','name',cache) ,async (req,res) => {
    const { name } = req.body
    console.log(name)
    const key = `Medicine:${name}`
    const dbIndex = customHash({ string: key, max: MedicineModels.length })
    console.log(dbIndex)

    MedicineModels[dbIndex].findOne({name: name})
    .then(data => {
        cache.put(key,data)
        res.status(200).json(data)
    })
    .catch(error => res.status(400).json(error))

})


export default router;