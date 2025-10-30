const matchDao = require('../model/MatchDaoNB');
const teamDao = require('../model/TeamDao');

/*
    homeTeam
    awayTeam
    homeScore
    awayScore
    matchDatetime
    matchLocation
    matchStatus
*/

/**
 * Create a new match and register it in the database.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const createNewMatch = async (req, res) => {
    try{
        const{ homeTeam, awayTeam, homeScore, awayScore, matchDatetime, matchLocation, matchStatus } = req.body;
        
        if(!homeTeam || !awayTeam || !homeScore || !awayScore || !matchDatetime || !matchLocation || !matchStatus){
            return res.status(400).send('missing attribute');
        }

        const newMatch = new dao.matchModel({ homeTeam, awayTeam, homeScore, awayScore, matchDatetime, matchLocation, matchStatus});
        await newMatch.save();
        res.status(200).json({ message: "Match added successfully" });
    }

    catch(err){
        console.error('Could not create match:', err);
        res.status(500).send('Could not create match');
    }
};

/**
 * delete an existing match and register it in the database.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await dao.matchModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json({ message: "Match deleted successfully" });
  } 
  
  catch (err) {
    console.error("Match deleting event:", err);
    res.status(500).json({ message: "Server error while deleting match" });
  }
};


/**
 * Get all matches from the database.
 * @param {*} req request object containing data
 * @param {*} res response object to send back
 */
const getAllMatches = async (req, res) => {
    try{
        const matches = await matchDao.matchModel.find();
        res.json(matches);
    }
    catch (err){
        res.status(500).send('Error finding matches.');
    }
};


/**
 * Get all details from the database.
 * @param {*} req request object containing data
 * @param {*} res response object to send back
 */
const getMatchDetails = async (req, res) => {
    try{
        const matchId = req.params.id;
        const match = await matchDao.findById(matchId).lean();

        if(!match){
            return res.status(404).json({message:'Invalid Match.'}); 
        }

        const homeTeam = await teamDao.findById(match.homeTeam).lean();
        const awayTeam = await teamDao.findById(match.awayTeam).lean();

        const matchData = {
            matchDatetime: match.matchDatetime,
            matchLocation: match.matchLocation,
            matchStatus: match.matchStatus,
            homeScore: match.homeScore,
            awayScore: match.awayScore,

            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam
        };

        res.status(200).json(matchData);
    }
    catch (err){
        res.status(500).send('Error loading match.');
    }
};

module.exports = {
    getAllMatches,
    getMatchDetails
}