const dbcon = require('./DbConnection');
const dao = require('./MatchDao');
const mongoose = require('mongoose');

let validMatchData;

beforeAll(async () => {
  await dbcon.connect('test');
});

afterAll(async () => {
  await dao.matchModel.deleteMany({});
  await dbcon.disconnect();
});

beforeEach(async () => {
  await dao.matchModel.deleteMany({});
  validMatchData = {
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    homeScore: 0,
    awayScore: 0,
    matchLocation: 'Brazil',
    matchStatus: 'Scheduled',
    matchDate: new Date('2025-05-05'),
  };
});

/*
 * create match tests
 */
test('Create new match', async () => {
  const created = await dao.create(validMatchData);
  const found = await dao.readById(created._id);
  expect(created._id).not.toBeNull();
  expect(found.homeTeam).toBe(validMatchData.homeTeam);
  expect(found.matchStatus).toBe('Scheduled');
});

//failing tests with missing attributes
test('Create fails with missing homeTeam', async () => {
  expect.assertions(1);
  const badData = { ...validMatchData };
  delete badData.homeTeam;
  try {
    await dao.create(badData);
  } catch (err) {
    expect(err.name).toBe('ValidationError');
  }
});

test('Create fails with missing awayTeam', async () => {
  expect.assertions(1);
  const badData = { ...validMatchData };
  delete badData.awayTeam;
  try {
    await dao.create(badData);
  } catch (err) {
    expect(err.name).toBe('ValidationError');
  }
});

test('Create fails with missing matchDate', async () => {
  expect.assertions(1);
  const badData = { ...validMatchData };
  delete badData.matchDate;
  try {
    await dao.create(badData);
  } catch (err) {
    expect(err.name).toBe('ValidationError');
  }
});

test('Create fails with missing matchLocation', async () => {
  expect.assertions(1);
  const badData = { ...validMatchData };
  delete badData.matchLocation;
  try {
    await dao.create(badData);
  } catch (err) {
    expect(err.name).toBe('ValidationError');
  }
});

/*
 * delete match tests
 */
test('Delete existing match', async () => {
  const created = await dao.create(validMatchData);
  const deleted = await dao.remove(created._id);
  const found = await dao.readById(created._id);
  expect(found).toBeNull();
  expect(deleted._id.toString()).toBe(created._id.toString());
});

test('Remove non-existent match returns null', async () => {
  const fakeId = new mongoose.Types.ObjectId();
  const removed = await dao.remove(fakeId);
  expect(removed).toBeNull();
});

test('Remove all matches', async () => {
  await dao.create(validMatchData);
  await dao.create({ ...validMatchData, matchLocation: 'USA' });
  await dao.removeAll();
  const all = await dao.readAll();
  expect(all.length).toBe(0);
});

/*
 * read match tests
 */
test('Read all matches', async () => {
  await dao.create({ ...validMatchData, matchLocation: 'Rio' });
  await dao.create({ ...validMatchData, matchLocation: 'São Paulo' });
  const allMatches = await dao.readAll();
  expect(allMatches.length).toBe(2);
});

test('Read by ID returns correct match', async () => {
  const created = await dao.create(validMatchData);
  const found = await dao.readById(created._id);
  expect(found._id.toString()).toBe(created._id.toString());
});

test('Read by ID returns null when not found', async () => {
  const badId = new mongoose.Types.ObjectId();
  const found = await dao.readById(badId);
  expect(found).toBeNull();
});

test('Read all returns empty array when no matches', async () => {
  const all = await dao.readAll();
  expect(all).toEqual([]);
});

/*
 * update match tests
 */
test('Update match by ID modifies fields', async () => {
  const created = await dao.create(validMatchData);
  const updates = { homeScore: 3, awayScore: 1, matchStatus: 'Final' };
  await dao.updateById(created._id, updates);
  const found = await dao.readById(created._id);
  expect(found.homeScore).toBe(3);
  expect(found.awayScore).toBe(1);
  expect(found.matchStatus).toBe('Final');
});

test('Update non-existent match returns null', async () => {
  const badId = new mongoose.Types.ObjectId();
  const updated = await dao.updateById(badId, { matchStatus: 'Cancelled' });
  expect(updated).toBeNull();
});
