const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");
const languages = require("../config/languages");

async function processCode(code, language = "python") {
    const langKey = (language || "python").toLowerCase();
    const config = languages[langKey];

    if (!config) {
        throw new Error(
            `Unsupported language: "${language}". Supported languages: ${Object.keys(languages).join(", ")}`
        );
    }

    // Use a unique temp directory per execution to prevent race conditions
    const executionId = crypto.randomUUID();
    const tempDir = path.join(__dirname, "..", "temp", executionId);

    await fs.mkdir(tempDir, { recursive: true });

    const filePath = path.join(tempDir, config.filename);
    await fs.writeFile(filePath, code, "utf8");

    // Normalize tempDir path for cross-platform Docker volume mounting (Windows & Linux)
    const normalizedMountPath = path.resolve(tempDir).replace(/\\/g, "/");

    return new Promise((resolve, reject) => {
        const dockerArgs = [
            "run",
            "--rm",

            // ── Security Hardening ──
            "--cpus=0.5",           // Limit to half a CPU core (cgroups)
            "--memory=128m",        // Cap memory at 128MB (cgroups)
            "--pids-limit=50",      // Prevent fork bombs
            "--network=none",       // No network access from user code (namespace isolation)
            "--read-only",          // Read-only root filesystem
            "--tmpfs=/tmp:size=64m", // Writable /tmp in RAM for compilers/binaries

            // ── Volume mount ──
            "-v",
            `${normalizedMountPath}:/app:ro`, // Mount source directory as read-only

            // ── Image & Execution Command ──
            config.image,
            ...config.command,
        ];

        const process = spawn("docker", dockerArgs);

        const timeout = setTimeout(() => {
            process.kill("SIGKILL");
        }, 7000); // 7s timeout to account for compilation + execution


        let stdout = "";
        let stderr = "";

        process.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        process.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        process.on("close", async (exitCode) => {
            clearTimeout(timeout);

            // Clean up the temp directory after execution
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (e) {
                console.error(`[CLEANUP] Failed to remove ${tempDir}:`, e.message);
            }

            if (stderr.includes("dockerDesktopLinuxEngine") || stderr.includes("Cannot connect to the Docker daemon")) {
                stderr += "\n[NOTE] Docker Desktop is not running. Please start Docker Desktop on your machine to execute code in sandboxed containers.";
            }

            resolve({
                exitCode,
                stdout,
                stderr,
            });
        });


        process.on("error", async (err) => {
            clearTimeout(timeout);
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (_) {}
            reject(err);
        });
    });
}

module.exports = {
    processCode,
};