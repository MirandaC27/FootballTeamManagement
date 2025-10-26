const matchDao = require('../model/MatchDaoNB');
const teamDao = require('../model/TeamDao');


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