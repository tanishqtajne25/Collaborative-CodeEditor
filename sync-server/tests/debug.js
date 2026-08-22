const { processCode } = require("../services/executionService");

async function test() {
  try {
    const res = await processCode('print("Hello from Python")', "python");
    console.log("EXECUTION RESULT:", res);
  } catch (err) {
    console.error("EXECUTION ERROR:", err);
  }
}

test();
