const controller = require("./TeamManagement");
const dao = require("../model/MinorDao");

jest.mock("../model/MinorDao");

test('Add minor to team', async function(){
    let req = { body: { minorId: "1", teamId: "A1", action: "add" } };
    let res = { redirect: jest.fn(), status: jest.fn(), send: jest.fn() };
    let minor = { team_id: null, save: jest.fn() };

    dao.minorModel.findById.mockResolvedValue(minor);

    await controller.TeamManagement(req, res);

    expect(minor.team_id).toEqual("A1");
    expect(minor.save).toHaveBeenCalled();
});

test('Remove minor from team', async function(){
    let req = { body: { minorId: "1", teamId: "A1", action: "remove" } };
    let res = { redirect: jest.fn(), status: jest.fn(), send: jest.fn() };
    let minor = { team_id: "A1", save: jest.fn() };

    dao.minorModel.findById.mockResolvedValue(minor);

    await controller.TeamManagement(req, res);

    expect(minor.team_id).toBeNull();
    expect(minor.save).toHaveBeenCalled();
});

test('Invalid action', async function(){
    let req = { body: { minorId: "1", teamId: "A1", action: "invalid" } };
    let res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    let minor = { save: jest.fn() };

    dao.minorModel.findById.mockResolvedValue(minor);

    await controller.TeamManagement(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid action");
});

test('Minor not found', async function(){
    let req = { body: { minorId: "1", teamId: "A1", action: "add" } };
    let res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.minorModel.findById.mockResolvedValue(null);

    await controller.TeamManagement(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith("Minor not found");
});

test('Catch unexpected error', async function(){
    let req = { body: { minorId: "1", teamId: "A1", action: "add" } };
    let res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.minorModel.findById.mockRejectedValue(new Error("DB error"));

    await controller.TeamManagement(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("error managing team");
});

