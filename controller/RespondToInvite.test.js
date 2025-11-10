const controller = require("./RespondToInvite");
const minorDao = require("../model/MinorDao");

jest.mock("../model/MinorDao");

test('Accept invite successfully', async function(){
    let req = { body: { minorId: "1", teamId: "A1", action: "accept" } };
    let res = { json: jest.fn(), status: jest.fn(), send: jest.fn() };

    let mockMinor = { team_id: null, save: jest.fn() };

    minorDao.minorModel.findById.mockResolvedValue(mockMinor);

    await controller.respondToInvite(req, res);

    expect(mockMinor.team_id).toEqual("A1");
    expect(mockMinor.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Invite accepted' });
});

test('Deny invite', async function(){
    let req = { body: { minorId: "1", teamId: "A1", action: "deny" } };
    let res = { json: jest.fn(), status: jest.fn(), send: jest.fn() };

    let mockMinor = { team_id: null, save: jest.fn() };

    minorDao.minorModel.findById.mockResolvedValue(mockMinor);

    await controller.respondToInvite(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Invite denied' });
});

test('Minor not found', async function(){
    let req = { body: { minorId: "1", teamId: "A1", action: "accept" } };
    let res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    minorDao.minorModel.findById.mockResolvedValue(null);

    await controller.respondToInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Minor not found');
});

test('Invalid action', async function(){
    let req = { body: { minorId: "1", teamId: "A1", action: "oopsie" } };
    let res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    let mockMinor = { team_id: "A1", save: jest.fn() };

    minorDao.minorModel.findById.mockResolvedValue(mockMinor);

    await controller.respondToInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Invalid action');
});

test('Catch unexpected error', async function(){
    let req = { body: { minorId: "1", teamId: "A1", action: "accept" } };
    let res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    minorDao.minorModel.findById.mockRejectedValue(new Error("DB error"));

    await controller.respondToInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('error responding to invite');
});

