const express = require("express");
const router = express.Router();
const StoreSettings = require("../models/StoreSettings");

// GET /api/settings/:key
router.get("/:key", async (req, res) => {
  try {
    const setting = await StoreSettings.findOne({
      where: { key: req.params.key },
    });
    res.json({ key: req.params.key, value: setting ? setting.value : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings/:key
router.put("/:key", async (req, res) => {
  try {
    const { value } = req.body;
    const [setting, created] = await StoreSettings.findOrCreate({
      where: { key: req.params.key },
      defaults: { value },
    });
    if (!created) {
      setting.value = value;
      await setting.save();
    }
    res.json({ key: req.params.key, value: setting.value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
