const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'view')));

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


// schedule controller routes
const ScheduleCont = require("./controller/ScheduleController");
app.get('/', ScheduleCont.getAllWeeks);
app.get('/:weekNumber', ScheduleCont.getSpecificWeek);
app.post('/', ScheduleCont.createWeek);
app.put('/:weekNumber', ScheduleCont.upsertWeek);
app.delete('/:weekNumber', ScheduleCont.deleteWeek);
app.patch('/:weekNumber/result', ScheduleCont.updateMatchupResult);

// schedule save route
const scheduleDao = require('./model/SeasonScheduleDao');
app.post('/schedule', async (req, res) => {
  try {
    let weekNumber, weekMatchups = req.body;
    const savedWeek = await scheduleDao.upsertWeek(weekNumber, weekMatchups);
    res.json(savedWeek);
  } catch (err) {
      res.status(500).send('Error saving week');
  }
});


console.log("UserCont:", UserCont);
console.log("MinorCont:", MinorCont);
console.log("TeamCont:", TeamCont);

app.use(express.static('view'));

console.log("ScheduleCont", ScheduleCont);
// export for server.js
module.exports = app; 