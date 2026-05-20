const express = require("express");
const http = require("http");
const { server } = require("socket.io")

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);
});

server.listen(3001, () => {
    console.log("server running on port 3001");
});