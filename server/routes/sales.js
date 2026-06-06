const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Sale = require("../models/Sale");
const SaleItem = require("../models/SaleItem");
const Attendant = require("../models/Attendant");
const sequelize = require("../config/database");

// POST record a sale
router.post("/", async (req, res) => {
  try {
    const { attendant_id, total, item_count, items } = req.body;
    if (!attendant_id || !total)
      return res.status(400).json({ error: "attendant_id and total required" });

    const sale = await Sale.create({ attendant_id, total, item_count });

    if (Array.isArray(items) && items.length > 0) {
      const saleItems = items.map((item) => ({
        sale_id: sale.id,
        variant_id: item.variantId ?? null,
        product_name: item.productName,
        variant_label:
          [item.size, item.flavor].filter(Boolean).join(" / ") || null,
        price: item.price,
        quantity: item.quantity,
      }));
      await SaleItem.bulkCreate(saleItems);
    }

    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET leaderboard — total sales per attendant (all time or by period)
router.get("/leaderboard", async (req, res) => {
  try {
    const { period } = req.query; // "today" | "week" | "month" | "all"
    let where = {};
    const now = new Date();
    if (period === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      where.createdAt = { [Op.gte]: start };
    } else if (period === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      where.createdAt = { [Op.gte]: start };
    } else if (period === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      where.createdAt = { [Op.gte]: start };
    }

    const rows = await Sale.findAll({
      where,
      attributes: [
        "attendant_id",
        [sequelize.fn("SUM", sequelize.col("total")), "total_sales"],
        [sequelize.fn("SUM", sequelize.col("item_count")), "total_items"],
        [sequelize.fn("COUNT", sequelize.col("Sale.id")), "transaction_count"],
      ],
      group: ["attendant_id"],
      include: [
        {
          model: Attendant,
          as: "attendant",
          attributes: ["id", "name", "emoji", "color"],
        },
      ],
      order: [[sequelize.fn("SUM", sequelize.col("total")), "DESC"]],
    });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET recent sales for one attendant
router.get("/attendant/:id", async (req, res) => {
  try {
    const sales = await Sale.findAll({
      where: { attendant_id: req.params.id },
      order: [["createdAt", "DESC"]],
      limit: 20,
    });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all sales history with optional date filtering and pagination
router.get("/history", async (req, res) => {
  try {
    const { from, to, page = 1, limit = 50 } = req.query;
    const where = {};

    if (from || to) {
      where.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        where.createdAt[Op.gte] = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = toDate;
      }
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Sale.findAndCountAll({
      where,
      include: [
        {
          model: Attendant,
          as: "attendant",
          attributes: ["id", "name", "emoji", "color"],
        },
        {
          model: SaleItem,
          as: "items",
          attributes: [
            "id",
            "variant_id",
            "product_name",
            "variant_label",
            "price",
            "quantity",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
