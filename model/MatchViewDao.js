/**
 * @author Nyrique' Butler
 * @version 1
 **/

const mongoose = require('mongoose');

//match view schema
const matchviewSchema = new mongoose.Schema({
    matchup: {
        type: String,
        required: false,
    },
    team1: {
        type: teamSchema,
        required: true,
        unique: true
    },
    team2:{
        type: teamSchema,
        required: true,
        unique: true
    }
});

