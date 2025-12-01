const mongoose = require('mongoose');

const certificateMetadataSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    studentEmail: {
        type: String,
        required: true
    },
    transactionHash: {
        type: String,
        required: true
    },
    testnet: {
        type: String,
        required: true
    },
    issuerId: {
        type: String,
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CertificateMetadata', certificateMetadataSchema);
