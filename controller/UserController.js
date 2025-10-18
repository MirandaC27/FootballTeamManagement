const dao = require('../model/UserModel');
const passUtil = require('../util/PasswordUtil');

/**
 * Create a new user account and register it in the database.
 * @param {*} req request object containing data
 * @param {*} res response object used to send back
 */
const register = async (req, res) => {
    try {
        const { username, password, email, phone, date_of_birth, name } = req.body;
        const hashedPassword = passUtil.hashPassword(password);
        const newUser = new dao.userModel({ username, password: hashedPassword, email, phone, date_of_birth, name, role: 'adult', approve: false });
        await newUser.save();
        res.redirect('login.html');
    } catch (err) {
        res.status(500).send('Error registering');
    }
};

/**
 * Login an account with username and password. 
 * @param {*} req request obejct containing data
 * @param {*} res response object to send back
 * @returns 
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await dao.userModel.findOne(({ username }));

        // can't find username
        if (!user) {
            return res.redirect('login.html?error=1');
        }

        // check password
        const isMatch = await passUtil.comparePassword(password, user.password);
        if (!isMatch) {
            return res.redirect('login.html?error=1');
        }

        // successful login
        req.session.user = user;
        res.redirect('index.html');

    } catch (err) {
        res.status(500).send('Error logging in');
    }
};

/**
 * Check if there's a user currently logged in.
 * @param {*} req request obejct containing data
 * @param {*} res response object to send back
 */
const loggedUser = (req, res) => {
    if (req.session.user) {
        res.send(req.session.user);
    } else {
        res.json(null);
    }
};

/**
 * Log out an account.
 * @param {*} req request object containing data
 * @param {*} res response object to send back
 */
const logout = async (req, res) => {
    req.session.user = null;
    res.redirect('index.html');
};

/**
 * Get all users from the database.
 * @param {*} req request object containing data
 * @param {*} res response object to send back
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await dao.userModel.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).send('Error getting users');
    }
};

/**
 * Approve an user. 
 * @param {*} req request object containing data
 * @param {*} res response object to send back
 */
const approveUser = async (req, res) => {
    try {
        const id = req.params.id;
        await dao.userModel.findByIdAndUpdate(id, { approve: true });
    } catch (err) {
        res.status(500).send('Error approving user');
    }
};

module.exports = {
    register,
    login,
    loggedUser,
    logout,
    getAllUsers,
    approveUser,
};