const mongoose = require('mongoose');

// for both images and videos
const mediaSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    type: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});
const mediaModel = mongoose.model('media', mediaSchema);

module.exports = mediaModel; 