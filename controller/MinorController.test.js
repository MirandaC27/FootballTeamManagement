const controller = require('./MinorController');
const dao = require('../model/MinorDao');
const teamDao = require('../model/TeamDao');

// Mock the entire dao module
jest.mock("../model/MinorDao");

/**
 * Executed before each test.
 */
beforeEach(function () {
    jest.useFakeTimers();
    jest.clearAllMocks(); 
});

/**
 * Reassign minor within season test.
 */
test('Reassign minor within season', async function () {
    let req = { params: { minorId: "121212", newTeamId: "00d" } };
    let res = { redirect: jest.fn(), status: jest.fn(), send: jest.fn() };

    // Mock the current date and the dao model call
    jest.setSystemTime(new Date('2025-10-26'));
    teamDao.teamModel.findById = jest.fn().mockResolvedValue({ _id: "00d", name: "Team D" });
    dao.minorModel.findByIdAndUpdate = jest.fn();
    await controller.reassignMinor(req, res);

    expect(res.redirect).not.toHaveBeenCalledWith("admin-manage-minors.html?error=1");
    expect(dao.minorModel.findByIdAndUpdate).toHaveBeenCalledWith("121212", { team_id: "00d" });
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Reassign minor to a team that doesn't exists test.
 */
test('Reassign minor to a team that doesn\'t exists', async function () {
    let req = { params: { minorId: "121212", newTeamId: "00d" } };
    let res = { redirect: jest.fn(), status: jest.fn(), send: jest.fn() };

    // Mock the current date and the dao model call 
    jest.setSystemTime(new Date('2025-10-26'));
    teamDao.teamModel.findById = jest.fn().mockResolvedValue(null);
    dao.minorModel.findByIdAndUpdate = jest.fn();
    await controller.reassignMinor(req, res);

    expect(res.redirect).toHaveBeenCalledWith("admin-manage-minors.html?error=1");
    expect(dao.minorModel.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Reassign minor before season starts test. 
 */
test('Reassign minor but before season starts', async function () {
    let req = { params: { minorId: "121212", newTeamId: "00d" } };
    let res = { redirect: jest.fn(), status: jest.fn(), send: jest.fn() };

    // Mock the current date and the dao model call
    jest.setSystemTime(new Date('2024-10-26'));
    dao.minorModel.findByIdAndUpdate = jest.fn();
    await controller.reassignMinor(req, res);

    expect(res.redirect).toHaveBeenCalledWith("admin-manage-minors.html?error=1");
    expect(dao.minorModel.findByIdAndUpdate).not.toHaveBeenCalledWith("121212", { team_id: "00d" });
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Reassign minor after season starts test. 
 */
test('Reassign minor but after season starts', async function () {
    let req = { params: { minorId: "121212", newTeamId: "00d" } };
    let res = { redirect: jest.fn(), status: jest.fn(), send: jest.fn() };

    // Mock the current date and dao model call
    jest.setSystemTime(new Date('2025-12-26'));
    dao.minorModel.findByIdAndUpdate = jest.fn();
    await controller.reassignMinor(req, res);

    expect(res.redirect).toHaveBeenCalledWith("admin-manage-minors.html?error=1");
    expect(dao.minorModel.findByIdAndUpdate).not.toHaveBeenCalledWith("121212", { team_id: "00d" });
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Retrieve all minors from database test.
 */
test('Get all minors', async function () {
    let req = {};
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    // Create a fake documents collection for the dao model
    let minors = [
        { _id: 'm1', name: 'Bob', date_of_birth: '2010-10-10', parent_id: '1212', team_id: '2121' },
        { _id: 'm2', name: 'Bobby', date_of_birth: '2010-10-10', parent_id: '1212', team_id: '2121' },
    ];
    dao.minorModel.find.mockResolvedValue(minors);
    await controller.getAllMinors(req, res);
    
    expect(dao.minorModel.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(minors);
    expect(res.status).not.toHaveBeenCalled();
});