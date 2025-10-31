const matchDao = require('../model/MatchDao');
const teamDao = require('../model/TeamDao');

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
            return res.status(404).json({ message: 'Invalid match' });
        }

        const homeTeam = await teamDao.findById(match.homeTeam).lean();
        const awayTeam = await teamDao.findById(match.awayTeam).lean();

        const matchData = {
            matchDate: match.matchDate,
            matchLocation: match.matchLocation,
            matchStatus: match.matchStatus,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            homeTeam: homeTeam || match.homeTeam,
            awayTeam: awayTeam || match.awayTeam,
        };

        res.status(200).json(matchData);
    } catch (err) {
        console.error('Error loading match details:', err);
        res.status(500).send('Error loading match');
    }
};

module.exports = {
    createNewMatch,
    deleteMatch,
    getAllMatches,
    getMatchDetails,
};
