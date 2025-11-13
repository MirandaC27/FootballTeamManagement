const mongoose = require('mongoose');

// Post schema
const postSchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    type: {
        type: String,
        required: false,
        default: null
    },
    path: {
        type: String,
        required: false,
        default: null
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
    },
    likesCount: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'postComment'
    }]
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
    return await postModel.findById(id).populate("owner_id", "name username").populate({
        path: "comments",
        populate: { path: "owner_id", select: "name username" }
    });
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

/**
 * Update containsMinors boolean.
 * @param {*} id post document id
 * @param {*} containsMinors post containsMinor (boolean)
 * @returns update
 */
async function updateContainsMinors(id, containsMinors) {
    return await postModel.updateOne({ _id: id }, { $set: { containsMinors: containsMinors } });
}

/**
 * Check and then return updated array for likedBy
 * @param {*} id post id
 * @param {*} user user id
 */
async function updateLikeReaction(id, user) {
    const post = await postModel.findById(id);
    const alreadyLiked = post.likedBy.includes(user);

    // Check if post already been liked by user to toggle off the filled in 'like' reaction
    if (alreadyLiked) {
        post.likedBy.pull(user);
        post.likesCount--;
    } else {
        post.likedBy.push(user);
        post.likesCount++;
    }
    await post.save();
    return { isLiked: !alreadyLiked, count: post.likesCount };
}

module.exports = {
    postModel,
    readAll,
    read,
    create,
    del,
    deleteAll,
    updateContainsMinors,
    updateLikeReaction
};