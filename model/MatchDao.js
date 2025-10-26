const mongoose = require("mongoose");

// match schema: (may edit later depending on what features get added)
const matchSchema = new mongoose.Schema({
  matchDate: { type: Date, required: true },
  title: { type: String, required: true }
});


const Match = mongoose.model("Match", matchSchema);

// for testing purposes
async function readAll() {
  return await Match.find();
}

/**
 * create a new match and save it in database.
 * @param {*} newMatchData data for new match
 * @returns a fully formed match object
 */
async function create(newMatchData) {
  const match = new Match(newMatchData);
  const saved = await match.save();
  return saved;
}

/**
 * find an existing match in the database.
 * @param {*} newMatchData data for new match
 * @returns a fully formed match object
 */
async function readById(id) {
  return await Match.findById(id);
}

/**
 * delete an existing match in the database.
 * @param {*} newMatchData data for new match
 * @returns a fully formed match object
 */
async function remove(id) {
  return await Match.findByIdAndDelete(id);
}


module.exports = {
  matchModel: Match,
  create,
  readAll,
  readById,
  remove,
};
