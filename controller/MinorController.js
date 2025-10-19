const dao = require('../model/MinorDao');
//const teamDao = require('../model/TeamDao');

// A hard-coded season
const SEASON_START = new Date('2025-10-01');
const SEASON_END = new Date('2025-10-31');

/**
 * Reassign a minor to a new existing team.
 */
const reassignMinor = async (req, res) => {
    try {
        const { minorId, newTeamId } = req.params;
        console.log('Params received:', req.params);
        const currentDate = new Date();

        // Check if season has began
        if (currentDate < SEASON_START || currentDate > SEASON_END) {
            return res.redirect('admin-manage-minors.html?error=1');
        }

        // Can't be implemented right now
        /*const team = await teamDao.findById(newTeamId);
        if (!team) {
            return res.redirect('admin-manage-minors.html?error=1');
        }*/

        await dao.minorModel.findByIdAndUpdate(minorId, { team_id: newTeamId });
    } catch (err) {
        res.status(500).send('Error reassigning minors');
    }
};

/**
 * Get all minors from the database.
 * @param {*} req request object containing data
 * @param {*} res response object to send back
 */
const getAllMinors = async (req, res) => {
    try {
        const minors = await dao.minorModel.find();
        res.json(minors);
    } catch (err) {
        res.status(500).send('Error getting minors');
    }
};

module.exports = {
    reassignMinor,
    getAllMinors,
};
