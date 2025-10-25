const dao = require('../model/MatchDao');
const calendarArray = require('../calendar-config');

const createNewMatch = async (req, res) => {
    try{
        const{ matchDate, title } = req.body;
        
        if(!matchDate || !title){
            return res.status(400).send('date and title are required');
        }

        const localDate = new Date(`${matchDate}T00:00:00`);
        await dao.create({ matchDate: localDate, title });
        res.status(200).json({ message: "Match added successfully" });
    }

    catch(err){
        console.error('Could not create match:', err);
        res.status(500).send('Could not create match');
    }
};

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
    console.error("Error deleting match:", err);
    res.status(500).json({ message: "Server error while deleting match" });
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
            .map(m => ({
                day: new Date(m.matchDate).getDate(),
                id:m._id,
                title: m.title
            }));
        
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
    deleteMatch,
    getAllMatches,
    getCalendarData
};
