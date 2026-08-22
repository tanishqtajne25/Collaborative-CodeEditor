const express = require("express");
const { processCode } = require("../services/executionService");
const languages = require("../config/languages");

const router = express.Router();

// GET /execute/languages
router.get("/languages", (req, res) => {
    const list = Object.entries(languages).map(([key, config]) => ({
        id: key,
        name: config.name,
        monacoLang: config.monacoLang,
        extension: config.extension,
        defaultCode: config.defaultCode,
    }));
    res.json({ success: true, languages: list });
});

// POST /execute
router.post("/", async (req, res) => {
    try {
        const { language, code } = req.body;

        if (!code || typeof code !== "string") {
            return res.status(400).json({
                success: false,
                error: "Invalid request: 'code' string is required",
            });
        }

        const result = await processCode(code, language || "python");

        res.json({
            success: true,
            language: language || "python",
            exitCode: result.exitCode,
            stdout: result.stdout,
            stderr: result.stderr,
        });
    } catch (error) {
        console.error("[EXECUTION ERROR]", error.message);

        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

module.exports = router;