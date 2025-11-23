const matchDao = require('../model/MatchDao');
const NotificationDao = require("../model/NotificationDao");

//const teamDao = require('../model/TeamDao');

/**
 * Create a new match and register it in the database.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const createNewMatch = async (req, res) => {
  try {
    const { homeTeam, awayTeam, homeScore, awayScore, matchDate, matchLocation, matchStatus } = req.body;

    // Validate required attributes
    if (!homeTeam || !awayTeam || homeScore == null || awayScore == null || !matchDate || !matchLocation || !matchStatus) {
      return res.status(400).send('All match attributes are required');
    }

    const newMatch = new matchDao.matchModel({
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      matchDate,
      matchLocation,
      matchStatus,
    });

    await newMatch.save();
    res.status(200).json({ message: 'Match added successfully' });

  } catch (err) {
    console.error('Could not create match:', err);
    res.status(500).send('Could not create match');
  }
};

/**
 * Delete an existing match from the database.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await matchDao.matchModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json({ message: 'Match deleted successfully' });
  } catch (err) {
    console.error('Error deleting match:', err);
    res.status(500).json({ message: 'Server error while deleting match' });
  }
};


/**
 * Update a matches from the database.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const newData = req.body;

    const updated = await matchDao.updateById(id, newData);

    if (!updated) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // In progress notification
    if (newData.matchStatus === "In Progress") {
      const io = req.app.get("io");

      const notifTitle = "Match started!";
      const notifMessage = `Match ${updated.homeTeam} vs ${updated.awayTeam} is now In Progress`;
      const notifTimestamp = new Date(); // Correct timestamp

      // Create the notification
      const notif = await NotificationDao.createNotification(
        updated._id,      
        notifMessage,     
        notifTitle,       
        notifTimestamp    
      );

      // Emit through socket.io
      io.emit("matchNotification", notif);
    }

    res.json({ message: 'Match updated successfully', updated });
    io.emit("matchUpdated", updatedMatch);

  } catch (err) {
    console.error('Error updating match:', err);
    res.status(500).json({ message: 'Server error while updating match' });
  }
};

/**
 * Get all matches from the database.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const getAllMatches = async (req, res) => {
  try {
    const matches = await matchDao.matchModel.find();
    res.json(matches);
  } catch (err) {
    console.error('Could not get matches:', err);
    res.status(500).send('Could not get matches');
  }
};

/**
 * Get full match details, including team info.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const getMatchDetails = async (req, res) => {
  try {
    const matchId = req.params.id;
    const match = await matchDao.matchModel.findById(matchId).lean();

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.status(200).json(match);
  } catch (err) {
    console.error('Error loading match details:', err);
    res.status(500).send('Error loading match');
  }
};

/**
 * Toggle a reaction on a match.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
async function updateMatchReaction(req, res) {
  try {
    const matchId = req.params.id;
    const userId = req.session.user._id;
    const reactionType = req.body.reaction; 

    const result = await matchDao.updateMatchReaction(matchId, userId, reactionType);

    if (!result) {
      return res.status(404).send("Match not found");
    }
    res.json({
      isReacted: result.isReacted,
      count: result.count
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating match reaction");
  }
}


async function startMatchTimer(req, res) {
  try {
    const matchId = req.params.id;

    const match = await matchDao.readById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    if (match.clock.status === "started") {
      return res.json({ message: "Clock already running", match });
    }

    const newClock = {
      status: "started",
      startTimestamp: Date.now(),
      elapsedBeforeStart: match.clock.elapsedBeforeStart
    };

    const updated = await matchDao.setClockState(matchId, newClock);

    const io = req.app.get("io");
    io.emit("clock:start", {
      matchId,
      ...newClock
    });

    return res.json({ message: "Clock started", match: updated });
  } catch (err) {
    console.error("Start clock error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function endMatchTimer(req, res) {
  try {
    const matchId = req.params.id;

    const match = await matchDao.matchModel.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    if (match.clock.status !== "started") {
      return res.json({ message: "Clock already stopped", match });
    }

    const now = Date.now();
    const elapsed = match.clock.elapsedBeforeStart + (now - match.clock.startTimestamp);

    const newClock = {
      status: "stopped",
      startTimestamp: null,
      elapsedBeforeStart: elapsed
    };

    const updated = await matchDao.setClockState(matchId, newClock);

    const io = req.app.get("io");
    io.emit("clock:stop", {
      matchId,
      elapsedBeforeStart: elapsed
    });

    return res.json({ message: "Clock stopped", match: updated });
  } catch (err) {
    console.error("Stop clock error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function resetMatchTimer(req, res) {
  try {
    const matchId = req.params.id;

    const match = await matchDao.readById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    // Always reset the clock to the initial state
    const newClock = {
      status: "stopped",
      startTimestamp: null,
      elapsedBeforeStart: 0
    };

    const updated = await matchDao.setClockState(matchId, newClock);

    const io = req.app.get("io");
    io.emit("clock:reset", { matchId });

    return res.json({ message: "Clock reset", match: updated });
  } catch (err) {
    console.error("Reset clock error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}



module.exports = {
    createNewMatch,
    deleteMatch,
    updateMatch,
    getAllMatches,
    getMatchDetails,
    updateMatchReaction,
    startMatchTimer,
    endMatchTimer,
    resetMatchTimer
};

