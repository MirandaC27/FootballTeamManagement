/**
 * @author Nyrique' Butler
 * @version 1
 **/

const mongoose = require('mongoose');

const matchSTATUSES = ['Scheduled', 'In Progress', 'Final', 'Delayed', 'Cancelled', 'Forefeit'];

//match view schema
const matchviewSchema = new mongoose.Schema({
    homeTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teamSchema',
        required: true
    },
    awayTeam:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teamSchema',
        required: true
    },
    homeScore:{
        type: Number,
        default: 0
    },
    awayScore:{
        type: Number,
        default: 0
    },
    matchDatetime:{
        type: Date,
    },
    matchLocation:{
        type: String,
        required: true
    },
    matchStatus:{
        type: String,
        required: true
    }
});


const matchviewModel = mongoose.model('matchview', matchviewSchema);

//JavaScript code to refresh the page every minute <-- find this
//Ajax code, refreshes fro special stuff
//match timer is a beautification: can be replaced with in progress/finsihed/scheduled
