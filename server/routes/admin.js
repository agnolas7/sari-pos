const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { AdminLog } = require("../models");
const requireAdmin = require("../middleware/requireAdmin");
require("dotenv").config();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// In-memory attempt tracker (resets on server restart — fine for family use)
const attemptTracker = new Map(); // key: IP, value: { count, lockedUntil }

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // hard cap at 20 requests per window per IP (extra safety net)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// POST verify admin PIN
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const now = Date.now();
    const tracker = attemptTracker.get(ip) || { count: 0, lockedUntil: 0 };

    // Check lockout
    if (tracker.lockedUntil > now) {
      const remainingSec = Math.ceil((tracker.lockedUntil - now) / 1000);
      return res.status(429).json({
        error: "Too many failed attempts.",
        lockedOut: true,
        remainingSec,
      });
    }

    const { pin } = req.body;
    if (pin !== process.env.ADMIN_PIN) {
      tracker.count += 1;
      const remaining = Math.max(0, MAX_ATTEMPTS - tracker.count);

      if (tracker.count >= MAX_ATTEMPTS) {
        tracker.lockedUntil = now + LOCKOUT_MS;
        tracker.count = 0;
        attemptTracker.set(ip, tracker);
        return res.status(429).json({
          error: "Too many failed attempts. Locked out for 15 minutes.",
          lockedOut: true,
          remainingSec: LOCKOUT_MS / 1000,
        });
      }

      attemptTracker.set(ip, tracker);
      return res.status(401).json({
        error: "Wrong PIN",
        attemptsLeft: remaining,
      });
    }

    // Success — clear tracker
    attemptTracker.delete(ip);

    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET admin logs (protected)
router.get("/logs", requireAdmin, async (req, res) => {
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
