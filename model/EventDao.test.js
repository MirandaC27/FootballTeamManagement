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
//create a new event with title and date
test('Create new event', async () => {
    let newData = {eventDate: new Date('2024-05-10'), title: 'Quarter Final'};
    let created = await dao.create(newData);
    let found = await dao.readById(created._id);
    expect(created._id).not.toBeNull();
    expect(found.title).toBe(created.title);
});

//fail to create a event with no title
test('Create fails with missing title', async () => {
    expect.assertions(1);
    try {
        await dao.create({ eventDate: new Date() });
    } catch (err) {
        expect(err.name).toBe('ValidationError');
    }
});

//fail to create a event with no date
test('Create fails with missing date', async () => {
    expect.assertions(1);
    try {
        await dao.create({ title: 'no date yet.' });
    } catch (err) {
        expect(err.name).toBe('ValidationError');
    }
});

/*
* delete event tests
*/
//delete an existing event
test('Delete event', async () => {
    let newData = {eventDate: new Date('2024-06-15'), title: 'Semi Final'};
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
    let event1 = {eventDate: new Date('2024-07-01'), title: 'Event 1'};
    let event2 = {eventDate: new Date('2024-07-02'), title: 'Event 2'};
    let event3 = {eventDate: new Date('2024-07-03'), title: 'Event 3'};
    await dao.create(event1);
    await dao.create(event2);
    await dao.create(event3);
    let lstEvents = await dao.readAll();
    expect(lstEvents.length).toBe(3);
    expect(lstEvents[0].title).toBe('Event 1');
});

//find existing events by ID
test('Read event by ID', async () => {
    let newData = {eventDate: new Date('2024-08-20'), title: 'Final Event'};
    let created = await dao.create(newData);
    let found = await dao.readById(created._id);
    expect(found).not.toBeNull();
    expect(found._id).toEqual(created._id);
    expect(found.title).toEqual(created.title);
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


//update existing event (both date and title)
test('Update existing event with new title and date', async () => {
    let oldEvent = { eventDate: new Date('2025-10-10'), title: 'Update me!' };
    let created = await dao.create(oldEvent);

    let newEvent = { eventDate: new Date('2025-11-11'), title: 'Updated.' };
    let updated = await dao.update(created._id, newEvent);

    expect(updated).not.toBeNull();
    expect(updated._id.toString()).toBe(created._id.toString());
    expect(updated.title).toBe(newEvent.title);
    expect(updated.eventDate.toISOString()).toBe(newEvent.eventDate.toISOString());
});

//update only the title (date should stay the same)
test('Update event with only title keeps same date', async () => {
    let oldEvent = { eventDate: new Date('2025-09-15'), title: 'Original' };
    let created = await dao.create(oldEvent);

    let updated = await dao.update(created._id, { title: 'Title Only' });

    expect(updated).not.toBeNull();
    expect(updated.title).toBe('Title Only');
    // Date should remain the same
    expect(updated.eventDate.toISOString()).toBe(created.eventDate.toISOString());
});

//update only the date (title should stay the same)
test('Update event with only date keeps same title', async () => {
    let oldEvent = { eventDate: new Date('2025-08-10'), title: 'Keep Title' };
    let created = await dao.create(oldEvent);

    const newDate = new Date('2025-09-01');
    let updated = await dao.update(created._id, { eventDate: newDate });

    expect(updated).not.toBeNull();
    expect(updated.title).toBe('Keep Title');

    expect(updated.eventDate.toISOString()).toBe(newDate.toISOString());
});

//attempt to update non-existent event
test('Update non-existent event returns null', async () => {
    const fakeId = '000000000000000000000000';
    const updated = await dao.update(fakeId, { title: 'No event here' });
    expect(updated).toBeNull();
});