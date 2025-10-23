//bad way to implement the season schedule, must adjust
//confusing rows of data with columns of data (field data)

const mongoose = require('mongoose');

// Team structure schema.
const seasonScheduleSchema = new mongoose.Schema({
    weekNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    matchup_1: {
        type: String,
        required: false,
    },
    matchup_2: {
        type: String,
        required: false,
    },
    matchup_3: {
        type: String,
        required: false,
    },
    matchup_4: {
        type: String,
        required: false,
    },
    matchup_5: {
        type: String,
        required: false,
    },
    matchup_6: {
        type: String,
        required: false,
    },
    matchup_7: {
        type: String,
        required: false,
    },
    matchup_8: {
        type: String,
        required: false,
    },
    matchup_9: {
        type: String,
        required: false,
    },
    matchup_10: {
        type: String,
        required: false,
    }
}
);

const seasonScheduleModel = mongoose.model('seasonSchedule', seasonScheduleSchema);

// for testing purpose only:
/**
 * Read and return all weeks and matchups from the database.
 */
async function readAll() {
  return await seasonScheduleModel.find();
}

/**
 * Read and return a week and matchup by its ID.
 * @param {*} id document id
 * @returns seasonSchedule model object if found
 */
async function read(id) {
  return await seasonScheduleModel.findById(id);
}

/**
 * Create and save a new week in the database.
 * @param {*} newWeek new week document
 * @returns new object
 */
async function create(newWeek) {
  const team = new seasonScheduleModel(newWeek);
  await team.save();
  return team;
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
 * Delete all weeks in database.
 */
async function deleteAll() {
  await seasonScheduleModel.deleteMany();
}

/**
 * Find a week based on their week number.
 * @param {*} teamName team name to search for
 * @returns object if found or null if not
 */
async function findWeek(weekNumber) {
  return await seasonScheduleModel.findOne({ weekNumber });
}

module.exports = {
  create,
  read,
  readAll,
  del,
  deleteAll,
  findWeek,
  seasonScheduleModel,
};