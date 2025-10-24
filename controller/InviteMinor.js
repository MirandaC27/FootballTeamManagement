const minorDao = require('../model/MinorDao');
const teamDao = require('../model/TeamDao');
const userDao = require('../model/UserDao');

const inviteMinor = async (req, res) => {
    try {
        const { teamId, minorId } = req.body;
        const minor = await minorDao.minorModel.findById(minorId);
        const team = await teamDao.teamModel.findById(teamId);
        if (!minor || !team) {
            return res.status(404).send('Minor or team not found');
        }
        const parent = await userDao.userModel.findById(minor.parent_id);
        if (!parent) {
            return res.status(404).send('Parent not found');
        }
        const parentEmail = parent.email;
        console.log('email i guess sent to', parentEmail);
        res.json({
            message: 'sent invite to ' + parentEmail + ' for ' + minor.name + ' to join ' + team.name
        });
    } catch (err) {
        res.status(500).send('something broke inviting minor');
    }
};

module.exports = {
    inviteMinor,
};

