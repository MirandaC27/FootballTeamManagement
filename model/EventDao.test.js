const dbcon = require('./DbConnection');
const dao = require('./EventDao');

//setup for all tests
beforeAll(async () => { 
    await dbcon.connect('test');
});

afterAll(async () => { 
    await dao.eventModel.deleteMany({});
    await dbcon.disconnect();
});

beforeEach(async () => {
    await dao.eventModel.deleteMany({});
});

/*
* create event tests
*/

//create a new event with title, date, tag, location, and coordinates
test('Create new event', async () => {
    let newData = {eventDate: new Date('2024-05-10'), title: 'Quarter Final', tag: 'practice', location: 'Loyola University', locationCoords: [21.21, 19.19] };
    let created = await dao.create(newData);
    let found = await dao.readById(created._id);
    expect(created._id).not.toBeNull();
    expect(found.title).toBe(created.title);
    expect(found.tag).toBe('practice');
    expect(found.location).toBe('Loyola University');
    expect(found.locationCoords).toEqual([21.21, 19.19])
});

//fail to create a event with no title
test('Create fails with missing title', async () => {
    expect.assertions(1);
    try {
        await dao.create({ eventDate: new Date(), tag: 'match', location: 'Loyola University', locationCoords: [21.21, 19.19] });
    } catch (err) {
        expect(err.name).toBe('ValidationError');
    }
});

//fail to create a event with no date
test('Create fails with missing date', async () => {
    expect.assertions(1);
    try {
        await dao.create({ title: 'no date yet.', tag: 'event', location: 'Loyola University', locationCoords: [21.21, 19.19] });
    } catch (err) {
        expect(err.name).toBe('ValidationError');
    }
});

//fail to create an event with no tag
test('Create fails with missing tag', async () => {
    expect.assertions(1);
    try {
        await dao.create({ title: 'No Tag', eventDate: new Date(), location: 'Loyola University', locationCoords: [21.21, 19.19] });
    } catch (err) {
        expect(err.name).toBe('ValidationError');
    }
});

//fail to create an event with invalid tag
test('Create fails with invalid tag', async () => {
    expect.assertions(1);
    try {
        await dao.create({ title: 'Invalid Tag', eventDate: new Date(), tag: 'holiday', location: 'Loyola University', locationCoords: [21.21, 19.19] });
    } catch (err) {
        expect(err.name).toBe('ValidationError');
    }
});

//fail to create a event with no location
test('Create fails with missing location', async () => {
    expect.assertions(1);
    try {
        await dao.create({ title: 'No location set.', eventDate: new Date(), tag: 'event', locationCoords: [21.21, 19.19] });
    } catch (err) {
        expect(err.name).toBe('ValidationError');
    }
});

//fail to create a event with no location coordinates
test('Create fails with missing location', async () => {
    expect.assertions(1);
    try {
        await dao.create({ title: 'No location coordinates set.', eventDate: new Date(), tag: 'event', location: 'Loyola University' });
    } catch (err) {
        expect(err.name).toBe('ValidationError');
    }
});

/*
* delete event tests
*/

//delete an existing event
test('Delete event', async () => {
    let newData = {eventDate: new Date('2024-06-15'), title: 'Semi Final', tag: 'match', location: 'Loyola University', locationCoords: [21.21, 19.19] };
    let created = await dao.create(newData);
    let deleted = await dao.remove(created._id);
    let found = await dao.readById(created._id);
    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id);
});

//delete a non-existent event.
test('Remove non-existent event returns null', async () => {
    let badId = '000000000000000000000000';
    let removed = await dao.remove(badId);
    expect(removed).toBeNull();
});

/*
* find event tests
*/
//find existing events
test('Read all events', async () => {
    let event1 = {eventDate: new Date('2024-07-01'), title: 'Event 1', tag:'practice', location: 'Loyola University', locationCoords: [21.21, 19.19]};
    let event2 = {eventDate: new Date('2024-07-02'), title: 'Event 2', tag:'event', location: 'Towson University', locationCoords: [21.21, 19.19]};
    let event3 = {eventDate: new Date('2024-07-03'), title: 'Event 3', tag:'match', location: 'Morgan State University', locationCoords: [21.21, 19.19]};
    await dao.create(event1);
    await dao.create(event2);
    await dao.create(event3);
    let lstEvents = await dao.readAll();
    expect(lstEvents.length).toBe(3);
    expect(lstEvents[0].title).toBe('Event 1');
});

//find existing events by ID
test('Read event by ID', async () => {
    let newData = {eventDate: new Date('2024-08-20'), title: 'Final Event', tag:'match', location: 'Loyola University', locationCoords: [21.21, 19.19]};
    let created = await dao.create(newData);
    let found = await dao.readById(created._id);
    expect(found).not.toBeNull();
    expect(found._id).toEqual(created._id);
    expect(found.title).toEqual(created.title);
    expect(found.location).toEqual(created.location);
    expect(found.locationCoords).toEqual(created.locationCoords);
});

