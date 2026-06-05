const http = require("http");
const WebSocket = require("ws");
const Y = require("yjs")
const {setupWSConnection, getYDoc} = require("y-websocket/bin/utils");
const redis = require("ioredis");

// 1. Initiallize redis clients, pub and sub, need seperate connections
const pubClient = new Redis();
const subClient = new Redis();

const server = http.createServer