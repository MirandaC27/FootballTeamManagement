//JavaScript code to refresh the page every minute <-- find this
//Ajax code, refreshes fro special stuff
//match timer is a beautification: can be replaced with in progress/finsihed/scheduled


const mongoose = require('mongoose');

const MATCH_STATUSES = ['Scheduled', 'In Progress', 'Final', 'Delayed', 'Cancelled', 'Forefeit'];

//match view schema
const matchSchema = new mongoose.Schema({
    homeTeam: {
        //type: mongoose.Schema.Types.ObjectId,
        //ref: 'team',
        type: String,
        required: true
    },
    awayTeam:{
        //type: mongoose.Schema.Types.ObjectId,
        //ref: 'team',
        type: String,
        required: true
    },
    homeScore:{
        type: Number,
        default: -1
    },
    awayScore:{
        type: Number,
        default: -1
    },
    matchDate:{
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

async function readAll(){
  return await matchModel.find();
}

/**
 * create a new match and save it in database.
 * @param {*} newMatch data for new match
 */
async function create(newMatch){
  const match = new matchModel(newMatch);
  await match.save();
  return match;
}

/**
 * find an existing match in the database.
 * @param {*} id data for new match
 */
async function readById(id){
  return await matchModel.findById(id);
}

/**
 * find an existing match in the database.
 * @param {*} id data for new match
 */
async function updatebyId(id, newData){
  return await matchModel.findByIdAndUpdate(id, newData, {new:true});
}

/**
 * delete an existing match in the database.
 * @param {*} id data for new match
 */
async function remove(id){
  return await matchModel.findByIdAndDelete(id);
}

/**
 * delete all existing matches in the database.
 */
async function removeAll(){
  await matchModel.deleteMany();
}


module.exports = {
  matchModel,
  create,
  readAll,
  updatebyId,
  readById,
  remove,
  removeAll
};