//look for a non-existent event
test('Event not found', async () => {
    let badId = '000000000000000000000000'; 
    let found = await dao.readById(badId);
    expect(found).toBeNull();
});

//look for non-existent events and return an empty array
test('Read all returns empty array when no events', async () => {
    const events = await dao.readAll();
    expect(events).toEqual([]);
});

/*
* update tests
*/

//update a whole event
test('Update existing event with new title, date, tag, location, and location coordinates', async () => {
    let oldEvent = { eventDate: new Date('2025-10-10'), title: 'Update me!', tag: 'practice', location: 'Loyola University', locationCoords: [21.21, 19.19] };
    let created = await dao.create(oldEvent);

    let newEvent = { eventDate: new Date('2025-11-11'), title: 'Updated.', tag: 'match', location: 'Towson University', locationCoords: [20.20, 18.18] };
    let updated = await dao.update(created._id, newEvent);

    expect(updated).not.toBeNull();
    expect(updated._id.toString()).toBe(created._id.toString());
    expect(updated.title).toBe(newEvent.title);
    expect(updated.eventDate.toISOString()).toBe(newEvent.eventDate.toISOString());
    expect(updated.tag).toBe('match');
    expect(updated.location).toBe('Towson University');
    expect(updated.locationCoords).toEqual([20.20, 18.18]);
});

//update only the title (date, tag, location, and coordinates should stay the same)
test('Update event with only title keeps same date, tag, and location', async () => {
    let oldEvent = { eventDate: new Date('2025-09-15'), title: 'Original', tag: 'event', location: 'Loyola University', locationCoords: [21.21, 19.19] };
    let created = await dao.create(oldEvent);

    let updated = await dao.update(created._id, { title: 'Title Only' });

    expect(updated).not.toBeNull();
    expect(updated.title).toBe('Title Only');
    expect(updated.eventDate.toISOString()).toBe(created.eventDate.toISOString());
    expect(updated.tag).toBe('event');
    expect(updated.location).toBe('Loyola University');
    expect(updated.locationCoords).toEqual([21.21, 19.19]);
});

//update only the date (title, tag, location, and coordinates should stay the same)
test('Update event with only date keeps same title, tag, and location', async () => {
    let oldEvent = { eventDate: new Date('2025-08-10'), title: 'Keep Title', tag: 'practice', location: 'Loyola University', locationCoords: [21.21, 19.19] };
    let created = await dao.create(oldEvent);

    const newDate = new Date('2025-09-01');
    let updated = await dao.update(created._id, { eventDate: newDate });

    expect(updated).not.toBeNull();
    expect(updated.title).toBe('Keep Title');
    expect(updated.tag).toBe('practice');
    expect(updated.eventDate.toISOString()).toBe(newDate.toISOString());
    expect(updated.location).toBe('Loyola University');
    expect(updated.locationCoords).toEqual([21.21, 19.19]);
});

//update only the tag (title, date, location, and coordinates should stay the same)
test('Update event with only tag keeps same title, date, and location', async () => {
    let oldEvent = { eventDate: new Date('2025-12-01'), title: 'Keep Everything', tag: 'practice', location: 'Loyola University', locationCoords: [21.21, 19.19] };
    let created = await dao.create(oldEvent);

    let updated = await dao.update(created._id, { tag: 'match' });

    expect(updated).not.toBeNull();
    expect(updated.title).toBe('Keep Everything');
    expect(updated.eventDate.toISOString()).toBe(created.eventDate.toISOString());
    expect(updated.tag).toBe('match');
    expect(updated.location).toBe('Loyola University');
    expect(updated.locationCoords).toEqual([21.21, 19.19]);
});

//update the location and coordinates (title, date, and tag should stay the same)
test('Update event with only location keeps same title, date, and tag', async () => {
    let oldEvent = { eventDate: new Date('2025-12-01'), title: 'Keep Everything', tag: 'practice', location: 'Loyola University', locationCoords: [21.21, 19.19] };
    let created = await dao.create(oldEvent);

    let updated = await dao.update(created._id, { location: 'Towson University', locationCoords: [20.20, 18.18] });

    expect(updated).not.toBeNull();
    expect(updated.title).toBe('Keep Everything');
    expect(updated.eventDate.toISOString()).toBe(created.eventDate.toISOString());
    expect(updated.tag).toBe('practice');
    expect(updated.location).toBe('Towson University');
    expect(updated.locationCoords).toEqual([20.20, 18.18]);
});

//attempt to update non-existent event
test('Update non-existent event returns null', async () => {
    const fakeId = '000000000000000000000000';
    const updated = await dao.update(fakeId, { title: 'No event here', tag: 'event' });
    expect(updated).toBeNull();
});