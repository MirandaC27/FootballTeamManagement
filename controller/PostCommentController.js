const commentDao = require('../model/PostCommentDao');
const postDao = require('../model/PostDao');

/**
 * Add a comment to a post.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const addComment = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.session.user._id;
        const created = await commentDao.create({
            post_id: postId,
            owner_id: userId,
            message: req.body.message
        });

        await postDao.addCommentToPost(postId, created._id);
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
        const comments = await commentDao.readAll(postId);
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