const mongoose = require('mongoose');

// Post Comment schema
const postCommentSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        required: true
    },
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    message: {
        type: String,
        default: ""
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const postCommentModel = mongoose.model('postComment', postCommentSchema);

/**
 * Read and return all post comments for a post from the database.
 */
async function readAll(postId) {
    return await postCommentModel.find({ post_id: postId }).populate('owner_id', 'name username')
        .sort({ uploadedAt: -1 });
}

/**
 * Read and return a single post comment document by its ID.
 * @param {*} id post comment id
 * @returns post comment model object if found
 */
async function read(id) {
    return await postCommentModel.findById(id);
}

/**
 * Create and save a new post comment document in the database.
 * @param {*} newPost new post comment document
 * @returns new object
 */
async function create(newPostComment) {
    const postComment = new postCommentModel(newPostComment);
    await postComment.save();
    return postComment;
}

/**
 * Delete a single comment document by its ID.
 * @param {*} id post comment document id
 * @returns deleted object if found
 */
async function del(id) {
    return await postCommentModel.findByIdAndDelete(id);
}

/**
 * Delete all post comments documents in database.
 */
async function deleteAll() {
    await postCommentModel.deleteMany();
}

module.exports = {
    postCommentModel,
    readAll,
    read,
    create,
    del,
    deleteAll,
};