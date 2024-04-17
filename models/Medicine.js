import mongoose from "mongoose"


export const medicineSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    description: String,
    price: Number,
    company: String,
    imageURL: String,
});


