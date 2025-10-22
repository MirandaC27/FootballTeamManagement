const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
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

// export for server.js
module.exports = app; 