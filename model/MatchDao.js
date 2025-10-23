const Match = require("./Match");

exports.create = async function(newMatch) {
  try {
    const match = new Match(newMatch);
    return await match.save();
  } catch (err) {
    console.error("Error creating match:", err);
    return {};
  }
};

exports.readAll = async function() {
  try {
    return await Match.find({});
  } catch (err) {
    console.error("Error reading matches:", err);
    return [];
  }
};
