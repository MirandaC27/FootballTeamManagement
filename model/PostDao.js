const mongoose = require('mongoose');

// Post schema
const postSchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    type: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        default: ""
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    containsMinors: {
        type: Boolean,
        default: false
    }
    /*
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment'
    }]*/
});

const postModel = mongoose.model('post', postSchema);

/**
 * Read and return all post documents from the database.
 */
async function readAll() {
    return await postModel.find().populate('owner_id', 'name username').sort({ uploadedAt: -1 });    
}

/**
 * Read and return a single post document by its ID.
 * @param {*} id post id
 * @returns post model object if found
 */
async function read(id) {
    return await postModel.findById(id);
}

/**
 * Create and save a new post document in the database.
 * @param {*} newPost new post document
 * @returns new object
 */
async function create(newPost) {
    const post = new postModel(newPost);
    await post.save();
    return post;
}

/**
 * Delete a single post document by its ID.
 * @param {*} id post document id
 * @returns deleted object if found
 */
async function del(id) {
    return await postModel.findByIdAndDelete(id);
}

/**
 * Delete all post documents in database.
 */
async function deleteAll() {
    await postModel.deleteMany();
}

module.exports = {
    postModel,
    readAll,
    read,
    create,
    del,
    deleteAll
};