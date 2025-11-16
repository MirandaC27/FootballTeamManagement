const mongoose = require('mongoose');

const matchChatSchema = new mongoose.Schema({
    match_id: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false
    },
    name: {
        type: String,
        required: true
    },
    text: {
        type: String,
        default: ""
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const matchChatModel = mongoose.model('matchChat', matchChatSchema);

/**
 * Read and return all chat messages (oldest to most recent).
 */
async function readAll() {
    return await matchChatModel.find().populate('user_id', 'name').sort({ uploadedAt: 1 });
}

/**
 * Read and return chat messages for a specific match.
 * @param {*} id match id
 */
async function read(id) {
    return await matchChatModel.find({ match_id: id }).populate('user_id', 'name').sort({ uploadedAt: 1 }); 
}

/**
 * Create and save a new chat message document into database.
 * @param {*} newMsg object
 */
async function create(newMsg) {
    const msg = new matchChatModel(newMsg);
    await msg.save();
    return msg;
}

/**
 * Delete a single chat message by ID.
 */
async function del(id) {
    return await matchChatModel.findByIdAndDelete(id);
}

/**
 * Delete all chat messages.
 */
async function deleteAll() {
    await matchChatModel.deleteMany();
}

module.exports = {
    matchChatModel,
    readAll,
    read,
    create,
    del,
    deleteAll
};