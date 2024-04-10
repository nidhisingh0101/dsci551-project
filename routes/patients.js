import express from "express"
import { PatientModels } from "../server.js";
import { customHash } from "../utils/hash.js";
import { LRUCache } from "../utils/cache.js";
import { cacheMiddleware } from "../middleware/cache.js";

const router = express.Router();
const cache = new LRUCache(15);

// POST route to add a new Patient
router.post('/add', cacheMiddleware('Patient','name',cache) ,async (req, res) => {
    // Extract Patient data from the request body
    const { name, age, gender } = req.body;
    const key = `Patient:${name}`
    const dbIndex = customHash({ string: key, max: PatientModels.length })
    
    console.log(dbIndex)
    // Create a new Patient document
    const patient = new PatientModels[dbIndex]({
        name,
        age,
        gender
    });

    // Save the Patient document to the database
    patient.save()
    .then((savedData) => {
        cache.put(key,savedData)
        res.status(200).json(savedData)
    })
    .catch((error) => res.status(400).json(error))
});

router.get('/get', cacheMiddleware('Patient','name',cache) ,async (req,res) => {
    const { name } = req.body
    console.log(name)
    const key = `Patient:${name}`
    const dbIndex = customHash({ string: key, max: PatientModels.length })
    console.log(dbIndex)

    PatientModels[dbIndex].findOne({name: name})
    .then(data => {
        cache.put(key,data)
        res.status(200).json(data)
    })
    .catch(error => res.status(400).json(error))

})


export default router;