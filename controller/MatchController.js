const dao = require('../model/MatchDao');
const calendarArray = require('../calendar-config');

const createNewMatch = async (req, res) => {
    try{
        const{ matchDate } = req.body;
        
        if(!matchDate){
            return res.status(400).send('No match date');
        }

        const newMatch = new dao.matchModel({ matchDate });
        await newMatch.save();
        res.redirect('/calendar');
    }

    catch(err){
        console.error('Could not create match:', err);
        res.status(500).send('Could not create match');
    }
};


const getAllMatches = async (req, res) => {

};


const getCalendarData = async (req, res) => {

};

module.exports = {
    createNewMatch,
    getAllMatches,
    getCalendarData,
};
