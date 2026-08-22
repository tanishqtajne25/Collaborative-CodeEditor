const express = require("express");
const prisma = require("../db/prisma");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/projects - List all projects
router.get("/", optionalAuth, async (req, res) => {
  try {
    const where = req.user ? { OR: [{ ownerId: req.user.id }, { ownerId: null }] } : {};

    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        files: { select: { id: true, name: true, language: true } },
        room: { select: { id: true, docName: true, updatedAt: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/projects - Create a new project
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { name, description, initialLanguage = "python" } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ success: false, error: "Project name is required" });
    }

    const docName = "room-" + Math.random().toString(36).substring(2, 8);

    const project = await prisma.project.create({
      data: {
        name,
        description: description || "",
        ownerId: req.user ? req.user.id : null,
        files: {
          create: [
            {
              name: initialLanguage === "python" ? "main.py" : "main.js",
              language: initialLanguage,
              content: "",
            },
          ],
        },
        room: {
          create: {
            docName,
          },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        files: true,
        room: true,
      },
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// GET /api/projects/:id - Get project details
router.get("/:id", async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        files: true,
        room: true,
      },
    });

    if (!project) {
      return res.status(400).json({ success: false, error: "Project not found" });
    }

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete("/:id", async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
