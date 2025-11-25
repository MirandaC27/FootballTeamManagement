//JavaScript code to refresh the page every minute <-- find this
//Ajax code, refreshes fro special stuff
//match timer is a beautification: can be replaced with in progress/finsihed/scheduled


const mongoose = require('mongoose');

const MATCH_STATUSES = ['Scheduled', 'In Progress', 'Final', 'Delayed', 'Cancelled', 'Forefeit'];

const eventSchema = new mongoose.Schema({
  minute: {
    type: Number,
    required: true 
  },
  type: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  team: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: String,  
  }
});

//match view schema
const matchSchema = new mongoose.Schema({
  homeTeam: {
    //type: mongoose.Schema.Types.ObjectId,
    //ref: 'team',
    type: String,
    required: true
  },
  awayTeam: {
    //type: mongoose.Schema.Types.ObjectId,
    //ref: 'team',
    type: String,
    required: true
  },
  homeScore: {
    type: Number,
    default: -1
  },
  awayScore: {
    type: Number,
    default: -1
  },
  matchDate: {
    type: Date,
    required: true
  },
  matchStart: {
    type: Date,
    default:null
  },
  matchEnd: {
    type: Date,
    default:null
  },
  matchLocation: {
    type: String,
    required: true
  },
  matchCity: {
    type: String,
  },
  matchStatus: {
    type: String,
    required: true,
    default: 'Scheduled'
  },
  matchEvents: {
    type: [eventSchema],
    default: []
  },
  reactions: {
    happy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    neutral: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    sad: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    angry: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    like: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    dislike: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }]
  },
  durationMinutes: { type: Number, default: null },

  clock: {
    startTimestamp: { type: Number, default: null },      
    elapsedBeforeStart: { type: Number, default: 0 },      
    status: { type: String, default: "stopped" } 
  }

});


const matchModel = mongoose.model('match', matchSchema);

//Test functions

async function readAll() {
  return await matchModel.find();
}

/**
 * create a new match and save it in database.
 * @param {*} newMatch data for new match
 */
async function create(newMatch) {
  const match = new matchModel(newMatch);
  await match.save();
  return match;
}

/**
 * find an existing match in the database.
 * @param {*} id data for new match
 */
async function readById(id) {
  return await matchModel.findById(id);
}

/**
 * update an existing match in the database.
 * @param {*} id data for new match
 */
async function updateById(id, newData) {
  return await matchModel.findByIdAndUpdate(id, newData, { new: true });
}

/**
 * delete an existing match in the database.
 * @param {*} id data for new match
 */
async function remove(id) {
  return await matchModel.findByIdAndDelete(id);
}

/**
 * delete all existing matches in the database.
 * @param {*} id data for new match
 */
async function removeAll() {
  await matchModel.deleteMany();
}

/**
 * Toggle a match reaction.
 * @param {*} matchId match id
 * @param {*} userId user id
 * @param {*} reactionType reaction type
 * @returns 
 */
async function updateMatchReaction(matchId, userId, reactionType) {
  const match = await matchModel.findById(matchId);
  const reactionArr = match.reactions[reactionType];
  const alreadyReacted = reactionArr.includes(userId);

  // Remove reaction if already been reacted/clicked on 
  if (alreadyReacted) {
    match.reactions[reactionType].pull(userId);
  } else {
    match.reactions[reactionType].push(userId);
  }
  await match.save();
  return { isReacted: !alreadyReacted, count: match.reactions[reactionType].length };
}


//ClockDAO things. Brute forcing the clock.

/** 
* brute force setting the clock state via mongoDB
* @param {*} id id of the match
* @param {*} newClockObj clock that you're updating
*/
async function setClockState(id, newClockObj) {
  return await matchModel.findByIdAndUpdate(
    id,
    { $set: { clock: newClockObj } },
    { new: true }
  ).lean();
}


/** 
* brute force updating elapsed before start time
* @param {*} id id of the match
* @param {*} elasedBeforeStart elpased time before start parameter of clock
*/
async function updateElapsed(id, elapsedBeforeStart) {
  return await matchModel.findByIdAndUpdate(
    id,
    { $set: { "clock.elapsedBeforeStart": elapsedBeforeStart } },
    { new: true }
  ).lean();
}


/** 
* brute force resetting the clock
* @param {*} id id of the match
*/
async function resetClock(id) {
  return await matchModel.findByIdAndUpdate(
    id,
    {
      $set: {
        "clock.status": "stopped",
        "clock.startTimestamp": null,
        "clock.elapsedBeforeStart": 0
      }
    },
    { new: true }
  ).lean();
}

module.exports = {
  matchModel,
  create,
  readAll,
  updateById,
  readById,
  remove,
  removeAll,
  updateMatchReaction,
  setClockState,
  updateElapsed,
  resetClock
};