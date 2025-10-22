const dao = require('../model/SeasonScheduleDao');

/**
 * Store a new season schedule in the database.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const generateSeasonSchedule = async () => {
    try {
        const res = await fetch("/getAllTeams");
        const teams = await res.json();
        const 
    } catch (err) {
        res.status(500).send('Error registering');
    }
};

module.exports = {generateSeasonSchedule};