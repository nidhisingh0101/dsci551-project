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

router.put('/update', async (req,res) => {
    const { name, quantity, description, price, company } = req.body;
    const key = `Medicine:${name}`
    const dbIndex = customHash({ string: key, max: MedicineModels.length })

    let toBeUpdated = {}
    if(quantity) toBeUpdated['quantity'] = quantity
    if(description) toBeUpdated['description'] = description
    if(price) toBeUpdated['price'] = price
    if(company) toBeUpdated['company'] = company

    MedicineModels[dbIndex].findOne({name: name})
    .then(data => {
        MedicineModels[dbIndex].updateOne({name:name},{$set:{ ...toBeUpdated }})
        .then(() => {
            const updated = {...data._doc,...toBeUpdated}
            cache.put(key,updated)
            res.status(200).json(updated)
        })
    })    
    .catch(error => res.status(400).json(error))
})

router.delete('/remove', async (req, res) => {
    const { name } = req.body
    const key = `Medicine:${name}`
    const dbIndex = customHash({ string: key, max: MedicineModels.length })

    MedicineModels[dbIndex].deleteOne({name:name})
    .then(()=> {
        res.status(200).json({'Message':'Deleted'})
        cache.delete(key)
    })
    .catch((error)=> res.status(400).json(error))
})


export default router;