const controller = require("./TeamCreation");
const dao = require("../model/TeamDao");

jest.mock("../model/TeamDao");

test('Create team successfully!', async function(){
    let req = { 
        body: { 
            name: "Palmeiras", 
            location: "Sao Paulo", 
            wins: 19, 
            losses: 5, 
            priorSeasonWins: 22, 
            priorSeasonLosses: 9, 
            playoffSeed: 1 
        } 
    };
    let res = { redirect: jest.fn(), status: jest.fn(), send: jest.fn() };

    dao.create.mockResolvedValue({});

    await controller.teamCreation(req, res);

    expect(dao.create).toHaveBeenCalledWith({
        name: "Palmeiras",
        location: "Sao Paulo",
        wins: 19,
        losses: 5,
        priorSeasonWins: 22,
        priorSeasonLosses: 9,
        playoffSeed: 1
    });
    expect(res.redirect).toHaveBeenCalledWith("manager-teams.html?success=1");
});

test('Handle missing team data', async function(){
    let req = { body: { name: "", location: "", wins: 0, losses: 0 } };
    let res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.create.mockResolvedValue({});

    await controller.teamCreation(req, res);

    expect(dao.create).toHaveBeenCalled();
});

test('Catch database error', async function(){
    let req = { 
        body: { 
            name: "Cruzeiro", 
            location: "Belo Horizonte", 
            wins: 16, 
            losses: 5, 
            priorSeasonWins: 14, 
            priorSeasonLosses: 14, 
            playoffSeed: 3 
        } 
    };
    let res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.create.mockRejectedValue(new Error("DB error"));

    await controller.teamCreation(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("error creating team");
});

