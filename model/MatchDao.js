/**
 * @author Nyrique' Butler
 * @version 1
 **/

//JavaScript code to refresh the page every minute <-- find this
//Ajax code, refreshes fro special stuff
//match timer is a beautification: can be replaced with in progress/finsihed/scheduled


const mongoose = require('mongoose');

const matchSTATUSES = ['Scheduled', 'In Progress', 'Final', 'Delayed', 'Cancelled', 'Forefeit'];

//match view schema
const matchSchema = new mongoose.Schema({
    homeTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teamSchema',
        required: true
    },
    awayTeam:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teamSchema',
        required: true
    },
    homeScore:{
        type: Number,
        default: 0
    },
    awayScore:{
        type: Number,
        default: 0
    },
    matchDatetime:{
        type: Date,
        required: true
    },
    matchLocation:{
        type: String,
        required: true
    },
    matchStatus:{
        type: String,
        required: true,
        default: 'Scheduled'
    }
});


const matchModel = mongoose.model('match', matchSchema);

//Test functions
//inserted test functions from Chloe's Match Dao push

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