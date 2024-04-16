import mongoose from "mongoose"
import { medicineSchema } from "../models/Medicine.js";
import { patientSchema } from "../models/Patient.js";

const DATABASES = [{
        name: 'db1',
        primary: 'mongodb://localhost:27017/db1',
        secondary: 'mongodb://localhost:27018/db1Secondary'
    },
    {
        name:'db2',
        primary: 'mongodb://localhost:27017/db2',
        secondary: 'mongodb://localhost:27018/db2Secondary'
    }
]


export const createConnectionAndModels = async () => {

    let connections = [];
    try {
        const connectionPromises = DATABASES.map(async (db) => {
        let primary;
        let secondary;
        try {
            primary = await mongoose.createConnection(db.primary).asPromise();
            
        } catch (error) {
            // Log or handle the error for the specific database connection
            console.error(`Error connecting to database: ${error.message}`);
            primary = null
        }
        try {
            secondary = await mongoose.createConnection(db.secondary).asPromise();
            
        } catch (error) {
            // Log or handle the error for the specific database connection
            console.error(`Error connecting to database: ${error.message}`);
            secondary = null
        }
        return {
            primary,secondary
        }
    });

        const results = await Promise.allSettled(connectionPromises);
        connections = results
        .filter(result => result.status === 'fulfilled') // Filter out successful connections
        .map(result => result.value); // Extract the connection objects from the results

    } 
    catch (error) {
        console.error(`Error connecting to databases: ${error.message}`);
    }

    console.log(connections);

    const MedicineModels = connections.map(db => {
        return {
            primary: db.primary?.model('Medicine',medicineSchema),
            secondary: db.secondary?.model('Medicine',medicineSchema)
        }
    })

    const PatientModels = connections.map(db => {
        return {
            primary: db.primary?.model('Patient',patientSchema),
            secondary: db.secondary?.model('Patient',patientSchema)
        }
    })

    return { MedicineModels, PatientModels }

}




