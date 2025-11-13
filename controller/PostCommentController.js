const dao = require('../model/PostCommentDao');

/**
 * Add a comment to a post.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const addComment = async (req, res) => {
    try {
        const newComment = {
            post_id: req.params.postId,
            owner_id: req.session.user._id,
            message: req.body.message
        };
        const created = await dao.create(newComment);
        res.json(created);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding comment');
    }
};

/**
 * Get all comments for a specific post.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const getAllComments = async (req, res) => {
    try {
        const postId = req.params.postId;
        const comments = await dao.readAll(postId);
        res.json(comments);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error getting comments');
    }
};

module.exports = {
    addComment,
    getAllComments
};