const dbcon = require('./DbConnection');
let dao;
let matchups;
let roundOne

/**
 * Executed once before all tests
 */
beforeAll(async function() { 
    await dbcon.connect('test');
    dao = require('./PlayoffBracketDao');
    matchups = [
        {
            homeTeam: "lions",
            awayTeam: "tigers"
        },
        {
            homeTeam: "bees",
            awayTeam: "fish"
        },
        {
            homeTeam: "rays",
            awayTeam: "bulls"
        },
    ]
    roundOne = [
        {
            roundNumber: 1,
            roundMatchups: matchups
        },
    ]
});

/**
 *  Executed once after all tests have ran
 */
afterAll(async function() { 
    await dao.deleteAllBrackets();
    await dbcon.disconnect();
});

/**
 * Executed before each test
 */
beforeEach(async function() {
    await dao.deleteAllBrackets();
});

/**
 * Create bracket test
 */
test('Create', async function() {
    let newBracket = {name: "bracket1", numTeams: 6, rounds: roundOne};
    let created = await dao.create("bracket1", 6, roundOne);
    let found = await dao.read(created._id);
    expect(created._id).not.toBeNull(); 
    expect(created.name).toBe(found.name);
});

/**
 * Read all brackets test.
 */
test('Read All', async function() {
    let newBracket = {name: "bracket1", numTeams: 6, rounds: roundOne};
    let newBracket2 = {name: "bracket2", numTeams: 6, rounds: roundOne};
    await dao.create("bracket1", 6, roundOne);
    await dao.create("bracket2", 6, roundOne);
    let lstBrackets = await dao.getAll();
    expect(lstBrackets.length).toBe(2);
    expect(lstBrackets[0].name).toBe("bracket1");
});

/**
 * Find by bracket name
 */
test("Find a bracket by name", async function() {
    let newBracket = {name: "bracket1", numTeams: 6, rounds: roundOne};
    let created = await dao.create("bracket1", 6, roundOne);
    let logged = await dao.findByName("bracket1");
    expect(logged).not.toBeNull();
    expect(logged._id).toEqual(created._id);
    expect(logged.name).toEqual(created.name);
})

/**
 * Delete bracket by name
 */
test("Delete bracket by name", async function() {
    let newBracket = {name: "bracket1", numTeams: 6, rounds: roundOne};
    let created = await dao.create("bracket1", 6, roundOne);
    let deleted = await dao.deleteByName(created.name);
    let found = await dao.read(created._id); 
    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id); 
});

/**
 * Delete all brackets
 */
test("Delete all brackets", async function() {
    let newBracket = {name: "bracket1", numTeams: 6, rounds: roundOne};
    let newBracket2 = {name: "bracket2", numTeams: 6, rounds: roundOne};
    await dao.create("bracket1", 6, roundOne);
    let created = await dao.create("bracket2", 6, roundOne);
    let deleted = await dao.deleteAllBrackets();
    let found = await dao.read(created._id); 
    expect(found).toBeNull();
});

/**
 * Add a round to an existing bracket
 */
test("Add round to bracket", async function () {
    await dao.create("bracket1", 6, roundOne);
    const newRound = { roundNumber: 2, roundMatchups: [{ homeTeam: "Winner 1", awayTeam: "Winner 2" }] };
    const updated = await dao.addRound("bracket1", newRound);
    expect(updated.rounds.length).toBe(2);
    expect(updated.rounds[1].roundNumber).toBe(2);
});

/**
 * Add matchup to existing round in existing bracket
 */
test("Add matchup to round", async function () {
    await dao.create("bracket1", 6, roundOne);
    const matchup = { homeTeam: "teamA", awayTeam: "teamB" };
    const updated = await dao.addMatchup("bracket1", 1, matchup);
    expect(updated.rounds[0].roundMatchups.length).toBe(4);
    expect(updated.rounds[0].roundMatchups[3].homeTeam).toBe("teamA");
});

/**
 * Update result of a matchup
 */
test("Update result of matchup", async function () {
    await dao.create("bracket1", 6, roundOne);
    const updated = await dao.updateResult("bracket1", 1, "lions", "tigers", "2-1");
    const round = updated.rounds.find(r => r.roundNumber === 1);
    const matchup = round.roundMatchups.find(m => m.homeTeam === "lions" && m.awayTeam === "tigers");
    expect(matchup.result).toBe("2-1");
});