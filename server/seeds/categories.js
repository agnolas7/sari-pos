// Seeding script for common sari-sari store categories
const { Category } = require("../models");

const defaultCategories = [
  { name: "Instant Noodles", icon: "🍜", sort_order: 1 },
  { name: "Snacks", icon: "🍪", sort_order: 2 },
  { name: "Beverages", icon: "🥤", sort_order: 3 },
  { name: "Canned Goods", icon: "🥫", sort_order: 4 },
  { name: "Condiments", icon: "🍯", sort_order: 5 },
  { name: "Bread & Pastry", icon: "🍞", sort_order: 6 },
  { name: "Dairy", icon: "🥛", sort_order: 7 },
  { name: "Frozen", icon: "🧊", sort_order: 8 },
  { name: "Personal Care", icon: "🧼", sort_order: 9 },
  { name: "Household", icon: "🧹", sort_order: 10 },
  { name: "Candy & Chocolates", icon: "🍫", sort_order: 11 },
  { name: "Coffee & Tea", icon: "☕", sort_order: 12 },
  { name: "Tobacco", icon: "🚬", sort_order: 13 },
  { name: "Rice & Grains", icon: "🌾", sort_order: 14 },
  { name: "Fruits & Vegetables", icon: "🥬", sort_order: 15 },
];

const seedCategories = async () => {
  try {
    // Check if categories already exist
    const count = await Category.count();

    if (count === 0) {
      await Category.bulkCreate(defaultCategories);
      console.log("✅ Categories seeded successfully!");
    } else {
      console.log("✓ Categories already exist. Skipping seed.");
    }
  } catch (err) {
    console.error("❌ Error seeding categories:", err.message);
  }
};

module.exports = seedCategories;
