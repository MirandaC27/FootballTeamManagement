const dao = require('../model/PostDao');
// const commentDao = require('../model/commentDao');

/**
 * Upload a post with image or video or just text.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 * @returns 
 */
const uploadPost = async (req, res) => {
    try {
        let filePath = null;
        let fileType = null;

        if (req.file) {
            filePath = `/uploads/${req.file.filename}`;
            fileType = req.file.mimetype;
        }

        const newPost = {
            owner_id: req.session.user._id,
            path: filePath,
            type: fileType,
            caption: req.body.caption,
            containsMinors: req.body.containsMinors
        };
        await dao.create(newPost);
        console.log('success uploaded');
        res.send('Successfully uploaded');

    } catch (err) {
        console.log(err);
        res.status(500).send('Error uploading file');
    }
};

/**
 * Get all posts from the database.
 * @param {*} req request object containing data
 * @param {*} res response object to send back
 */
const getAllPosts = async (req, res) => {
    try {
        let posts = await dao.readAll();

        if (!req.session.user) {
            posts = posts.filter(post => !post.containsMinors);
        }

        res.json(posts);
    } catch (err) {
        res.status(500).send('Error getting posts');
    }
};

/**
 * Update containsMinors boolean for a post, admin only.
 * @param {*} req request object
 * @param {*} res response object
 */
const updateContainsMinors = async (req, res) => {
    try {
        const postId = req.params.id;
        const containsMinors = req.body.containsMinors;
        await dao.updateContainsMinors(postId, containsMinors);

    } catch (err) {
        console.log(err);
        res.status(500).send('Error updating containsMinors');
    }
};

/**
 * Toggle a 'like' reaction by a user on a post.
 * @param {*} req request object
 * @param {*} res response object
 */
const updateLikeReaction = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user._id;
        const result = await dao.updateLikeReaction(postId, userId);
        res.json({ isLiked: result.isLiked, count: result.count });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating likes');
    }
};

/**
 * Get a single post and its content.
 * @param {*} req request object
 * @param {*} res response object
 */
const getPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await dao.read(postId);
        res.json(post);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error getting a post');
    }
};

module.exports = {
    uploadPost,
    getAllPosts,
    updateContainsMinors,
    updateLikeReaction,
    getPost
};