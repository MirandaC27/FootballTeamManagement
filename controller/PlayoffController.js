const dao = require('../model/PlayoffBracketDao');

/**
 * Gets all brackets in the database
 * @param {*} req 
 * @param {*} res 
 */
const getAllBrackets = async(req, res) => {
    try {
        const brackets = await dao.getAll();
        res.json(brackets);
    } catch (err) {
        res.status(500).send('Error getting brackets');
    }
}

/**
 * Gets a specified bracket by name
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getBracketByName= async(req, res) => {
    try {
        const bracketName = req.query.bracketName;
        const bracket = await dao.findByName(bracketName);
        if (!bracket) {
            return res.status(404).json({ message: 'Bracket not found' });
        }
        res.json(bracket);
    } catch (err) {
        res.status(500).send('Error getting bracket');
    }
}

/**
 * Creates a new bracket
 * @param {*} req 
 * @param {*} res 
 */
const createBracket = async(req, res) => {
    try {
        const {name, numTeams, rounds} = req.body;
        const bracket = await dao.create(name, numTeams, rounds);
        res.json(bracket);
    } catch (err) {
        res.status(500).send('Error creating bracket');
    }
}

/**
 * Add a matchup to a specified round
 * @param {*} req 
 * @param {*} res 
 */
const addMatchup = async(req, res) => {
    try {
        const { name, roundNumber } = req.params;
        const matchups = req.body;
        const updated = await dao.addMatchup(name, parseInt(roundNumber), matchups);
        res.json(updated);
    } catch (err) {
        res.status(500).send('Error adding matchup');
    }
}

/**
 * Updates the result of a specified matchup
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updatePlayoffMatchupResult = async(req, res) => {
    try {
        const { name, roundNumber } = req.params;
        let { homeTeam, awayTeam, result } = req.body;
        const updatedWeek = await dao.updateResult(name, parseInt(roundNumber), homeTeam, awayTeam, result);
        if (!updatedWeek) {
            return res.status(404).send({ message: 'Matchup not updated' });
        }
        res.json(updatedWeek);
    } catch (err) {
        res.status(500).send({ message: 'Failed to update result'});
    }
}

/**
 * Deletes single bracket from the database
 * @param {*} req 
 * @param {*} res 
 */
const deleteBracket = async(req, res) => {
    try {
        const { name } = req.params
        const deleted = await dao.deleteByName(name);
        res.json(deleted);
    } catch (err) {
        res.status(500).send('Error deleting bracket.');
    }
}

/**
 * Deletes all brackets from the database
 * @param {*} req 
 * @param {*} res 
 */
const deleteAllBrackets = async(req, res) => {
    try {
        const allDeleted = await dao.deleteAllBrackets();
        res.json(allDeleted);
    } catch (err) {
        res.status(500).send('Error deleting all brackets.');
    }
}

const deleteMatchup = async(req, res) => {
    try {
        const { name, round, homeTeam, awayTeam } = req.params;
        const matchIndex = await dao.getMatchupIndex(name, parseInt(round), homeTeam, awayTeam);
        const bracket = await dao.deleteSingleMatchup(name, parseInt(round), matchIndex);
        res.json(bracket);
    } catch (err) {
        res.status(500).send('Error deleting matchup');
    }
}


module.exports = {
    getAllBrackets,
    getBracketByName,
    createBracket,
    addMatchup,
    updatePlayoffMatchupResult,
    deleteBracket,
    deleteAllBrackets,
    deleteMatchup
};