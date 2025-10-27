const dao = require('../model/SeasonScheduleDao');

/**
 * Gets all weeks in the database
 * @param {*} req 
 * @param {*} res 
 */
const getAllWeeks = async(req, res) => {
    try {
        const weeks = await dao.getAll();
        res.json(weeks);
    } catch (err) {
        res.status(500).send('Error getting weeks');
    }
}

/**
 * Gets a specified week
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getSpecificWeek = async(req, res) => {
    try {
        const weekNumber = req.params;
        const week = await dao.findWeek(weekNumber);
        if (!week) {
            return res.status(404).json({ message: 'Week not found' });
        }
        res.json(week);
    } catch (err) {
        res.status(500).send('Error getting week');
    }
}

/**
 * Creates a new week on the schedule
 * @param {*} req 
 * @param {*} res 
 */
const createWeek = async(req, res) => {
    try {
        const {weekNumber, matchups} = req.body;
        const week = await dao.create(weekNumber, matchups);
        res.json(week);
    } catch (err) {
        res.status(500).send('Error getting week');
    }
}

/**
 * Changes the matchups for a week or adds the week if it does not exist
 * @param {*} req 
 * @param {*} res 
 */
const upsertWeek = async(req, res) => {
    try {
        const weekNumber = req.params;
        const matchups = req.body;
        const updated = await dao.upsertWeek(weekNumber, matchups);
        res.json(updated);
    } catch (err) {
        res.status(500).send('Error changing matchups');
    }
}

/**
 * Deletes a week from the schedule
 * @param {*} req 
 * @param {*} res 
 */
const deleteWeek = async(req, res) => {
    try {
        const weekNumber = req.params;
        const updated = await dao.delByWeekNumber(weekNumber);
        res.json(updated);
    } catch (err) {
        res.status(500).send('Error deleting week.');
    }
}

/**
 * Updates the result of a specified matchup
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updateMatchupResult = async(req, res) => {
    try {
        const weekNumber = req.params;
        let { homeTeam, awayTeam, result } = req.body;
        const updatedWeek = await dao.updateResult(weekNumber, homeTeam, awayTeam, result);
        if (!updatedWeek) {
            return res.status(404).send({ message: 'Matchup not found' });
        }
        res.json(updatedWeek);
    } catch (err) {
        res.status(500).send({ message: 'Failed to update result'});
    }
}



module.exports = {
    getAllWeeks,
    getSpecificWeek,
    createWeek,
    upsertWeek,
    deleteWeek,
    updateMatchupResult,
};