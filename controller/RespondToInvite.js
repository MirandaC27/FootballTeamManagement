const dao = require('../model/MinorDao');

const respondToInvite = async (req, res) => {
    try {
        const { minorId, teamId, action } = req.body;
        const minor = await dao.minorModel.findById(minorId);

        if (!minor) {
            return res.status(404).send('Minor not found');
        }

        if (action === 'accept') {
            minor.team_id = teamId;
            await minor.save();
            return res.json({ message: 'Invite accepted' });
        }

        if (action === 'deny') {
            return res.json({ message: 'Invite denied' });
        }

        return res.status(400).send('Invalid action');
    } catch (err) {
        res.status(500).send('error responding to invite');
    }
};

module.exports = { respondToInvite };

