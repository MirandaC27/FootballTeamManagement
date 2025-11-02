const dao = require('../model/PostDao');
// const commentDao = require('../model/commentDao');

/**
 * Upload a post with image or video.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 * @returns 
 */
const uploadPost = async (req, res) => {
    if (!req.file) {
        return res.status(500).send("Error no file uploaded");
    }

    try {
        const newPost = {
            owner_id: req.session.user._id,
            path: `/uploads/${req.file.filename}`,
            type: req.file.mimetype,
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

module.exports = {
    uploadPost,
    getAllPosts,
    updateContainsMinors
};