// models/Medicine.js
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    ID: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    company: { type: String, required: true }
});
const Medicine= mongoose.model('Medicine', medicineSchema);
module.exports = Medicine;
