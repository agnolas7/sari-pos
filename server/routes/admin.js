const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { AdminLog } = require("../models");
require("dotenv").config();

// POST verify admin PIN
router.post("/login", async (req, res) => {
  try {
    const { pin } = req.body;
    if (pin !== process.env.ADMIN_PIN) {
      return res.status(401).json({ error: "Wrong PIN" });
    }
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET admin logs
router.get("/logs", async (req, res) => {
  try {
    const logs = await AdminLog.findAll({
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
