/**
 * @author Nyrique' Butler
 * @version 1
 **/

const mongoose = require('mongoose');

//match view schema
const matchviewSchema = new mongoose.Schema({
    team1: {
        type: string,
        required: true,
        unique: true
    },
    team2:{
        type: string,
        required: true,
        unique: true
    },
    team1Score:{
        type: int,
        required: true,
    },
    team2Score:{
        type: int,
        required: true,
    },
    matchDate:{},
    matchTime:{},
    matchLocation:{},
    matchGoal:{},
});

//JavaScript code to refresh the page every minute <-- find this
//Ajax code, refreshes fro special stuff
//match timer is a beautification: can be replaced with in progress/finsihed/scheduled
