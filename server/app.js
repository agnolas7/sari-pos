const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { sequelize } = require("./models");
const seedCategories = require("./seeds/categories");
const seedSettings = require("./seeds/settings");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/categories", require("./routes/categories"));
app.use("/api/products", require("./routes/products"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/utangs", require("./routes/utangs"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/attendants", require("./routes/attendants"));
app.use("/api/sales", require("./routes/sales"));

app.get("/", (req, res) => {
  res.json({
    message: "🏪 Sari-POS API Server",
    status: "running",
    apiUrl: "http://localhost:5000/api",
    clientUrl: "http://localhost:5173",
  });
});

app.get("/api", (req, res) => {
  res.json({ message: "Sari-POS API is running 🏪" });
});

const PORT = process.env.PORT || 5000;

const syncOptions = process.env.NODE_ENV === "production" ? {} : { alter: true };

sequelize
  .sync(syncOptions)
  .then(() => {
    // Seed default categories
    seedCategories();
    seedSettings();

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`✅ Database synced`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err.message);
  });
