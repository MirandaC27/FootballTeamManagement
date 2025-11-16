const controller = require('./MatchChatController');
const dao = require('../model/MatchChatDao');

// Mock the entire dao module
jest.mock("../model/MatchChatDao");

/**
 * Executed before each test.
 */
beforeEach(function () {
    jest.clearAllMocks();
});

/**
 * Get all messages by match test.
 */
test('Get all messages by match', async function () {
    let req = { params: { id: 'match123' } };
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    let messages = [
        { name: 'Apple', text: 'hi', match_id: 'asdasd', role: 'manager' },
        { name: 'Banana', text: 'hi2', match_id: 'asdasd', role: 'manager' }
    ];

    dao.read.mockResolvedValue(messages);
    await controller.getMessagesByMatch(req, res);

    expect(dao.read).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(messages);
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Get messages by match failed test.
 */
test('Get all messages by match failed', async function () {
    let req = { params: { id: 'asdasd' } };
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.read.mockRejectedValue(new Error("err"));
    await controller.getMessagesByMatch(req, res);

    expect(res.status).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith('Error retrieving chat messages');
});

/**
 * Create a new message as logged in user test.
 */
test('Create new chat message as logged in user', async function () {
    let req = {
        body: {
            match_id: 'asdasd',
            name: 'Apple',
            text: 'hasdknsakjd',
            role: 'manager'
        }
    };

    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    let saved = {
        _id: '123',
        match_id: 'asdasd',
        name: 'Apple',
        text: 'hasdknsakjd',
        role: 'manager'
    }

    dao.create.mockResolvedValue(saved);
    await controller.createMessage(req, res);

    expect(dao.create).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(saved);
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Create a new message as guest test.
 */
test('Create chat message as guest', async function () {
    let req = {
        body: {
            match_id: 'asdada',
            name: 'Guest1',
            text: 'hi',
            role: 'Guest'
        }
    };

    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    let saved = {
        _id: 'asdasdsada',
        match_id: 'asdada',
        name: 'Guest1',
        text: 'hi',
        role: 'Guest'
    };

    dao.create.mockResolvedValue(saved);
    await controller.createMessage(req, res);

    expect(dao.create).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(saved);
});

/**
 * Create message failed test.
 */
test('Create message failed', async function () {
    let req = {
        body: {
            match_id: 'asdada',
            name: 'Guest1',
            text: 'hi',
            role: 'Guest'
        }
    };

    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.create.mockRejectedValue(new Error("err"));
    await controller.createMessage(req, res);

    expect(res.status).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith('Error creating message');
});