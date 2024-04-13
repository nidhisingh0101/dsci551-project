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

let connections = [];

let PatientModels;
let MedicineModels

export const createConnectionAndModels = () => {

    connections = DATABASES.map(db => {
        return {
            primary: mongoose.createConnection(db.primary).once('connected', () => console.log(`${db.primary} Connected`)),
            secondary: mongoose.createConnection(db.secondary).once('connected', () => console.log(`${db.secondary} Connected`)),
        }
    })

    MedicineModels = connections.map(db => {
        return {
            primary: db.primary.model('Medicine',medicineSchema),
            secondary: db.secondary.model('Medicine',medicineSchema)
        }
    })

    PatientModels = connections.map(db => {
        return {
            primary: db.primary.model('Patient',patientSchema),
            secondary: db.secondary.model('Patient',patientSchema)
        }
    })

    return { MedicineModels, PatientModels }

}




