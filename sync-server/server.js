const http = require("http");
const WebSocket = require("ws");
const Y = require("yjs");
const { setupWSConnection, getYDoc, docs } = require("y-websocket/bin/utils");
const Redis = require("ioredis");
const express = require("express");
const cors = require("cors");

const executeRoutes = require("./routes/execute");
const projectRoutes = require("./routes/projects");
const roomRoutes = require("./routes/rooms");
const authRoutes = require("./routes/auth");
const {
    loadDocumentState,
    bindPersistence,
    flushAllDocuments,
} = require("./services/persistenceService");

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/execute", executeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/rooms", roomRoutes);


// Health Check
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// 1. Initialize Redis Clients with resilient error handling
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const pubClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    retryStrategy: (times) => Math.min(times * 200, 3000),
    maxRetriesPerRequest: 3,
    lazyConnect: true,
});

const subClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    retryStrategy: (times) => Math.min(times * 200, 3000),
    maxRetriesPerRequest: 3,
    lazyConnect: true,
});

// Avoid unhandled rejection on standalone local runs if Redis isn't running
pubClient.on("error", (err) => console.warn("[REDIS PUB WARN]", err.message));
subClient.on("error", (err) => console.warn("[REDIS SUB WARN]", err.message));

pubClient.connect().catch(() => {});
subClient.connect().then(() => {
    subClient.subscribe(SYNC_CHANNEL);
}).catch(() => {});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const SYNC_CHANNEL = "yjs-cluster-sync";

// Dynamic Port Assignment for horizontal scaling test
const PORT = process.env.PORT || 3001;

// 2. Handle incoming remote updates from OTHER servers (Redis Pub/Sub)
subClient.on("message", (channel, message) => {
    if (channel === SYNC_CHANNEL) {
        try {
            const { docName, update } = JSON.parse(message);
            console.log(`[SERVER ${PORT}] REDIS RECEIVED FOR DOC ${docName}`);

            // Fetch the target document from memory
            const doc = getYDoc(docName);

            // Convert base64 string back into binary CRDT data
            const binaryUpdate = new Uint8Array(Buffer.from(update, "base64"));

            // Apply the remote update with 'redis' origin to prevent infinite echo
            Y.applyUpdate(doc, binaryUpdate, "redis");
        } catch (err) {
            console.error("[REDIS MESSAGE ERROR]", err.message);
        }
    }
});

wss.on("connection", async (ws, req) => {
    // Extract room name from the URL path
    const docName = req.url.slice(1).split("?")[0] || "default";
    console.log("[CLIENT CONNECTED]", docName);

    // Fetch the Y.Doc instance
    const doc = getYDoc(docName);

    // 3. PERSISTENCE: Restore document snapshot from Database if not loaded yet
    if (!doc.persistenceInitialized) {
        doc.persistenceInitialized = true;
        await loadDocumentState(docName, doc);
        bindPersistence(docName, doc);
    }

    // 4. Let y-websocket handle client connection & real-time sync protocol
    setupWSConnection(ws, req, { docName });

    // 5. Hook into the document to publish local changes to Redis cluster
    if (!doc.redisAttached) {
        doc.redisAttached = true;

        doc.on("update", (update, origin) => {
            console.log(
                `[LOCAL UPDATE] room=${docName} origin=${origin} bytes=${update.length}`
            );

            // THE INFINITE ECHO FIX:
            // Don't publish if update originated from Redis or initial DB load
            if (origin !== "redis" && origin !== "persistence") {
                const payload = JSON.stringify({
                    docName: docName,
                    update: Buffer.from(update).toString("base64"),
                });

                pubClient.publish(SYNC_CHANNEL, payload).catch(() => {});
            }
        });
    }
});

// Graceful Shutdown - Flush all active YDocs to Database
async function handleShutdown(signal) {
    console.log(`\n[SHUTDOWN] Received ${signal}. Saving active documents to DB...`);
    try {
        if (docs) {
            await flushAllDocuments(docs);
        }
    } catch (e) {
        console.error("[SHUTDOWN ERROR]", e);
    } finally {
        process.exit(0);
    }
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

console.log(`[SERVER ${PORT}] STARTED`);
server.listen(PORT, () => {
    console.log(`Yjs Node sync server running on http://localhost:${PORT} and ws://localhost:${PORT}`);
});