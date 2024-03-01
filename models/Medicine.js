const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    description: String,
    price: Number,
    company: String
    // Add more fields as needed
});

module.exports = mongoose.model('Medicine', medicineSchema);
