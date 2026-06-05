const fs = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");

async function processCode(code) {
    const tempDir = path.join(__dirname, "..", "temp");

    await fs.mkdir(tempDir, { recursive: true });

    const filePath = path.join(tempDir, "test.py");

    await fs.writeFile(filePath, code);

    return new Promise((resolve, reject) => {
        const python = spawn("python", [filePath]);

        const timeout = setTimeout(() => {
            python.kill("SIGKILL");
        }, 5000);

        let stdout = "";
        let stderr = "";

        python.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        python.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        python.on("close", (code) => {
            clearTimeout(timeout);

            resolve({
                exitCode: code,
                stdout,
                stderr,
            });
        });

        python.on("error", reject);
    });
}

module.exports = {
    processCode,
};