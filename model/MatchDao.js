const mongoose = require("mongoose");

// Define schema
const matchSchema = new mongoose.Schema({
  matchDate: { type: Date, required: true },
  title: { type: String, required: true }
});

// Create model
const Match = mongoose.model("Match", matchSchema);

// Create new match
async function create(newMatchData) {
  const match = new Match(newMatchData);
  const saved = await match.save();
  return saved;
}

// Read all matches
async function readAll() {
  return await Match.find();
}


async function readById(id) {
  return await Match.findById(id);
}


async function remove(id) {
  return await Match.findByIdAndDelete(id);
}

// Export both the model and DAO functions
module.exports = {
  matchModel: Match,
  create,
  readAll,
  readById,
  remove,
};
