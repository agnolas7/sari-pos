const express = require("express");
const router = express.Router();
const Attendant = require("../models/Attendant");
const requireAdmin = require("../middleware/requireAdmin");

// GET all attendants
router.get("/", async (req, res) => {
  try {
    const attendants = await Attendant.findAll({
      order: [["createdAt", "ASC"]],
    });
    res.json(attendants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create attendant
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, emoji, color } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const attendant = await Attendant.create({ name, emoji, color });
    res.status(201).json(attendant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update attendant
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const attendant = await Attendant.findByPk(req.params.id);
    if (!attendant) return res.status(404).json({ error: "Not found" });
    const { name, emoji, color } = req.body;
    await attendant.update({ name, emoji, color });
    res.json(attendant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE attendant
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const attendant = await Attendant.findByPk(req.params.id);
    if (!attendant) return res.status(404).json({ error: "Not found" });
    await attendant.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
