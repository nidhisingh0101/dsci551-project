import express from "express"
import { customHash } from "../utils/hash.js";
import { LRUCache } from "../utils/cache.js";
import { cacheMiddleware } from "../middleware/cache.js";
import { PatientModels } from "../server.js";

const router = express.Router();
const cache = new LRUCache(15);
let intervalID

const syncDatabases = () => {
    PatientModels.forEach( async (db) => {

        if(db.primary && db.secondary){
        
            const primaryData = await db.primary.find({}).exec()
            const secondaryData = await db.secondary.find({}).exec()

            primaryData.forEach(async (doc) => {
                db.secondary.updateOne({ _id: doc._id }, doc, { upsert: true })
                    .then(res => console.log('Synchronized'))
                    .catch(error => console.log('Failed to synchronize'))
            })

            secondaryData.forEach(async (doc) => {
                db.primary.updateOne({ _id: doc._id }, doc, { upsert: true })
                    .then(res => console.log('Synchronized'))
                    .catch(error => console.log('Failed to synchronize'))
            })
        }
        else{
            clearInterval(intervalID)
            console.log('One or more Databases are not online')
            return;
        }
    })
}

intervalID = setInterval(syncDatabases,180000)


// POST route to add a new Patient
router.post('/add', cacheMiddleware('Patient','name',cache) ,async (req, res) => {
    // Extract Patient data from the request body
    const { name, age, gender } = req.body;
    const key = `Patient:${name}`
    const dbIndex = customHash({ string: key, max: PatientModels.length })
    
    console.log(dbIndex)
    // Create a new Patient document
    const patient = new PatientModels[dbIndex].primary({
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

    PatientModels[dbIndex].primary.findOne({name: name})
    .then(data => {
        cache.put(key,data)
        res.status(200).json(data)
    })
    .catch(primaryError => {
        console.error('Failed to fetch data from primary database:', primaryError);
        console.log('Attempting to fetch data from secondary database...');

        PatientModels[dbIndex].secondary.findOne({ name: name })
            .then(data => {
                cache.put(key, data);
                res.status(200).json(data);
            })
            .catch(secondaryError => {
                console.error('Failed to fetch data from secondary database:', secondaryError);
                res.status(400).json({ error: 'Failed to fetch data from primary and secondary databases' });
            });
    });

})

router.get('/getAll', async (req, res) => {

    let response = []
    
    PatientModels.forEach(db => {

        if(db.primary){
            db.primary.find({})
            .then(data => {
                response.push(data)
            })
            .catch(secondaryError => {
                console.error('Failed to fetch data from secondary database:', secondaryError);
                res.status(400).json({ error: 'Failed to fetch data from primary and secondary databases' });
            });
        }
        else if(db.secondary){
            db.secondary.find({})
            .then(data => {
                response.push(data)
            })
            .catch(secondaryError => {
                console.error('Failed to fetch data from secondary database:', secondaryError);
                res.status(400).json({ error: 'Failed to fetch data from primary and secondary databases' });
            });
        }
    })

    res.status(200).json(response)
});


router.put('/update', async (req,res) => {
    const { name, age, gender } = req.body;
    const key = `Patient:${name}`
    const dbIndex = customHash({ string: key, max: PatientModels.length })

    let toBeUpdated = {}
    if(age) toBeUpdated['age'] = age
    if(gender) toBeUpdated['gender'] = gender

    PatientModels[dbIndex].primary.findOne({name: name})
    .then(data => {
        PatientModels[dbIndex].primary.updateOne({name:name},{$set:{ ...toBeUpdated }})
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
    const key = `Patient:${name}`
    const dbIndex = customHash({ string: key, max: PatientModels.length })

    PatientModels[dbIndex].primary.deleteOne({name:name})
    .then(()=> {
        res.status(200).json({'Message':'Deleted'})
        cache.delete(key)
    })
    .catch((error)=> res.status(400).json(error))
})

export default router;