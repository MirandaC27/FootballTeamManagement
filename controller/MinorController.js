const dao = require('../model/MinorDao');
const teamDao = require('../model/TeamDao');

// A hard-coded season
const SEASON_START = new Date('2025-10-01');
const SEASON_END = new Date('2025-11-30');

/**
 * Reassign a minor to a new existing team.
 */
const reassignMinor = async (req, res) => {
    try {
        const { minorId, newTeamId } = req.params;
        const currentDate = new Date();

        // Check if season has begun
        if (currentDate < SEASON_START || currentDate > SEASON_END) {
            return res.redirect('admin-manage-minors.html?error=1');
        }

        // Check if team exists in database
        const team = await teamDao.read(newTeamId);
        if (!team) {
            return res.redirect('admin-manage-minors.html?error=1');
        }
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
