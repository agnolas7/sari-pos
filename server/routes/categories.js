const express = require("express");
const router = express.Router();
const { Category } = require("../models");

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["sort_order", "ASC"]],
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new category
router.post("/", async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a category
router.put("/:id", async (req, res) => {
  try {
    await Category.update(req.body, { where: { id: req.params.id } });
    res.json({ message: "Category updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a category
router.delete("/:id", async (req, res) => {
  try {
    await Category.destroy({ where: { id: req.params.id } });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
