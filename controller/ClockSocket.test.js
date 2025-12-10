// ClockSocket.test.js
const setupSocket = require("../controller/ClockSocket.js"); 
const matchDao = require("../model/MatchDao.js");

jest.mock("../model/MatchDao");

// Shared mocks
let ioMock;
let socketMock;
let registeredEvents = {};

beforeEach(() => {
  registeredEvents = {};

  socketMock = {
    id: "SOCKET1",
    emit: jest.fn(),
    on: jest.fn((event, handler) => {
      registeredEvents[event] = handler;
    })
  };

  ioMock = {
    emit: jest.fn(),
    on: jest.fn((event, handler) => {
      if (event === "connection") {
        handler(socketMock);
      }
    })
  };

  setupSocket(ioMock);
});


//register socket correctly
test("Socket registers connection listener", () => {
  expect(ioMock.on).toHaveBeenCalledWith("connection", expect.any(Function));
});

//match exists so clock state exists
test("clock:requestState sends state when match exists", async () => {
  matchDao.readById.mockResolvedValue({
    clock: {
      status: "started",
      startTimestamp: 111,
      elapsedBeforeStart: 222
    }
  });

  await registeredEvents["clock:requestState"]("MATCH1");

  expect(socketMock.emit).toHaveBeenCalledWith("clock:state", {
    matchId: "MATCH1",
    status: "started",
    startTimestamp: 111,
    elapsedBeforeStart: 222
  });
});

//match does not exist so clock state does not exist
test("clock:requestState emits error when no match found", async () => {
  matchDao.readById.mockResolvedValue(null);

  await registeredEvents["clock:requestState"]("BADID");

  expect(socketMock.emit).toHaveBeenCalledWith("clock:error", {
    message: "Match not found"
  });
});

//clock start to all clients
test("clock:start relays event to all clients", () => {
  registeredEvents["clock:start"]({ foo: 123 });

  expect(ioMock.emit).toHaveBeenCalledWith("clock:start", { foo: 123 });
});

//clock stop to all clients
test("clock:stop relays event to all clients", () => {
  registeredEvents["clock:stop"]({ bar: 777 });

  expect(ioMock.emit).toHaveBeenCalledWith("clock:stop", { bar: 777 });
});

//disconnecting the log (spyOn allows for looking at console output)
test("disconnect logs correctly", () => {
  const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  registeredEvents["disconnect"]();

  expect(logSpy).toHaveBeenCalledWith("Client disconnected:", "SOCKET1");

  logSpy.mockRestore();
});

//error sending clock state
test("clock:requestState logs error when matchDao.readById throws", async () => {
  const error = new Error("DB failure");
  matchDao.readById.mockRejectedValue(error);

  const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  await registeredEvents["clock:requestState"]("MATCH_BAD");

  expect(errorSpy).toHaveBeenCalledWith(
    "Error sending clock state:",
    error
  );

  errorSpy.mockRestore();
});
