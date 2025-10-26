const dbcon = require('./DbConnection');
const dao = require('./MatchDao');

//setup for all tests
beforeAll(async () => { 
    await dbcon.connect('test');
});

afterAll(async () => { 
    await dao.matchModel.deleteMany({});
    await dbcon.disconnect();
});

beforeEach(async () => {
    await dao.matchModel.deleteMany({});
});

/*
* create match tests
*/
//create a new match with title and date
test('Create new match', async () => {
    let newData = {matchDate: new Date('2024-05-10'), title: 'Quarter Final'};
    let created = await dao.create(newData);
    let found = await dao.readById(created._id);
    expect(created._id).not.toBeNull();
    expect(found.title).toBe(created.title);
});

//fail to create a match with no title
test('Create fails with missing title', async () => {
    expect.assertions(1);
    try {
        await dao.create({ matchDate: new Date() });
    } catch (err) {
        expect(err.name).toBe('ValidationError');
    }
});

//fail to create a match with no date
test('Create fails with missing date', async () => {
    expect.assertions(1);
    try {
        await dao.create({ title: 'no date yet.' });
    } catch (err) {
        expect(err.name).toBe('ValidationError');
    }
});

/*
* delete match tests
*/
//delete an existing match
test('Delete match', async () => {
    let newData = {matchDate: new Date('2024-06-15'), title: 'Semi Final'};
    let created = await dao.create(newData);
    let deleted = await dao.remove(created._id);
    let found = await dao.readById(created._id);
    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id);
});

//delete a non-existent match.
test('Remove non-existent match returns null', async () => {
    let badId = '000000000000000000000000';
    let removed = await dao.remove(badId);
    expect(removed).toBeNull();
});

/*
* find match tests
*/
//find existing matches
test('Read all matches', async () => {
    let match1 = {matchDate: new Date('2024-07-01'), title: 'Match 1'};
    let match2 = {matchDate: new Date('2024-07-02'), title: 'Match 2'};
    let match3 = {matchDate: new Date('2024-07-03'), title: 'Match 3'};
    await dao.create(match1);
    await dao.create(match2);
    await dao.create(match3);
    let lstMatches = await dao.readAll();
    expect(lstMatches.length).toBe(3);
    expect(lstMatches[0].title).toBe('Match 1');
});

//find existing matches by ID
test('Read match by ID', async () => {
    let newData = {matchDate: new Date('2024-08-20'), title: 'Final Match'};
    let created = await dao.create(newData);
    let found = await dao.readById(created._id);
    expect(found).not.toBeNull();
    expect(found._id).toEqual(created._id);
    expect(found.title).toEqual(created.title);
});

//look for a non-existent match
test('Match not found', async () => {
    let badId = '000000000000000000000000'; 
    let found = await dao.readById(badId);
    expect(found).toBeNull();
});

//look for non-existent matches and return an empty array
test('Read all returns empty array when no matches', async () => {
    const matches = await dao.readAll();
    expect(matches).toEqual([]);
});


