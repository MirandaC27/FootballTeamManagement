const controller = require('./PostCommentController');
const dao = require('../model/PostCommentDao');

// Mock the entire dao module
jest.mock("../model/PostCommentDao");

/**
 * Executed before each test.
 */
beforeEach(function () {
    jest.clearAllMocks();
});

/**
 * Add comment successfully test
 */
test('Add a comment successfully', async () => {
    let req = {
        params: { postId: "p1213" },
        session: { user: { _id: "up123123" } },
        body: { message: "aaaaaa" }
    };
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };
    let comments = {
        _id: "c1",
        post_id: "p1213",
        owner_id: "up123123",
        message: "aaaaaa"
    };

    dao.create.mockResolvedValue(comments);
    await controller.addComment(req, res);

    expect(dao.create).toHaveBeenCalledWith({
        post_id: "p1213",
        owner_id: "up123123",
        message: "aaaaaa"
    });
    expect(res.json).toHaveBeenCalledWith(comments);
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Add comment fail test
 */
test('Add comment fail', async () => {
    let req = {
        params: { postId: "p1213" },
        session: { user: { _id: "up123123" } },
        body: { message: "aaaaaa" }
    };
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.create.mockRejectedValue(new Error("err"));
    await controller.addComment(req, res);

    expect(dao.create).toHaveBeenCalledWith({
        post_id: "p1213",
        owner_id: "up123123",
        message: "aaaaaa"
    });
    expect(res.send).toHaveBeenCalledWith('Error adding comment');
    expect(res.status).toHaveBeenCalled();
});

/**
 * Get all comments for a post successfully test
 */
test('Get all comments for a post successfully', async () => {
    let req = { params: { postId: "p1213" } };
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };
    let comments = [
        { _id: "abc", message: "asdsad", owner_id: { name: "EE1" } },
        { _id: "defg", message: "dsfdfvfd", owner_id: { name: "ASDalds,ae" } }
    ];

    dao.readAll.mockResolvedValue(comments);
    await controller.getAllComments(req, res);

    expect(dao.readAll).toHaveBeenCalledWith("p1213");
    expect(res.json).toHaveBeenCalledWith(comments);
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Get all comments fail test
 */
test('Get all comments fail', async () => {
    const req = { params: { postId: "p1213" } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.readAll.mockRejectedValue(new Error("err"));
    await controller.getAllComments(req, res);

    expect(res.status).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith('Error getting comments');
});
