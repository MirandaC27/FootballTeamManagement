const Match = require("./Match");

const create = async (newMatch) => {
    try {
        return await matchModel.create(newMatch);
    } 

    catch (err) {
        console.error('Error in DAO create:', err);
        return {};
    }
};

const readAll = async () => {
    try {
        return await matchModel.find();
    }
    
    catch (err) {
        console.error('Error in DAO readAll:', err);
        return [];
    }
};

module.exports = {
    matchModel,
    create,
    readAll,
};


