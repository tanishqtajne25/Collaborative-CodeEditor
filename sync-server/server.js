const http = require("http");
const WebSocket = require("ws");
const Y = require("yjs");

const setupWSConnection = require("y-websocket/bin/utils.cjs").setupWSConnection;

const server = http.createServer();

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
  console.log("Client connected");

  setupWSConnection(ws, req, {
    gc: true,
  });
});

server.listen(3001, () => {
  console.log("Yjs websocket server running on port 3001");
});