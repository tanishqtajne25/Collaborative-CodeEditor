const express = require("express");
const prisma = require("../db/prisma");

const router = express.Router();

// GET /api/rooms/:docName - Get saved room metadata & preview
router.get("/:docName", async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { docName: req.params.docName },
      select: {
        id: true,
        docName: true,
        lastContent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found in persistent storage" });
    }

    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
