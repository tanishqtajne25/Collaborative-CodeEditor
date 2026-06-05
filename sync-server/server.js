const http = require("http");
const WebSocket = require("ws");
const Y = require("yjs");
const { setupWSConnection, getYDoc } = require("y-websocket/bin/utils");
const Redis = require("ioredis");

// 1. Initialize Redis Clients (Pub & Sub need separate connections)
const pubClient = new Redis(); // Connects to localhost:6379 by default
const subClient = new Redis();

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const SYNC_CHANNEL = "yjs-cluster-sync";

// Dynamic Port Assignment for horizontal scaling test
const PORT = process.env.PORT || 3001;

// 2. Subscribe Server to the Redis Channel
subClient.subscribe(SYNC_CHANNEL);

// 3. Handle incoming remote updates from OTHER servers
subClient.on("message", (channel, message) => {
    if (channel === SYNC_CHANNEL) {
        const { docName, update } = JSON.parse(message);
        console.log(`[SERVER ${PORT}] REDIS RECEIVED FOR DOC ${docName}`);

        // Fetch the target document from memory
        const doc = getYDoc(docName);

        // Convert base64 string back into binary CRDT data
        const binaryUpdate = new Uint8Array(
            Buffer.from(update, "base64")
        );

        // Apply the remote update.
        // CRITICAL: We pass "redis" as the 'origin' parameter.
        Y.applyUpdate(doc, binaryUpdate, "redis");
    }
});

wss.on("connection", (ws, req) => {
    // Extract room name from the URL path
    const docName = req.url.slice(1).split("?")[0] || "default";
    console.log("[CLIENT CONNECTED]", docName);

    // Let y-websocket handle the basic connection logic
    setupWSConnection(ws, req, { docName });

    // 4. Hook into the document to catch local changes
    const doc = getYDoc(docName);

    // Ensure we only attach one event listener per document, not per user
    if (!doc.redisAttached) {
        doc.redisAttached = true;

        doc.on("update", (update, origin) => { // Yjs generates a compact binary CRDT delta, NOT THE WHole doc
            console.log(
                `[LOCAL UPDATE] room=${docName} origin=${origin} bytes=${update.length}`
            );
            // THE INFINITE ECHO FIX:
            // If the update originated from Redis,
            // do NOT send it back to Redis.
            if (origin !== "redis") {
                const payload = JSON.stringify({
                    docName: docName,
                    update: Buffer.from(update).toString("base64"),
                });

                console.log("[PUBLISHING TO REDIS]", docName);
                pubClient.publish(SYNC_CHANNEL, payload);
            }
        });
    }
});

console.log(`[SERVER ${PORT}] STARTED`);
server.listen(PORT, () => {
    console.log(`Yjs Node server running on ws://localhost:${PORT}`);
});