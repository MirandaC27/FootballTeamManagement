const mongoose = require('mongoose');

// Minor schema.
const minorSchema = new mongoose.Schema({
  date_of_birth: {
    type: Date,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  parent_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user' 
  },
  team_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'team',
    default: null
  }
});

const minorModel = mongoose.model('minor', minorSchema);

// for testing purpose only:
/**
 * Read and return all minor documents from the database.
 */
async function readAll() {
  return await minorModel.find();
}

/**
 * Read and return a single minor document by its ID.
 * @param {*} id document id
 * @returns minor model object if found
 */
async function read(id) {
  return await minorModel.findById(id);
}

/**
 * Create and save a new minor document in the database.
 * @param {*} newMinor new minor document
 * @returns new object
 */
async function create(newMinor) {
  const minor = new minorModel(newMinor);
  await minor.save();
  return minor;
}

/**
 * Delete a single minor document by its ID.
 * @param {*} id minor document id
 * @returns deleted object if found
 */
async function del(id) {
  return await minorModel.findByIdAndDelete(id);
}

/**
 * Delete all minor documents in database.
 */
async function deleteAll() {
  await minorModel.deleteMany();
}

/**
 * Find a minor document based on their name.
 * @param {*} name name to search for
 * @returns object if found or null if not
 */
async function findByName(name) {
  return await minorModel.findOne({ name });
}

module.exports = {
  create,
  read,
  readAll,
  del,
  deleteAll,
  findByName,
  minorModel,
};