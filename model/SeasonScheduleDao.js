

const mongoose = require('mongoose');
const matchupSchema = require('./MatchupDao');

// Team structure schema.
const seasonScheduleSchema = new mongoose.Schema({
    weekNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    weekMatchups: [matchupSchema]
}
);

const seasonScheduleModel = mongoose.model('seasonSchedule', seasonScheduleSchema);

// for testing purpose only:
/**
 * Gets all weeks from the database in sorted order.
 */
async function getAll() {
  return await seasonScheduleModel.find().sort({weekNumber: 1});
}

/**
 * Read and return a week by its ID.
 * @param {*} id document id
 * @returns seasonSchedule model object if found
 */
async function read(id) {
  return await seasonScheduleModel.findById(id);
}

/**
 * Create and save a new week in the database.
 * @param {*} weekNumber week number of new week
 * @param {*} matchups the weeks matchup objects
 * @returns new object
 */
async function create(weekNumber, matchups) {
  try {
    const week = new seasonScheduleModel({ weekNumber, weekMatchups: matchups });
    await week.save();
    return week;
  } catch (err) {
    console.error("Error creating schedule week:", err);
    throw err;
  }
}

/**
 * Delete a single week by its ID.
 * @param {*} id week document id
 * @returns deleted object if found
 */
async function del(id) {
  return await seasonScheduleModel.findByIdAndDelete(id);
}

/**
 * Delete a week based on its week number
 * @param {*} weekNumber number of the week to be deleted
 * @returns deleted object if found
 */
async function delByWeekNumber(weekNumber) {
  return await seasonScheduleModel.findOneAndDelete({weekNumber});
}

/**
 * Delete all weeks in database.
 */
async function deleteAll() {
  await seasonScheduleModel.deleteMany();
}

/**
 * Find a week based on their week number.
 * @param {*} weekNumber weekNumber to search for
 * @returns object if found or null if not
 */
async function findWeek(weekNumber) {
  let week = await seasonScheduleModel.findOne({ weekNumber });
  if (!week) {
    return null;
  }
  return week;
}

/**
 * Get matchup list based on week number
 * @param {*} weekNumber weekNumber to search for
 * @returns week matchups dao
 */
async function getWeeksMatchups(weekNumber) { 
  const weekFound = await seasonScheduleModel.findOne({ weekNumber });
  return weekFound.weekMatchups;
}

/**
 * Updates and inserts a week
 * @param {*} weekNumber number of the week to update
 * @param {*} matchups the new matchups for the week
 * @returns the new document
 */
async function upsertWeek(weekNumber, matchups) {
  return seasonScheduleModel.findOneAndUpdate({weekNumber}, {weekMatchups: matchups}, {upsert: true, new: true});
}

/**
 * Updates the result of a specified matchup
 * @param {*} weekNumber the week number of the matchup
 * @param {*} homeTeam the home team name
 * @param {*} awayTeam the away team name
 * @param {*} result the new document
 * @returns 
 */
async function updateResult(weekNumber, homeTeam, awayTeam, result) {
  const week = await seasonScheduleModel.findOne({weekNumber});
  if (!week) {
    return null;
  }
  //Find matchup
  const matchup = week.weekMatchups.find(
    (eachMatchup) => (eachMatchup.homeTeam === homeTeam && eachMatchup.awayTeam === awayTeam) ||
      (eachMatchup.homeTeam === awayTeam && eachMatchup.awayTeam === homeTeam)
  );
  if (!matchup) {
    return null;
  }
  matchup.result = result;
  await week.save();
  return week;
}

/**
 * Adds a matchup to a specified week
 * @param {*} weekNumber the week number to add to
 * @param {*} data the matchup data
 * @returns the document if added
 */
async function addMatchup(weekNumber, data) {
  const week = await seasonScheduleModel.findOne({weekNumber});
  if (!week) {
    return null;
  }
  week.weekMatchups.push(data);
  return await week.save()
}

/**
 * Remove a matchup based on its week number
 * @param {*} weekNumber the week number to delete from
 * @param {*} matchupID the matchup ID to delete
 * @returns the new week document
 */
async function delMatchup(weekNumber, matchupID) {
  const week = await seasonScheduleModel.findOne({weekNumber});
  if (!week) {
    return null;
  }
  week.weekMatchups = week.weekMatchups.filter(
    (eachMatchup) => eachMatchup._id.toString() !== matchupID
  );
  return await week.save()
}

module.exports = {
  create,
  read,
  getAll,
  del,
  delByWeekNumber,
  deleteAll,
  findWeek,
  getWeeksMatchups,
  upsertWeek,
  updateResult,
  addMatchup,
  delMatchup,
  seasonScheduleModel,
};