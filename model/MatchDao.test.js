const dbcon = require('./DbConnection');
const dao = require('./MatchDao');

beforeAll(async function(){
    dbcon.connect('test');
});

afterAll(async function(){
    await dao.deleteAll();
    dbcon.disconnect();
});

beforeEach(async function() {
    await dao.deleteAll();
});

test('create new match', async function(){
    let data = {homeTeam: 'Botafogo', awayTeam: 'Cruzeiro', homeScore: 0, awayScore: 0,
         matchLocation: "Brazil", matchStatus: 'Scheduled'};
    let createMatch = await dao.create(data);
    let readMatch = await dao.readById(createMatch._id);
    expect(createMatch._id).not.toBeNull(); 
    expect(readMatch._id).toEqual(createMatch._id);
});

test('delete a match', async function(){
    let data = {homeTeam: 'Botafogo', awayTeam: 'Cruzeiro', homeScore: 0, awayScore: 0,
         matchLocation: "Brazil", matchStatus: 'Scheduled'};
    let createMatch = await dao.create(data);
    let deleteMatch = await dao.remove(createMatch._id);
    let readMatch = await dao.readById(createMatch._id);
    expect(readMatch._id).toBeNull(); 
    expect(deleteMatch._id).toEqual(createMatch._id);
});