
const matchDao = require("../model/MatchDao");


function setupSocket(io) {
    console.log("Socket.io: Ready");

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("clock:requestState", async (matchId) => {
            try {
                const match = await matchDao.readById(matchId);

                if (!match) {
                    return socket.emit("clock:error", { message: "Match not found" });
                }

                socket.emit("clock:state", {
                    matchId,
                    status: match.clock.status,
                    startTimestamp: match.clock.startTimestamp,
                    elapsedBeforeStart: match.clock.elapsedBeforeStart
                });

            } catch (err) {
                console.error("Error sending clock state:", err);
            }
        });

        socket.on("clock:start", (payload) => {
            io.emit("clock:start", payload);
        });

   
        socket.on("clock:stop", (payload) => {
            io.emit("clock:stop", payload);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
}

module.exports = setupSocket;
