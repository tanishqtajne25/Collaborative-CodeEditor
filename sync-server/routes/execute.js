const express = require("express");
const { processCode } = require("../services/executionService");

const router = express.Router();

//POST /execute
/**
 * @ route
*/
router.post("/", async (req, res) => {
    try {
        const { language, code } = req.body;

        const result = await processCode(code);

        res.json({
            success: true,
            language,
            exitCode: result.exitCode,
            stdout: result.stdout,
            stderr: result.stderr,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;