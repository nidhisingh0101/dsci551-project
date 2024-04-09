import mongoose from "mongoose"
export const patientSchema = new mongoose.Schema({
    name: String,
    age: Number,
    gender: String
});



