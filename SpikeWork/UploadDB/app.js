const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// local storage (creates uploads folder)
const Storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

/**
 * Multer middleware for uploading a single image/video. 
 */
const upload = multer({
    storage: Storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('media');

/**
 * Validate file type to ensure it's an image or video. 
 * @param {*} file file object
 * @param {*} cb callback function that handles file upload
 * @returns true if accepted or false if not
 */
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|mp4/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: accepted file types are jpeg, jpg, png, gif, mp4)');
    }
}

const MediaCont = require("./controller/MediaController");

// media controller routes
app.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).send(err);
        MediaCont.uploadMedia(req, res);
    })
});

app.use(express.static('view'));

module.exports = app;
