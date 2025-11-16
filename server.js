// Reused from ParkingLotExampleJS
require('dotenv').config();

const dbcon = require('./model/DbConnection.js');
dbcon.connect(); // Connect to MongoDB when starting the server.

const ExpressApp = require('./app');

const server = ExpressApp.listen(process.env.PORT, process.env.HOSTNAME, function () { // Listen to client requests in hostname:port
    console.log(`Server Running on ${process.env.HOSTNAME}:${process.env.PORT}...`);
});

// socket.io for live chat
const { Server } = require("socket.io");
const io = new Server(server);

// Initialize socket.io connection and handle real-time chat updates
io.on('connection', (socket) => {
    console.log('connected to server');

    socket.on('message', (data) => {
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('disconnected from server');
    });
});