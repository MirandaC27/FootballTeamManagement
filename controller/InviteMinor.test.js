const controller = require("./InviteMinor");
const minorDao = require("../model/MinorDao");
const teamDao = require("../model/TeamDao");
const userDao = require("../model/UserDao");

jest.mock("../model/MinorDao");
jest.mock("../model/TeamDao");
jest.mock("../model/UserDao");

test('Invite minor successfully', async function(){
    let req = { body: { teamId: "T1", minorId: "M1" } };
    let res = { json: jest.fn(), status: jest.fn(), send: jest.fn() };

    let mockMinor = { _id: "M1", name: "Neymar", parent_id: "P1" };
    let mockTeam = { _id: "T1", name: "Santos" };
    let mockParent = { _id: "P1", email: "parent@example.com" };

    minorDao.minorModel.findById.mockResolvedValue(mockMinor);
    teamDao.teamModel.findById.mockResolvedValue(mockTeam);
    userDao.userModel.findById.mockResolvedValue(mockParent);

    await controller.inviteMinor(req, res);

    expect(res.json).toHaveBeenCalledWith({
        message: 'sent invite to parent@example.com for Neymar to join Santos'
    });
});

test('Minor or team not found', async function(){
    let req = { body: { teamId: "T1", minorId: "M1" } };
    let res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    minorDao.minorModel.findById.mockResolvedValue(null);
    teamDao.teamModel.findById.mockResolvedValue(null);

    await controller.inviteMinor(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Minor or team not found');
});

test('Parent not found', async function(){
    let req = { body: { teamId: "T1", minorId: "M1" } };
    let res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    let mockMinor = { _id: "M1", name: "Neymar", parent_id: "P1" };
    let mockTeam = { _id: "T1", name: "Santos" };

    minorDao.minorModel.findById.mockResolvedValue(mockMinor);
    teamDao.teamModel.findById.mockResolvedValue(mockTeam);
    userDao.userModel.findById.mockResolvedValue(null);

    await controller.inviteMinor(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Parent not found');
});

test('Catch unexpected error', async function(){
    let req = { body: { teamId: "T1", minorId: "M1" } };
    let res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    minorDao.minorModel.findById.mockRejectedValue(new Error("DB error"));

    await controller.inviteMinor(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('An error occurred when inviting the minor');
});

