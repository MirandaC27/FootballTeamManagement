const dao = require('../model/MinorModel');
//const teamDao = require('../model/TeamModel');

const SEASON_START = new Date('2025-10-01');
const SEASON_END = new Date('2025-10-31');

/**
 * Reassign a minor to a new existing team.
 */
const reassignMinor = async (req, res) => {
    const { minorId, newTeamId } = req.body;
    const currentDate = new Date();

    // This can't be implemented right now because no TeamModel
    if (currentDate >= SEASON_START && currentDate <= SEASON_END) {
        /*const team = await teamDao.findById(newTeamId);
        if (!team) {
            return res.redirect('admin-manage-minors.html?error=1');
        }
        await dao.minorModel.findByIdAndUpdate(minorId, { team_id: newTeamId });
        */
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
