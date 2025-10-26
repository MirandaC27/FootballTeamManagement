const dao = require('../model/MinorDao');

const manageTeam = async (req, res) => {
    try {
        const { minorId, teamId, action } = req.body;
        const minor = await dao.minorModel.findById(minorId);

        if (!minor) {
            return res.status(404).send('Minor not found');
        }

        if (action === 'add') {
            minor.team_id = teamId;
        } else if (action === 'remove') {
            minor.team_id = null;
        } else {
            return res.status(400).send('Invalid action');
        }

        await minor.save();
        res.redirect('manager-teams.html');
    } catch (err) {
        res.status(500).send('error managing team');
    }
};

module.exports = { TeamManagement };

