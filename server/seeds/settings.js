const { StoreSettings } = require("../models");

const defaultAnnouncement =
  "🍿 CHICHIRYA — Malaki ₱30 | Piling brands lang (Pillows, Loaded, Sponge, etc.) — double check muna\n" +
  "🍪 BISCUITS — ₱9 each\n" +
  "🍬 CANDY — ₱4–₱5 each | Lollipop, Yakee, Pintoora, Snowbear — ₱3–₱5\n" +
  "🍞 TINAPAY — ₱7 each | Pilson ₱25 | Tatluhan (malaki) ₱14 | Anim na laman ₱15\n" +
  "🥤 SOFTDRINKS / MAGNOLIA (bote) — ₱12\n" +
  "🧴 Shampoo ₱8 | Conditioner ₱10\n" +
  "💡 Hindi masearch sa name? Try the brand name, or the other way around.";

const seedSettings = async () => {
  try {
    const existing = await StoreSettings.findOne({
      where: { key: "store_note" },
    });

    if (!existing) {
      await StoreSettings.create({
        key: "store_note",
        value: defaultAnnouncement,
      });
      console.log("✅ Default store announcement seeded!");
    } else {
      console.log("✓ Store announcement already exists. Skipping seed.");
    }
  } catch (err) {
    console.error("❌ Error seeding store settings:", err.message);
  }
};

module.exports = seedSettings;
