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

  round.roundMatchups.push(matchupData);
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
  findByName,
  deleteByName,
  deleteAllBrackets,
  addRound,
  addMatchup,
  updateResult,
  bracketModel
};