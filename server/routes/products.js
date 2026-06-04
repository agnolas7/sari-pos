const express = require("express");
const router = express.Router();
const { Product, ProductVariant, Category } = require("../models");

// GET all products with their variants and category
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { is_active: true },
      include: [
        { model: Category, as: "category" },
        {
          model: ProductVariant,
          as: "variants",
          where: { is_active: true },
          required: false,
        },
      ],
      order: [["name", "ASC"]],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product by id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: "category" },
        {
          model: ProductVariant,
          as: "variants",
          where: { is_active: true },
          required: false,
        },
      ],
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new product with variants
router.post("/", async (req, res) => {
  try {
    const { name, category_id, variants } = req.body;
    
    if (!name || !category_id) {
      return res.status(400).json({ error: "Product name and category_id are required" });
    }
    
    const product = await Product.create({ name, category_id });
    if (variants && variants.length > 0) {
      const variantsWithId = variants.map((v) => ({
        ...v,
        product_id: product.id,
      }));
      await ProductVariant.bulkCreate(variantsWithId);
    }
    res.json(product);
  } catch (err) {
    // Better error messages for common issues
    let message = err.message;
    if (err.name === "SequelizeUniqueConstraintError") {
      const field = err.fields ? Object.keys(err.fields)[0] : "field";
      message = `Duplicate barcode: "${err.errors?.[0]?.value}". Each variant must have a unique barcode or no barcode.`;
    } else if (err.name === "SequelizeValidationError") {
      message = err.errors.map((e) => e.message).join("; ");
    }
    res.status(500).json({ error: message });
  }
});

// PUT update a product
router.put("/:id", async (req, res) => {
  try {
    await Product.update(req.body, { where: { id: req.params.id } });
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a variant
router.put("/variant/:id", async (req, res) => {
  try {
    await ProductVariant.update(req.body, { where: { id: req.params.id } });
    res.json({ message: "Variant updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (soft delete) a product
router.delete("/:id", async (req, res) => {
  try {
    await Product.update(
      { is_active: false },
      { where: { id: req.params.id } },
    );
    res.json({ message: "Product removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a variant
router.delete("/variant/:id", async (req, res) => {
  try {
    await ProductVariant.update(
      { is_active: false },
      { where: { id: req.params.id } },
    );
    res.json({ message: "Variant removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add a variant to existing product
router.post("/variant", async (req, res) => {
  try {
    const variant = await ProductVariant.create(req.body);
    res.json(variant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET product by barcode
router.get("/barcode/:code", async (req, res) => {
  try {
    const variant = await ProductVariant.findOne({
      where: { barcode: req.params.code, is_active: true },
      include: [
        {
          model: Product,
          as: "product",
          include: [{ model: Category, as: "category" }],
        },
      ],
    });
    if (!variant) return res.status(404).json({ error: "Product not found" });
    res.json(variant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
