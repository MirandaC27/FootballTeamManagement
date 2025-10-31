const mediaModel = require('../model/MediaDao');

/**
 * Upload a video/image data to the database.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 * @returns 
 */
const uploadMedia = async (req, res) => {
    if (!req.file) {
        return res.status(500).send("Error no file");
    }

    try {
        // Attempt to save media
        const newMedia = new mediaModel({
            name: req.body.name,
            path: `/uploads/${req.file.filename}`,
            type: req.file.mimetype,
        });
        await newMedia.save();
        console.log('success uploaded');
        res.send('Successfully uploaded');

    } catch (err) {
        console.log(err);
        res.status(500).send('Error uploading file');
    }
};

module.exports = { uploadMedia };