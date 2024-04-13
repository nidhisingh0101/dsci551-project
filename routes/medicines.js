import express from "express"
import { customHash } from "../utils/hash.js";
import { LRUCache } from "../utils/cache.js";
import { cacheMiddleware } from "../middleware/cache.js";
import { MedicineModels } from "../server.js";

const router = express.Router();
const cache = new LRUCache(15);

setInterval(()=>{
    MedicineModels.forEach(db => {
        db.primary.find({})
        .then(data => {
            data.forEach(async (doc) => {
                db.secondary.updateOne({ _id: doc._id }, doc, { upsert: true })
                .then(res => console.log('Synchronized'))
                .catch(error => console.log('Failed to synchronize'))
            
            });
        })
    })
},180000)

// POST route to add a new medicine
router.post('/add', cacheMiddleware('Medicine','name',cache) ,async (req, res) => {
    // Extract medicine data from the request body
    const { name, quantity, description, price, company } = req.body;

    const key = `Medicine:${name}`
    const dbIndex = customHash({ string: key, max: MedicineModels.length })
    console.log(dbIndex)
    // Create a new Medicine document
    const medicine = new MedicineModels[dbIndex].primary({
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

router.get('/get', cacheMiddleware('Medicine', 'name', cache), async (req, res) => {
    const { name } = req.body;
    console.log(name);
    const key = `Medicine:${name}`;
    const dbIndex = customHash({ string: key, max: MedicineModels.length });
    console.log(dbIndex);

    MedicineModels[dbIndex].primary.findOne({ name: name })
        .then(data => {
            cache.put(key, data);
            res.status(200).json(data);
        })
        .catch(primaryError => {
            console.error('Failed to fetch data from primary database:', primaryError);
            console.log('Attempting to fetch data from secondary database...');

            MedicineModels[dbIndex].secondary.findOne({ name: name })
                .then(data => {
                    cache.put(key, data);
                    res.status(200).json(data);
                })
                .catch(secondaryError => {
                    console.error('Failed to fetch data from secondary database:', secondaryError);
                    res.status(400).json({ error: 'Failed to fetch data from primary and secondary databases' });
                });
        });
});


router.put('/update', async (req,res) => {
    const { name, quantity, description, price, company } = req.body;
    const key = `Medicine:${name}`
    const dbIndex = customHash({ string: key, max: MedicineModels.length })

    let toBeUpdated = {}
    if(quantity) toBeUpdated['quantity'] = quantity
    if(description) toBeUpdated['description'] = description
    if(price) toBeUpdated['price'] = price
    if(company) toBeUpdated['company'] = company

    MedicineModels[dbIndex].primary.findOne({name: name})
    .then(data => {
        MedicineModels[dbIndex].primary.updateOne({name:name},{$set:{ ...toBeUpdated }})
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

    MedicineModels[dbIndex].primary.deleteOne({name:name})
    .then(()=> {
        res.status(200).json({'Message':'Deleted'})
        cache.delete(key)
    })
    .catch((error)=> res.status(400).json(error))
})


export default router;