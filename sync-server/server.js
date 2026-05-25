const http = require("http");
const WebSocket = require("ws");
const Y = require("yjs");

const setupWSConnection = require("y-websocket/bin/utils").setupWSConnection;

const server = http.createServer();

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
  console.log("Client connected");

  setupWSConnection(ws, req, {
    gc: true,
  });
});



const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Yjs WebSocket server running on ws://localhost:${PORT}`);
});