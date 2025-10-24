const mongoose = require('mongoose');

// matchup structure schema.
const matchupSchema = new mongoose.Schema({
    homeTeam: {
        type: String,
        required: true,
        unique: true
    },
    awayTeam: {
        type: String,
        required: true,
        unique: true
    },
    result: {
        type: String,
        required: false
    }
}
);

module.exports = matchupSchema;