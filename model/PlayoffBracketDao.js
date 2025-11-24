const mongoose = require('mongoose');
const matchupSchema = require('./MatchupDao');

//Round by round schema
const roundSchema = new mongoose.Schema({
    roundNumber: {
        type: Number,
        required: true
    },
    roundMatchups: [matchupSchema]
});

//Full bracket schema
const bracketSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    numTeams: {
        type: Number,
        required: true
    },
    rounds: [roundSchema]
});

const bracketModel = mongoose.model('Bracket', bracketSchema);


// for testing purpose only:
/**
 * Gets all brackets from the database.
 */
async function getAll() {
    return await bracketModel.find();
}

async function getRoundByNumber(bracketName, roundNumber) {
    const bracket = await bracketModel.findOne({ name: bracketName });
    return await bracket.rounds.find(r => r.roundNumber === roundNumber);
}

async function getMatchupNumIndex(bracketName, roundNumber, matchIndex){
    const bracket = await bracketModel.findOne({ name: bracketName });
    const round = await bracket.rounds.find(r => r.roundNumber === roundNumber);
    return round.roundMatchups[matchIndex];
}

/**
 * Get playoff bracket by its ID
 * @param {*} id document id
 * @returns bracket model object if found
 */
async function read(id) {
    return await bracketModel.findById(id);
}

/**
 * Find a bracket based on its name.
 * @param {*} bracketName bracketName to search for
 * @returns object if found or null if not
 */
async function findByName(bracketName) {
    return await bracketModel.findOne({ name: bracketName });
}

/**
 * Create a new playoff bracket.
 * @param {*} bracketName bracket name
 * @param {*} totalTeams number of teams in the bracket
 * @param {*} rounds array of round objects with matchups
 */
async function create(bracketName, totalTeams, rounds) {
    try {
        const bracket = new bracketModel({ name: bracketName, numTeams: totalTeams, rounds: rounds });
        await bracket.save();
        return bracket;
    } catch (err) {
        console.error('Error creating bracket:', err);
        throw err;
    }
}

/**
 * Delete bracket by name
 * @param {*} bracketName bracket name
 * @returns deleted object if found
 */
async function deleteByName(bracketName) {
    return await bracketModel.findOneAndDelete(bracketName);
}

/**
 * Delete all brackets
 */
async function deleteAllBrackets() {
    return await bracketModel.deleteMany();
}

/**
 * Deletes a single matchup from a round
 * @param {*} bracketName bracket name
 * @param {*} roundNumber round number
 * @param {*} matchIndex index of matchup
 * @returns new bracket object
 */
async function deleteSingleMatchup(bracketName, roundNumber, matchIndex) {
    const bracket = await findByName(bracketName);
    if (!bracket) return null;

    const round = bracket.rounds.find(r => r.roundNumber === roundNumber);
    if (!round) return null;

    // If index is out of bounds, stop
    if (matchIndex < 0 || matchIndex >= round.roundMatchups.length) {
        return null;
    }

    // Replace with a fresh TBD placeholder instead of removing
    round.roundMatchups[matchIndex] = {
        homeTeam: "TBD",
        awayTeam: "TBD",
        result: null
    };

    await bracket.save();
    return bracket;
}

/**
 * Add a new round to an existing bracket.
 * @param {*} bracketName bracket name
 * @param {*} roundData matchup data
 */
async function addRound(bracketName, roundData) {
    const bracket = await bracketModel.findOne({ name: bracketName });
    if (!bracket) return null;

    bracket.rounds.push(roundData);
    return await bracket.save();
}

async function getMatchupIndex(bracketName, roundNumber, home, away) {
    const bracket = await bracketModel.findOne({ name: bracketName });
    if (!bracket) return null;
    const round = bracket.rounds.find(r => r.roundNumber === roundNumber);
    if (!round) return null;

    const matchIndex = round.roundMatchups.findIndex(m =>
        (!m.homeTeam || m.homeTeam === home) &&
        (!m.awayTeam || m.awayTeam === away)
    );
    if (matchIndex == -1) {
        return null;
    }
    else return matchIndex;
}

/**
 * Add a matchup to a specific round within a bracket.
 * @param {*} bracketName bracket name
 * @param {*} totalTeams number of teams in the bracket
 * @param {*} rounds array of round objects with matchups
 */
async function addMatchup(bracketName, roundNumber, matchupData) {
    const bracket = await bracketModel.findOne({ name: bracketName });
    if (!bracket) return null;

    const round = bracket.rounds.find(r => r.roundNumber === roundNumber);
    if (!round) return null;

    const tbdIndex = round.roundMatchups.findIndex(m =>
        (!m.homeTeam || m.homeTeam === "TBD") &&
        (!m.awayTeam || m.awayTeam === "TBD")
    );

    if (tbdIndex !== -1) {
        round.roundMatchups[tbdIndex] = matchupData;
    } else {
        round.roundMatchups.push(matchupData);
    }
    return await bracket.save();
}

/**
 * Update the result of a specific playoff matchup.
 * @param {*} bracketName bracket name
 * @param {*} roundNumber round number of the matchup
 * @param {*} homeTeam homeTeam of the matchup
 * @param {*} awayTeam awayTeam of the matchup
 * @param {*} result the new result of the match
 * @returns the new bracket
 */
async function updateResult(bracketName, roundNumber, homeTeam, awayTeam, result) {
    const bracket = await bracketModel.findOne({ name: bracketName });
    if (!bracket) return null;

    const round = bracket.rounds.find(r => r.roundNumber === roundNumber);
    if (!round) return null;

    const matchup = round.roundMatchups.find(
        m => (m.homeTeam === homeTeam && m.awayTeam === awayTeam) ||
            (m.homeTeam === awayTeam && m.awayTeam === homeTeam)
    );

    if (!matchup) return null;

    matchup.result = result;
    return await bracket.save();
}

module.exports = {
    create,
    read,
    getAll,
    getRoundByNumber,
    getMatchupIndex,
    getMatchupNumIndex,
    findByName,
    deleteByName,
    deleteAllBrackets,
    deleteSingleMatchup,
    addRound,
    addMatchup,
    updateResult,
    bracketModel
};