const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();

app.use(morgan('dev'));
app.use(express.static('view'));

module.exports = app; // export to server.js