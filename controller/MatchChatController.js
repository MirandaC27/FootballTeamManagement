const dao = require('../model/MatchChatDao');

/**
 * Get all chat messages for a specific match.
 * @param {*} req request object object
 */
const getMessagesByMatch = async (req, res) => {
    try {
        const matchId = req.params.id;
        const messages = await dao.read(matchId);
        res.json(messages);

    } catch (err) {
        res.status(500).send('Error retrieving chat messages');
    }
};

/**
 * Create a new chat message.
 * @param {*} req request object
 * @param {*} res response object
 */
const createMessage = async (req, res) => {
    try {
        const { match_id, user_id, name, text } = req.body;

        // null for guest user
        const newChat = {
            match_id,
            name,
            text
        };
        const savedMessage = await dao.create(newChat);
        res.json(savedMessage);

    } catch (err) {
        res.status(500).send('Error creating message');
    }
};

module.exports = {
    getMessagesByMatch,
    createMessage
};