const http = require("http");
const Y = require("yjs");
const { WebsocketProvider } = require("y-websocket");
const WebSocket = require("ws");

const BASE_URL = "http://localhost:3001";
const WS_URL = "ws://localhost:3001";

// Helper for making HTTP JSON requests
function makeRequest(path, method = "GET", body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({
              status: res.statusCode,
              data: data ? JSON.parse(data) : null,
            });
          } catch {
            resolve({
              status: res.statusCode,
              data: data,
            });
          }
        });
      }
    );

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log("══════════════════════════════════════════════════════════");
  console.log(" 🧪 COLLABORATIVE CODE EDITOR - FULL INTEGRATION TEST SUITE");
  console.log("══════════════════════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = "") {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // 1. Health Check
  try {
    const health = await makeRequest("/health");
    assert(
      health.status === 200 && health.data?.status === "healthy",
      "Health Check Endpoint (/health)"
    );
  } catch (e) {
    assert(false, "Health Check Endpoint (/health)", e.message);
  }

  // 2. Languages List Endpoint
  try {
    const langs = await makeRequest("/execute/languages");
    assert(
      langs.status === 200 &&
        langs.data?.languages?.length >= 4 &&
        langs.data.languages.some((l) => l.id === "python") &&
        langs.data.languages.some((l) => l.id === "cpp"),
      "Languages Config Endpoint (/execute/languages)"
    );
  } catch (e) {
    assert(false, "Languages Config Endpoint (/execute/languages)", e.message);
  }

  // 3. User Registration
  const testEmail = `testuser_${Date.now()}@example.com`;
  let authToken = null;
  try {
    const regRes = await makeRequest("/api/auth/register", "POST", {
      name: "Test Engineer",
      email: testEmail,
      password: "password123",
    });
    assert(
      regRes.status === 201 && regRes.data?.token && regRes.data?.user?.email === testEmail,
      "User Registration (POST /api/auth/register)"
    );
    authToken = regRes.data?.token;
  } catch (e) {
    assert(false, "User Registration", e.message);
  }

  // 4. User Login
  try {
    const loginRes = await makeRequest("/api/auth/login", "POST", {
      email: testEmail,
      password: "password123",
    });
    assert(
      loginRes.status === 200 && loginRes.data?.token && loginRes.data?.user?.name === "Test Engineer",
      "User Login (POST /api/auth/login)"
    );
    authToken = loginRes.data?.token;
  } catch (e) {
    assert(false, "User Login", e.message);
  }

  // 5. Auth Profile (/api/auth/me)
  try {
    const meRes = await makeRequest("/api/auth/me", "GET", null, authToken);
    assert(
      meRes.status === 200 && meRes.data?.user?.email === testEmail,
      "Protected Profile Verification (GET /api/auth/me)"
    );
  } catch (e) {
    assert(false, "Protected Profile Verification", e.message);
  }

  // 6. Project Creation & Persistence in Database
  let testRoomName = null;
  try {
    const projRes = await makeRequest(
      "/api/projects",
      "POST",
      {
        name: "Test Algorithm Project",
        initialLanguage: "python",
      },
      authToken
    );
    assert(
      projRes.status === 201 &&
        projRes.data?.project?.id &&
        projRes.data?.project?.room?.docName,
      "Create & Persist Project in Database (POST /api/projects)"
    );
    testRoomName = projRes.data?.project?.room?.docName;
  } catch (e) {
    assert(false, "Create Project", e.message);
  }

  // 7. List Projects
  try {
    const listRes = await makeRequest("/api/projects", "GET", null, authToken);
    assert(
      listRes.status === 200 &&
        Array.isArray(listRes.data?.projects) &&
        listRes.data.projects.some((p) => p.name === "Test Algorithm Project"),
      "List Database Projects (GET /api/projects)"
    );
  } catch (e) {
    assert(false, "List Projects", e.message);
  }

  // 8. Python Docker Code Execution
  try {
    const pyRes = await makeRequest("/execute", "POST", {
      language: "python",
      code: `x = 10\ny = 25\nprint(f"Sum: {x + y}")`,
    });
    assert(
      pyRes.status === 200 &&
        pyRes.data?.success === true &&
        pyRes.data?.stdout?.trim() === "Sum: 35",
      "Python 3 Sandboxed Docker Execution (POST /execute)"
    );
  } catch (e) {
    assert(false, "Python Code Execution", e.message);
  }

  // 9. JavaScript (Node) Docker Code Execution
  try {
    const jsRes = await makeRequest("/execute", "POST", {
      language: "javascript",
      code: `const nums = [1, 2, 3, 4]; console.log("Result:", nums.reduce((a, b) => a * b, 1));`,
    });
    assert(
      jsRes.status === 200 &&
        jsRes.data?.success === true &&
        jsRes.data?.stdout?.trim() === "Result: 24",
      "JavaScript (Node) Sandboxed Docker Execution (POST /execute)"
    );
  } catch (e) {
    assert(false, "JavaScript Code Execution", e.message);
  }

  // 10. C++ GCC Sandboxed Compilation & Execution
  try {
    const cppRes = await makeRequest("/execute", "POST", {
      language: "cpp",
      code: `#include <iostream>\nint main() { std::cout << "CPP_SUCCESS" << std::endl; return 0; }`,
    });
    assert(
      cppRes.status === 200 &&
        cppRes.data?.success === true &&
        cppRes.data?.stdout?.trim() === "CPP_SUCCESS",
      "C++ (GCC 14) Sandboxed Compilation & Execution (POST /execute)"
    );
  } catch (e) {
    assert(false, "C++ Code Execution", e.message);
  }

  // 11. Docker Execution Timeout Protection (Infinite Loop Killer)
  try {
    const timeoutRes = await makeRequest("/execute", "POST", {
      language: "python",
      code: `while True: pass`,
    });
    // Should be killed by 7s SIGKILL timeout and return
    assert(
      timeoutRes.status === 200,
      "Docker Execution Timeout Safety (Infinite Loop Killed)"
    );
  } catch (e) {
    assert(false, "Timeout Safety", e.message);
  }

  // 12. Real-Time Yjs WebSocket Synchronization & Peer Convergence
  const syncRoom = testRoomName || `test-room-${Date.now()}`;
  try {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    const wsProvider1 = new WebsocketProvider(WS_URL, syncRoom, doc1, { WebSocketPolyfill: WebSocket });
    const wsProvider2 = new WebsocketProvider(WS_URL, syncRoom, doc2, { WebSocketPolyfill: WebSocket });

    const text1 = doc1.getText("monaco");
    const text2 = doc2.getText("monaco");

    // Wait for providers to connect and sync
    await new Promise((resolve) => {
      let syncedCount = 0;
      const checkSynced = (isSynced) => {
        if (isSynced) {
          syncedCount++;
          if (syncedCount >= 2) resolve();
        }
      };
      wsProvider1.on("sync", checkSynced);
      wsProvider2.on("sync", checkSynced);
      setTimeout(resolve, 3000);
    });

    // Client 1 types text
    text1.insert(0, "function helloWorld() {\n  return 42;\n}");

    // Wait for WebSocket propagate
    await new Promise((resolve) => setTimeout(resolve, 1000));

    assert(
      text2.toString() === "function helloWorld() {\n  return 42;\n}",
      "Real-Time Yjs CRDT WebSocket Sync between 2 Clients"
    );

    // Client 2 types concurrent edit
    text2.insert(text2.length, "\nconsole.log(helloWorld());");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    assert(
      text1.toString() === text2.toString() && text1.toString().includes("console.log"),
      "Bi-Directional Concurrent CRDT Eventual Consistency"
    );

    // Wait for debounced persistence (1.5s) to commit to SQLite/Postgres DB
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify room snapshot is in the database
    const roomCheck = await makeRequest(`/api/rooms/${syncRoom}`);
    assert(
      roomCheck.status === 200 &&
        roomCheck.data?.room?.lastContent?.includes("helloWorld"),
      "Y.Doc Binary Snapshot Persisted to Database"
    );

    wsProvider1.destroy();
    wsProvider2.destroy();
    doc1.destroy();
    doc2.destroy();
  } catch (e) {
    assert(false, "Real-Time WebSocket & Persistence Sync", e.message);
  }

  console.log("\n══════════════════════════════════════════════════════════");
  console.log(` 📊 SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log("══════════════════════════════════════════════════════════\n");

  if (failed === 0) {
    console.log("🎉 ALL TESTS PASSED! The system is 100% operational.");
  }

  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch((err) => {
  console.error("Fatal Test Runner Error:", err);
  process.exit(1);
});
