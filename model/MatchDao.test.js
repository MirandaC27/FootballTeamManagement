const dbcon = require('./DbConnection');
const dao = require('./MatchDao');
let testData;

beforeAll(async function(){
    dbcon.connect('test');
    testData = {homeTeam: 'Botafogo', awayTeam: 'Cruzeiro', homeScore: 0, awayScore: 0,
         matchLocation: "Brazil", matchStatus: 'Scheduled', matchDatetime: new Date('2025')}
});

afterAll(async function(){
    await dao.removeAll();
    dbcon.disconnect();
});

beforeEach(async function() {
    await dao.removeAll();
});

test('create new match', async function(){
    let createMatch = await dao.create(testData);
    let readMatch = await dao.readById(createMatch._id);
    expect(readMatch._id).toEqual(createMatch._id);
    expect(readMatch.homeTeam).toEqual(testData.homeTeam);
});

test('read all match', async function(){
    const match1Data = {...testData, homeTeam: 'Botafogo'};
    const match2Data = {...testData, awayTeam: 'Cruzeiro'};
    await dao.create(match1Data);
    await dao.create(match2Data);
});

test('update a match', async function(){
    let createMatch = await dao.create(testData);

    const newData = {
        homeScore: 3,
        matchStatus: 'Final',
    }

    let updatedMatch = await dao.updateById(createMatch._id, newData);

    expect(updatedMatch.homeScore).toBe(3);
    expect(updatedMatch.matchStatus).toBe('Final');
    expect(updatedMatch.awayScore).toBe(testData.awayScore);

});

test('delete a match', async function(){
    let createMatch = await dao.create(testData);
    let deleteMatch = await dao.remove(createMatch._id);
    expect(deleteMatch._id).toEqual(createMatch._id);

    let readMatch = await dao.readById(createMatch._id);
    expect(readMatch._id).toBeNull(); 
});