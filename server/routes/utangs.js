const express = require("express");
const router = express.Router();
const { Utang } = require("../models");

// GET all utangs
router.get("/", async (req, res) => {
  try {
    const utangs = await Utang.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(utangs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single utang
router.get("/:id", async (req, res) => {
  try {
    const utang = await Utang.findByPk(req.params.id);
    if (!utang) return res.status(404).json({ error: "Utang not found" });
    res.json(utang);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new utang
router.post("/", async (req, res) => {
  try {
    const { customer_name, amount, notes } = req.body;
    const utang = await Utang.create({
      customer_name,
      amount,
      notes,
      status: "pending",
    });
    res.json(utang);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT add payment to utang
router.put("/:id/pay", async (req, res) => {
  try {
    const { amount } = req.body;
    const utang = await Utang.findByPk(req.params.id);
    if (!utang) return res.status(404).json({ error: "Utang not found" });

    const newPaidAmount = parseFloat(utang.paid_amount) + parseFloat(amount);
    let status = "partially_paid";

    if (newPaidAmount >= utang.amount) {
      status = "paid";
    }

    await utang.update({
      paid_amount: newPaidAmount,
      status,
    });

    res.json(utang);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update utang notes
router.put("/:id", async (req, res) => {
  try {
    const { notes, customer_name } = req.body;
    await Utang.update(
      { notes, customer_name },
      { where: { id: req.params.id } },
    );
    const utang = await Utang.findByPk(req.params.id);
    res.json(utang);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE utang
router.delete("/:id", async (req, res) => {
  try {
    await Utang.destroy({ where: { id: req.params.id } });
    res.json({ message: "Utang deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
