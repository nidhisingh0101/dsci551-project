import mongoose from "mongoose"
import { patientSchema } from "../models/Patient.js"
import { medicineSchema } from "../models/Medicine.js"

const DATABASES = ["mongodb://localhost:27017/db1","mongodb://localhost:27018/db2"]

export const createConnectionAndModels = () => {

    const connections = DATABASES.map( URL => mongoose.createConnection(URL).once('connected', () => console.log(`${URL} Connected`)).on('error', console.error.bind(console, `${URL} connection error:`)))

    const PatientModels = connections.map( db => db.model('Patient',patientSchema) )

    const MedicineModels = connections.map( db => db.model('Medicine',medicineSchema) )

    return {
       PatientModels, MedicineModels
    }

}

