const dao = require('../model/TeamDao');


/**
 * Get all teams from the database.
 * @param {*} req request object containing data
 * @param {*} res response object to send back
 */
const getAllTeams = async (req, res) => {
    try {
        const teams = await dao.teamModel.find();
        res.json(teams);
    } catch (err) {
        res.status(500).send('Error getting teams');
    }
};


module.exports = {getAllTeams};