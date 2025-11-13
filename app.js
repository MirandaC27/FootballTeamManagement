const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'view')));

//route for calendar front end
app.use('/Calendar', express.static(path.join(__dirname, 'Calendar')));

// middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 86400000 }
}))

// local storage (creates uploads folder)
const Storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    let renamedFile = Date.now() + '_' + file.originalname; 
    cb(null, renamedFile);
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
  const filetypes = /jpeg|jpg|png|gif|webp|svg|tiff|bmp|mp4|mov|avi|mkv|webm|wmv|m4v/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: accepted file types are jpeg, jpg, png, gif, webp, svg, tiff, bmp, mp4, mov, avi, mkv, webm, wmv, m4v');
  }
}

function isAdmin(req, res, next) {

  const user = req.session.user;

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }

  next();
}

// user controller routes
const UserCont = require("./controller/UserController");
app.post('/register', UserCont.register);
app.post('/login', UserCont.login);
app.get('/logout', UserCont.logout);
app.get('/loggedUser', UserCont.loggedUser);
app.get('/getAllUsers', UserCont.getAllUsers);
app.put('/approveUser/:id', UserCont.approveUser);

// minor controller routes
const MinorCont = require('./controller/MinorController');
app.put('/reassignMinor/:minorId/:newTeamId', MinorCont.reassignMinor);
app.get('/getAllMinors', MinorCont.getAllMinors);

// team controller routes
const TeamCont = require('./controller/TeamController');
app.get('/getAllTeams', TeamCont.getAllTeams);

//match routes
const MatchCont = require('./controller/MatchController');

app.get('/matches', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'matches.html'));
});

app.get('/getAllMatches', MatchCont.getAllMatches);
app.get('/getMatchDetails/:id', MatchCont.getMatchDetails);

app.post('/createMatch', MatchCont.createNewMatch);
app.delete('/deleteMatch/:id', MatchCont.deleteMatch);
app.put('/updateMatch/:id', MatchCont.updateMatch);

//calendar routes
const EventCont = require('./controller/EventController');
console.log("EventCont loaded:", EventCont);


// Redirect /calendar to current month page
app.get('/calendar', (req, res) => {
  const now = new Date();
  res.redirect(`/calendar/month/${now.getMonth() + 1}?year=${now.getFullYear()}`);
});

// Serve the static calendar HTML
app.get('/calendar/month/:month', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'calendar.html'));
});

// Return JSON calendar data for the given month/year
app.get('/calendar/data/:year/:month', EventCont.getCalendarData);

// event routes
app.post('/addEvent', isAdmin, EventCont.createNewEvent);
app.get('/getAllEvent', isAdmin, EventCont.getAllEvents);
app.delete('/deleteEvent/:id', isAdmin, EventCont.deleteEvent);
app.put('/updateEvent/:id', isAdmin, EventCont.updateEvent);


// schedule controller routes
const ScheduleCont = require("./controller/ScheduleController");
app.get('/getAllWeeks', ScheduleCont.getAllWeeks);
app.get('/getSpecificWeek', ScheduleCont.getSpecificWeek);
app.post('/createWeek', ScheduleCont.createWeek);
app.put('/upsertWeek', ScheduleCont.upsertWeek);
app.delete('/deleteWeek', ScheduleCont.deleteWeek);
app.delete('/deleteAllWeeks', ScheduleCont.deleteAllWeeks);
app.patch('/updateMatchupResult', ScheduleCont.updateMatchupResult);

// playoff controller routes
const PlayoffCont = require("./controller/PlayoffController");
app.get('/getAllBrackets', PlayoffCont.getAllBrackets);
app.get('/getBracketByName', PlayoffCont.getBracketByName);
app.post('/createBracket', PlayoffCont.createBracket);
app.post('/addMatchup/:name/:roundNumber', PlayoffCont.addMatchup);
app.put('/updateResult/:name/:roundNumber', PlayoffCont.updatePlayoffMatchupResult);
app.delete('/deleteBracket/:name', PlayoffCont.deleteBracket);
app.delete('/deleteAllBrackets', PlayoffCont.deleteAllBrackets);

// post controller routes
const PostCont = require("./controller/PostController");
app.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).send(err);
    PostCont.uploadPost(req, res);
  })
});
app.get('/getAllPosts', PostCont.getAllPosts);
app.post('/updateContainsMinors/:id', PostCont.updateContainsMinors);
app.post('/updateLikeReaction/:id', PostCont.updateLikeReaction)
app.get("/getPost/:id", PostCont.getPost);

// post comment controller routes
const PostCommentCont = require("./controller/PostCommentController");
app.post('/addComment/:postId', PostCommentCont.addComment);
app.get('/getAllComments/:postId', PostCommentCont.getAllComments);

console.log("UserCont:", UserCont);
console.log("MinorCont:", MinorCont);
console.log("TeamCont:", TeamCont);

app.use('/uploads', express.static('uploads'));

console.log("ScheduleCont", ScheduleCont);
console.log("PostCont", PostCont);
console.log("PostCommentCont", PostCommentCont);

// export for server.js
module.exports = app; 