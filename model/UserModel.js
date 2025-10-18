const mongoose = require('mongoose');

// User account schema.
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  approve: {
    type: Boolean,
    required: false,
  },
  role: {
    type: String,
    required: false,
    enum: ['admin', 'manager', 'adult'],
  },
},
  { timestamps: true }
);

const userModel = mongoose.model('user', userSchema);

// for testing purpose only:
/**
 * Read and return all user documents from the database.
 */
async function readAll() {
  return await userModel.find();
}

/**
 * Read and return a single user document by its ID.
 * @param {*} id document id
 * @returns user model object if found
 */
async function read(id) {
  return await userModel.findById(id);
}

/**
 * Create and save a new user document in the database.
 * @param {*} newUser new user document
 * @returns new object
 */
async function create(newUser) {
  const user = new userModel(newUser);
  await user.save();
  return user;
}

/**
 * Delete a single user document by its ID.
 * @param {*} id user document id
 * @returns deleted object if found
 */
async function del(id) {
  return await userModel.findByIdAndDelete(id);
}

/**
 * Delete all user documents in database.
 */
async function deleteAll() {
  await userModel.deleteMany();
}

/**
 * Find a user document based on their username.
 * @param {*} username username to search for
 * @returns object if found or null if not
 */
async function findLogin(username) {
  return await userModel.findOne({ username });
}

module.exports = {
  create,
  read,
  readAll,
  del,
  deleteAll,
  findLogin,
  userModel,
};