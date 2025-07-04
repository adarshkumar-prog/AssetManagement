const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: {
            values: ["Laptop", "Desktop", "Monitor", "Phone", "Tablet", "Furniture", "Other"]
        },
        required: true
    },
    serialNumber: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ["Available", "Assigned", "Maintenance", "Retired"],
        required: true,
        default: "Available"
    },
},
{
    timestamps: true
});

module.exports = mongoose.model('Asset', assetSchema);