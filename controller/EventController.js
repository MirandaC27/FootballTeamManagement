const dao = require('../model/EventDao');
const calendarArray = require('../CalendarConfig');

/**
 * Create a new event and register it in the database.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const createNewEvent = async (req, res) => {
    try{
        const{ eventDate, title } = req.body;
        
        if(!eventDate || !title){
            return res.status(400).send('date and title are required');
        }

        const localDate = new Date(`${eventDate}T00:00:00`);
        await dao.create({ eventDate: localDate, title });
        res.status(200).json({ message: "Event added successfully" });
    }

    catch(err){
        console.error('Could not create event:', err);
        res.status(500).send('Could not create event');
    }
};

/**
 * delete an existing event and register it in the database.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await dao.eventModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } 
  
  catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ message: "Server error while deleting event" });
  }
};

/**
 * update an existing event and register it in the database.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventDate, title } = req.body;

    const updatedFields = {};
    if (eventDate) updatedFields.eventDate = new Date(`${eventDate}T00:00:00`);
    if (title) updatedFields.title = title;

    const updated = await dao.update(id, updatedFields);

    if (!updated) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event updated successfully", updated });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ message: "Server error while updating event" });
  }
};


/**
 * get all events from the database.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const getAllEvents = async (req, res) => {
   
    try{
        const events = await dao.eventModel.find();
        res.json(events);
    }

    catch(err){
        console.error('could not get events', err);
        res.status(500).send('Could not get events');
    }
};

/**
 * create mapping of events in a month
 * @param {*} events get the events in the requested month and year
 * @param {*} year requested year of events
 * @param {*} monthIndex index of the requested month
 */
function eventByMonth(events, year, monthIndex){
    return events

    //get events in requested month and year
    .filter(m =>{
        const date = new Date(m.eventDate);
        return date.getMonth() === monthIndex && date.getFullYear() === year;
    })
            
    //map each day to the month
    .map(m => ({
        day: new Date(m.eventDate).getDate(),
        id:m._id,
        title: m.title
    }));

}

/**
 * get the calendar data from the database.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const getCalendarData = async (req, res) => {
    
    try{
        const year = parseInt(req.params.year);
        const monthIndex = parseInt(req.params.month) - 1;

        const monthData = calendarArray(year, monthIndex);
        const events = await dao.eventModel.find();

        const eventDays = eventByMonth(events, year, monthIndex)
        
            res.json({
            year: monthData.year,
            monthName: monthData.monthName,
            data: monthData.data,
            eventDays: eventDays,
        });
    }

    catch(err){
        console.error('Error getting calendar data:', err);
        res.status(500).send('Error getting calendar data');
    }
};



module.exports = {
    createNewEvent,
    updateEvent,
    deleteEvent,
    getAllEvents,
    getCalendarData
};
