const mongoose = require("mongoose");
const TAGS = ["practice", "match", "event"];

// event schema: (may edit later depending on what features get added)
const eventSchema = new mongoose.Schema({
  eventDate: { type: Date, required: true },
  title: { type: String, required: true },
  tag: {type: String, required: true, enum: ["practice", "match", "event"]},

  startTime: { type: String, required: true }, 
  endTime: { type: String, required: true },   

  location: {type: String, required: true},
  locationCoords: {
    type: Array, // index 0 is latitude, index 1 is longitude
    //required: true,
    validate: {
      validator: function(x) {
        return Array.isArray(x) && x.length > 0;
      },
      message: 'Array cannot be empty'
    }
  }
});


const Event = mongoose.model("Event", eventSchema);

// for testing purposes
async function readAll() {
  return await Event.find();
}

/**
 * create a new event and save it in database.
 * @param {*} newEventData data for new event
 * @returns a fully formed event object
 */
async function create(newEventData) {
  const event = new Event(newEventData);
  const saved = await event.save();
  return saved;
}

/**
 * find an existing event in the database.
 * @param {*} newEventData data for new event
 * @returns a fully formed event object
 */
async function readById(id) {
  return await Event.findById(id);
}

/**
 * delete an existing event in the database.
 * @param {*} newEventData data for new event
 * @returns a fully formed event object
 */
async function remove(id) {
  return await Event.findByIdAndDelete(id);
}

/**
 * update an existing event.
 * @param {*} id event ID
 * @param {*} updatedData new data (title, eventDate, eventLocation)
 * @returns updated event
 */
async function update(id, updatedData) {
  return await Event.findByIdAndUpdate(id, updatedData, { new: true });
}

module.exports = {
  eventModel: Event,
  create,
  readAll,
  readById,
  remove,
  update
};
