const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const path = require('path');
//const calendar = require('./calendar-config');
const app = express();

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

//calendar routes
const MatchCont = require('./controller/MatchController');
console.log("MatchCont loaded:", MatchCont);


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
app.get('/calendar/data/:year/:month', MatchCont.getCalendarData);

// Match routes
app.post('/addMatch', isAdmin, MatchCont.createNewMatch);
app.get('/getAllMatches', isAdmin, MatchCont.getAllMatches);
app.delete('/deleteMatch/:id', isAdmin, MatchCont.deleteMatch);




console.log("UserCont:", UserCont);
console.log("MinorCont:", MinorCont);
console.log("TeamCont:", TeamCont);

app.use(express.static('view'));

// export for server.js
module.exports = app; 