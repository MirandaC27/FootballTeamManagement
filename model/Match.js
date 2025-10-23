const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
    matchDate: { type: Date, required:true },
});

module.exports = mongoose.model("Match", matchSchema);