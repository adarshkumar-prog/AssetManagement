const mongoose = require('mongoose');

const assetAssignmentSchema = new mongoose.Schema({
    assetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedAt: {
        type: Date,
        default: Date.now
    },
    unassignedAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['Assigned', 'Unassigned'],
        default: 'Assigned'
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('AssetAssignment', assetAssignmentSchema);