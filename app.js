const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const path = require('path');
const calendar = require('./calendar-config');
const app = express();

// middleware
app.use(morgan('dev')); 
app.use(express.static('view'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 86400000 }
}))

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
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Redirect /calendar to current month page
app.get('/calendar', (req, res) => {
  const now = new Date();
  res.redirect(`/calendar/month/${now.getMonth()}?year=${now.getFullYear()}`);
});

// Return JSON calendar data for a given month
app.get('/calendar/data/:monthIndex', (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const monthIndex = parseInt(req.params.monthIndex);

  if (monthIndex < 0 || monthIndex > 11) {
    return res.status(404).json({ error: 'That month does not exist' });
  }

  const CALENDAR_DATA = calendar(year, monthIndex);
  res.json(CALENDAR_DATA);
});

// Serve the static calendar page itself
app.get('/calendar/month/:monthIndex', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'calendar.html'));
});



console.log("UserCont:", UserCont);
console.log("MinorCont:", MinorCont);
console.log("TeamCont:", TeamCont);
// export for server.js
module.exports = app; 