const controller = require('./UserController');
const dao = require('../model/UserDao');
const passUtil = require('../util/PasswordUtil');

// Mock the whole modules
jest.mock('../model/UserDao');
jest.mock('../util/PasswordUtil');

/**
 * Executed before each test.
 */
beforeEach(function () {
    jest.clearAllMocks();
});

/**
 * Register new account test.
 */
test('Register new account', async function () {
    let req = {
        body: {
            username: 'bob', password: '12345678', email: 'bob@mail.com', phone: '123456789',
            date_of_birth: '2000-01-01', name: 'Bob'
        }
    };
    let res = { redirect: jest.fn(), status: jest.fn(), send: jest.fn() };

    await controller.register(req, res);
    expect(res.redirect).toHaveBeenCalledWith('login.html');
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Login to an account succesfully test.
 */
test('Login to an account', async function () {
    let req = { body: { username: 'bob', password: '12132131321' }, session: {} };
    let res = { redirect: jest.fn(), status: jest.fn(), send: jest.fn() };

    // Mock that it found account from database
    dao.userModel.findOne.mockResolvedValue({ username: 'bob', password: 'hashed' });
    passUtil.comparePassword.mockResolvedValue(true);
    await controller.login(req, res);

    expect(passUtil.comparePassword).toHaveBeenCalledWith('12132131321', 'hashed');
    expect(res.redirect).toHaveBeenCalledWith('index.html');
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Login to an account but can't find username test.
 */
test('Login to an account but can\'t find username', async function () {
    let req = { body: { username: 'bob', password: '12132131321' }, session: {} };
    let res = { redirect: jest.fn(), status: jest.fn(), send: jest.fn() };

    // Mock that username can't be found
    dao.userModel.findOne.mockResolvedValue(null);
    await controller.login(req, res);

    expect(res.redirect).toHaveBeenCalledWith('login.html?error=1');
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Login to an account with password doesn't match test.
 */
test('Login to an account but password doesn\'t match', async function () {
    let req = { body: { username: 'bob', password: '12132131321' }, session: {} };
    let res = { redirect: jest.fn(), status: jest.fn(), send: jest.fn() };

    // Mock that the password doesn't match
    dao.userModel.findOne.mockResolvedValue({ username: 'bob', password: 'hashed' });
    passUtil.comparePassword.mockResolvedValue(false);
    await controller.login(req, res);

    expect(res.redirect).toHaveBeenCalledWith('login.html?error=1');
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Successfully check user logged in test.
 */
test('There is a user currently logged in', async function () {
    let req = { session: { user: { username: 'bob' } } };
    let res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

    controller.loggedUser(req, res);

    expect(res.send).toHaveBeenCalledWith({ username: 'bob' });
    expect(res.json).not.toHaveBeenCalled();
});

/**
 * No user logged in test.
 */
test('There is no user currently logged in', async function () {
    let req = { session: {} };
    let res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

    controller.loggedUser(req, res);

    expect(res.send).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(null);
});

/**
 * Log out of an account test.
 */
test('Log out an account', async function () {
    let req = { session: { user: { username: 'bob' } } };
    let res = { redirect: jest.fn() };

    controller.logout(req, res);
    expect(res.redirect).toHaveBeenCalledWith('index.html');
});

/**
 * Get all users from database test.
 */
test('Get all users from database', async function () {
    let req = {};
    let res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

    // Create a fake documents collection for the dao model
    let users = [
        {
            _id: 'm1', username: 'Bob', password: '2132123213', email: '12@gmail.com',
            phone: '2120001234', date_of_birth: '2010-10-10', name: 'Bob 1',
            approve: true, role: 'adult'
        },
        {
            _id: 'm2', username: 'Bobby', password: '21321321331', email: '1@aol.com',
            phone: '1231231234', date_of_birth: '2010-10-10', name: 'Bobby 2',
            approve: false, role: 'manager'
        },
    ];
    dao.userModel.find.mockResolvedValue(users);
    await controller.getAllUsers(req, res);

    expect(dao.userModel.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(users);
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Approve an user test.
 */
test('Approve an user', async function(){
    let req = { params: { id: 'm1' } };
    let res = { status: jest.fn(), send: jest.fn() };

    dao.userModel.findByIdAndUpdate.mockResolvedValue(true);
    await controller.approveUser(req, res);

    expect(dao.userModel.findByIdAndUpdate).toHaveBeenCalledWith('m1', { approve: true });
    expect(res.status).not.toHaveBeenCalled();
});
