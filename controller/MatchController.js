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
        res.status(200).json({ message: "Match added successfully" });
    }

    catch(err){
        console.error('Could not create match:', err);
        res.status(500).send('Could not create match');
    }
};


const getAllMatches = async (req, res) => {
   
    try{
        const matches = await dao.matchModel.find();
        res.json(matches);
    }

    catch(err){
        console.error('could not get matches', err);
        res.status(500).send('Could not get matches');
    }
};


const getCalendarData = async (req, res) => {
    
    try{
        const year = parseInt(req.params.year);
        const monthIndex = parseInt(req.params.month) - 1;

        const monthData = calendarArray(year, monthIndex);
        const matches = await dao.matchModel.find();

        const matchDays = matches
            
            //get matches in requested month and year
            .filter(m =>{
                const date = new Date(m.matchDate);
                return date.getMonth() === monthIndex && date.getFullYear() === year;
            })
            
            //map each day to the month
            .map(m => new Date(m.matchDate).getDate());
        
            res.json({
            year: monthData.year,
            monthName: monthData.monthName,
            data: monthData.data,
            matchDays: matchDays,
        });
    }

    catch(err){
        console.error('Error getting calendar data:', err);
        res.status(500).send('Error getting calendar data');
    }
};

module.exports = {
    createNewMatch,
    getAllMatches,
    getCalendarData,
};
