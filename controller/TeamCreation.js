const dao = require('../model/TeamDao');

const teamCreation = async (req, res) => {
    try {
        const { name, location, wins, losses, priorSeasonWins, priorSeasonLosses, playoffSeed } = req.body;
        const newTeam = { name, location, wins, losses, priorSeasonWins, priorSeasonLosses, playoffSeed };
        await dao.create(newTeam);
        res.redirect('manager-teams.html?success=1');
    } catch (err) {
        res.status(500).send('error creating team');
    }
};

module.exports = { teamCreation };
