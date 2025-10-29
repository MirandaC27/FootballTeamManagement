const mongoose = require('mongoose');

// Team structure schema.
const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true,
    },
    wins: {
        type: Number,
        required: true,
    },
    losses: {
        type: Number,
        required: true,
    },
    priorSeasonWins: {
        type: Number,
        required: true,
    },
    priorSeasonLosses: {
        type: Number,
        required: true,
    },
    playoffSeed: {
        type: Number,
        required: false,
    }
}
);

const teamModel = mongoose.model('team', teamSchema);

// for testing purpose only:
/**
 * Read and return all team documents from the database.
 */
async function readAll() {
  return await teamModel.find();
}

/**
 * Read and return a single team document by its ID.
 * @param {*} id document id
 * @returns team model object if found
 */
async function read(id) {
  return await teamModel.findById(id);
}

/**
 * Create and save a new team document in the database.
 * @param {*} newTeam new team document
 * @returns new object
 */
async function create(newTeam) {
  const team = new teamModel(newTeam);
  await team.save();
  return team;
}

/**
 * Delete a single team document by its ID.
 * @param {*} id team document id
 * @returns deleted object if found
 */
async function del(id) {
  return await teamModel.findByIdAndDelete(id);
}

/**
 * Delete all team documents in database.
 */
async function deleteAll() {
  await teamModel.deleteMany();
}

/**
 * Find a team document based on their team name.
 * @param {*} teamName team name to search for
 * @returns object if found or null if not
 */
async function findTeam(teamName) {
  return await teamModel.findOne({ teamName });
}

module.exports = {
  create,
  read,
  readAll,
  del,
  deleteAll,
  findTeam,
  teamModel,
};