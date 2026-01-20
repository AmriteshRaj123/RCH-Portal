const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    age: { type: Number, required: true },
    location: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['Mother', 'Child'], 
        required: true 
    },
    healthStatus: { 
        type: String, 
        enum: ['Healthy', 'Under Treatment', 'Critical'], 
        default: 'Healthy' 
    },
    lastCheckup: { type: Date, default: Date.now }
}, { timestamps: true }); // Isse 'createdAt' aur 'updatedAt' apne aap ban jayenge

module.exports = mongoose.model('Patient', PatientSchema);