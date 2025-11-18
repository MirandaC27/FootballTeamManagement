const matchDao = require('../model/MatchDao');
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
      matchStart,
      matchEnd,
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

    res.json({ message: 'Match updated successfully', updated });
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



const setMatchDuration = async (req, res) => {
    const user = req.session.user;
    if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const { id } = req.params;
    const { durationMinutes } = req.body;

    if (!durationMinutes || durationMinutes <= 0) {
        return res.status(400).json({ message: "Invalid duration" });
    }

    try {
        const match = await matchDAO.findByIdAndUpdate(
            id,
            { durationMinutes },
            { new: true }
        );

        if (!match) return res.status(404).json({ message: "Match not found" });

        return res.json({ message: "Duration saved", durationMinutes: match.durationMinutes });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};


const startMatchTimer = async (req, res) => {
    const user = req.session.user;
    if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admins only" });
    }

    const { id } = req.params;

    try {
        const updated = await matchDao.matchModel.findByIdAndUpdate(
            id,
            {
                matchStart: new Date(),
                matchStatus: "In Progress"
            },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Match not found" });

        res.json({ message: "Match started", match: updated });
    } catch (err) {
        console.error("Error starting match:", err);
        res.status(500).json({ message: "Server error" });
    }
};


const endMatchTimer = async (req, res) => {
    const user = req.session.user;
    if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admins only" });
    }

    const { id } = req.params;

    try {
        const updated = await matchDao.matchModel.findByIdAndUpdate(
            id,
            {
                matchEnd: new Date(),
                matchStatus: "Final"
            },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Match not found" });

        res.json({ message: "Match ended", match: updated });
    } catch (err) {
        console.error("Error ending match:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createNewMatch,
    deleteMatch,
    updateMatch,
    getAllMatches,
    getMatchDetails,
    updateMatchReaction,
    startMatchTimer,
    endMatchTimer
};

