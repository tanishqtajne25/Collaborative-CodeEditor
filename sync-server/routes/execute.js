const express = require("express");

const router = express.Router();

//POST /execute
/**
 * @ route
*/
router.post("/", async (req, res) => {
    console.log("Execution request recieved");

    const {language, code} = req.body;

    res.json({
        success: true,
        message: "Execution Endpoint Working",
        language: language || "not provided",
        codeLength: code ? code.length : 0,
        output : "Hello from Backend"
    });
});

module.exports = router;