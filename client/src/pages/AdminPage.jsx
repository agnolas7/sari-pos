import { useState, useEffect } from "react";
import {
  getCategories,
  getProducts,
  adminLogin,
  getSetting,
  updateSetting,
  getAttendants,
  createAttendant,
  updateAttendant,
  deleteAttendant,
} from "../services/api";
import api from "../services/api";
import EditProductModal from "../components/admin/EditProductModal";
import Navbar from "../components/shared/Navbar";
import {
  importProductsFromExcel,
  downloadExcelTemplate,
} from "../utils/excelImport";

const PREDEFINED_CATEGORIES = [
  { name: "Instant Noodles", icon: "🍜" },
  { name: "Snacks", icon: "🍪" },
  { name: "Beverages", icon: "🥤" },
  { name: "Canned Goods", icon: "🥫" },
  { name: "Condiments", icon: "🍯" },
  { name: "Bread & Pastry", icon: "🍞" },
  { name: "Dairy", icon: "🥛" },
  { name: "Frozen", icon: "🧊" },
  { name: "Personal Care", icon: "🧼" },
  { name: "Household", icon: "🧹" },
  { name: "Candy & Chocolates", icon: "🍫" },
  { name: "Coffee & Tea", icon: "☕" },
  { name: "Tobacco", icon: "🚬" },
  { name: "Rice & Grains", icon: "🌾" },
  { name: "Fruits & Vegetables", icon: "🥬" },
];

function AdminPage() {
  const [pin, setPin] = useState("");
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) return null;
    // Validate expiry client-side
    try {
      const payload = JSON.parse(atob(t.split(".")[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("admin_token");
        return null;
      }
    } catch {
      localStorage.removeItem("admin_token");
      return null;
    }
    return t;
  });
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [lockoutSec, setLockoutSec] = useState(0);
  const [importMessage, setImportMessage] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1000,
  );

  // New category form
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("");

  // New product form
  const [prodName, setProdName] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [variants, setVariants] = useState([
    { flavor: "", size: "", price: "" },
  ]);

  // Search products
  const [searchQuery, setSearchQuery] = useState("");

  // Store note
  const [storeNote, setStoreNote] = useState("");

  // Attendants
  const [attendants, setAttendants] = useState([]);
  const [newAttendantName, setNewAttendantName] = useState("");
  const [newAttendantEmoji, setNewAttendantEmoji] = useState("🙂");
  const [newAttendantColor, setNewAttendantColor] = useState("#505081");
  const [editingAttendant, setEditingAttendant] = useState(null);

  // Selected products for bulk delete
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  useEffect(() => {
    if (token) {
      loadData();
      getSetting("store_note").then((res) =>
        setStoreNote(res.data.value || ""),
      );
      getAttendants().then((res) => setAttendants(res.data)).catch(() => {});
    }
  }, [token]);

  // Listen for global 401 event from axios interceptor
  useEffect(() => {
    const handler = () => {
      setToken(null);
      setError("Session expired. Please log in again.");
    };
    window.addEventListener("admin-unauthorized", handler);
    return () => window.removeEventListener("admin-unauthorized", handler);
  }, []);

  // Lockout countdown
  useEffect(() => {
    if (lockoutSec <= 0) return;
    const t = setTimeout(() => setLockoutSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [lockoutSec]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadData = () => {
    getCategories().then((res) => setCategories(res.data));
    getProducts().then((res) => setProducts(res.data));
  };

  const handleLogin = async () => {
    if (lockoutSec > 0) return;
    if (!pin.trim()) return;
    try {
      const res = await adminLogin(pin);
      localStorage.setItem("admin_token", res.data.token);
      setToken(res.data.token);
      setError("");
      setAttemptsLeft(5);
      setPin("");
    } catch (err) {
      const data = err.response?.data;
      if (data?.lockedOut) {
        setLockoutSec(data.remainingSec ?? 900);
        setError("Too many failed attempts.");
        setPin("");
      } else {
        const left = data?.attemptsLeft ?? attemptsLeft - 1;
        setAttemptsLeft(left);
        setError(`Wrong PIN. ${left} attempt${left !== 1 ? "s" : ""} left.`);
        setPin("");
      }
    }
  };

  const handleAddCategory = async () => {
    if (!catName) return alert("Please enter a category name");
    await api.post("/categories", {
      name: catName,
      icon: catIcon,
      sort_order: categories.length + 1,
    });
    setCatName("");
    setCatIcon("");
    loadData();
  };

  const handleDeleteCategory = async (catId) => {
    if (window.confirm("Delete this category?")) {
      await api.delete(`/categories/${catId}`);
      loadData();
    }
  };

  const handleAddVariant = () => {
    setVariants([...variants, { flavor: "", size: "", price: "" }]);
  };

  const handleVariantChange = (index, field, value) => {
    const updated = variants.map((v, i) =>
      i === index ? { ...v, [field]: value } : v,
    );
    setVariants(updated);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    const filteredProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    if (
      !window.confirm(
        `Delete ${selectedProducts.size} selected product(s)? This cannot be undone.`,
      )
    )
      return;

    try {
      for (const productId of selectedProducts) {
        await api.delete(`/products/${productId}`);
      }
      setSelectedProducts(new Set());
      loadData();
      alert(`✅ Deleted ${selectedProducts.size} product(s)`);
    } catch (err) {
      alert(`❌ Error deleting products: ${err.message}`);
    }
  };

  const handleAddProduct = async () => {
    if (!prodName) return alert("Please enter a product name");
    if (!prodCategoryId) return alert("Please select a category");
    const validVariants = variants.filter((v) => v.price);
    if (validVariants.length === 0)
      return alert("Please add at least one variant with a price");
    await api.post("/products", {
      name: prodName,
      category_id: prodCategoryId,
      variants: validVariants,
    });
    setProdName("");
    setProdCategoryId("");
    setVariants([{ flavor: "", size: "", price: "" }]);
    loadData();
    alert("Product added!");
  };

  const handleExcelImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportMessage("");

    try {
      const result = await importProductsFromExcel(file);
      if (result.success) {
        setImportMessage(
          `✅ Imported ${result.imported}/${result.total} products successfully!`,
        );
        loadData();
        e.target.value = ""; // Reset file input
      } else {
        setImportMessage(`⚠️ No products were imported.`);
      }

      if (result.errors.length > 0) {
        console.log("Import errors:", result.errors);
        setImportMessage(
          (prev) => prev + `\n\nErrors:\n${result.errors.join("\n")}`,
        );
      }
    } catch (err) {
      setImportMessage(`❌ ${err.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  // PIN screen
  if (!token) {
    const isLocked = lockoutSec > 0;
    const mins = Math.floor(lockoutSec / 60);
    const secs = lockoutSec % 60;

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1e1b4b 0%, #272757 50%, #3b3278 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        {/* Decorative bubbles */}
        <div style={{ position: "fixed", top: "8%", left: "10%", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", bottom: "12%", right: "8%", width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", top: "40%", right: "15%", width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

        <div
          style={{
            width: "100%",
            maxWidth: 380,
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1.5px solid rgba(255,255,255,0.12)",
            borderRadius: 28,
            padding: "36px 28px 32px",
            boxShadow: "0 40px 80px rgba(0,0,0,0.40)",
          }}
        >
          {/* Icon */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 20,
                background: isLocked ? "rgba(239,68,68,0.20)" : "rgba(255,255,255,0.12)",
                border: `2px solid ${isLocked ? "rgba(239,68,68,0.40)" : "rgba(255,255,255,0.20)"}`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                marginBottom: 16,
              }}
            >
              {isLocked ? "🔒" : "🔐"}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "white", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              Admin Access
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", margin: 0 }}>
              {isLocked ? "Account temporarily locked" : "Enter your PIN to continue"}
            </p>
          </div>

          {isLocked ? (
            <div
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1.5px solid rgba(239,68,68,0.30)",
                borderRadius: 16,
                padding: "20px 16px",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 900, color: "#fca5a5", letterSpacing: 2, marginBottom: 6 }}>
                {mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `${secs}s`}
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", margin: 0 }}>
                Too many failed attempts. Please wait.
              </p>
            </div>
          ) : (
            <>
              {/* PIN dots display */}
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.30)",
                      background: i < pin.length ? "white" : "transparent",
                      transition: "background 0.15s",
                    }}
                  />
                ))}
              </div>

              <input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                maxLength={20}
                autoFocus
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: error ? "1.5px solid rgba(239,68,68,0.60)" : "1.5px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  fontSize: 18,
                  textAlign: "center",
                  letterSpacing: 8,
                  marginBottom: error ? 10 : 16,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: 10,
                    padding: "8px 12px",
                    marginBottom: 14,
                  }}
                >
                  <span style={{ fontSize: 15 }}>⚠️</span>
                  <span style={{ fontSize: 13, color: "#fca5a5", fontWeight: 600 }}>{error}</span>
                </div>
              )}

              {/* Attempt warning dots */}
              {attemptsLeft < 5 && attemptsLeft > 0 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 14 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: i < attemptsLeft ? "#fbbf24" : "rgba(255,255,255,0.15)",
                        transition: "background 0.2s",
                      }}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={!pin.trim()}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: pin.trim()
                    ? "linear-gradient(135deg, #6d5fbc 0%, #505081 100%)"
                    : "rgba(255,255,255,0.08)",
                  color: pin.trim() ? "white" : "rgba(255,255,255,0.30)",
                  border: "none",
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: pin.trim() ? "pointer" : "default",
                  transition: "all 0.2s",
                  letterSpacing: "0.02em",
                }}
              >
                Unlock
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: windowWidth < 640 ? "12px" : "24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1
            style={{ fontSize: windowWidth < 640 ? 18 : 22, fontWeight: 700 }}
          >
            ⚙️ Admin Panel
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem("admin_token");
              setToken(null);
            }}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
            }}
          >
            Logout
          </button>
        </div>

        {/* Attendants Management */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ fontWeight: 700, marginBottom: 4 }}>👥 Attendants</h2>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 14px" }}>
            Add profiles for each store attendant so they can track their own sales.
          </p>

          {/* Existing attendants */}
          {attendants.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {attendants.map((a) =>
                editingAttendant?.id === a.id ? (
                  <div
                    key={a.id}
                    style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: "#f7f6fd", borderRadius: 10, padding: 10 }}
                  >
                    <input
                      value={editingAttendant.emoji}
                      onChange={(e) => setEditingAttendant((prev) => ({ ...prev, emoji: e.target.value }))}
                      style={{ width: 52, textAlign: "center", fontSize: 20, borderRadius: 8, border: "1px solid #ddd", padding: "6px 4px" }}
                    />
                    <input
                      value={editingAttendant.name}
                      onChange={(e) => setEditingAttendant((prev) => ({ ...prev, name: e.target.value }))}
                      style={{ flex: 1, minWidth: 120, padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
                    />
                    <input
                      type="color"
                      value={editingAttendant.color}
                      onChange={(e) => setEditingAttendant((prev) => ({ ...prev, color: e.target.value }))}
                      style={{ width: 38, height: 36, borderRadius: 8, border: "1px solid #ddd", padding: 2, cursor: "pointer" }}
                    />
                    <button
                      onClick={async () => {
                        await updateAttendant(editingAttendant.id, editingAttendant);
                        const res = await getAttendants();
                        setAttendants(res.data);
                        setEditingAttendant(null);
                      }}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#22c55e", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >Save</button>
                    <button
                      onClick={() => setEditingAttendant(null)}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >Cancel</button>
                  </div>
                ) : (
                  <div
                    key={a.id}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "1px solid #f0eefb", background: "#faf9ff" }}
                  >
                    <div
                      style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: `linear-gradient(135deg, ${a.color} 0%, ${a.color}bb 100%)`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                      }}
                    >{a.emoji}</div>
                    <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: "#1e1b4b" }}>{a.name}</span>
                    <button
                      onClick={() => setEditingAttendant({ ...a })}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #d1cee8", background: "white", color: "#505081", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                    >✏️ Edit</button>
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Remove ${a.name}?`)) return;
                        await deleteAttendant(a.id);
                        const res = await getAttendants();
                        setAttendants(res.data);
                      }}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#ef4444", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                    >✕</button>
                  </div>
                ),
              )}
            </div>
          )}

          {/* Add new attendant */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input
              placeholder="Emoji"
              value={newAttendantEmoji}
              onChange={(e) => setNewAttendantEmoji(e.target.value)}
              style={{ width: 52, textAlign: "center", fontSize: 20, borderRadius: 8, border: "1px solid #ddd", padding: "8px 4px" }}
            />
            <input
              placeholder="Name (e.g. Ate Nora)"
              value={newAttendantName}
              onChange={(e) => setNewAttendantName(e.target.value)}
              style={{ flex: 1, minWidth: 140, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
            />
            <input
              type="color"
              value={newAttendantColor}
              onChange={(e) => setNewAttendantColor(e.target.value)}
              title="Pick a color"
              style={{ width: 38, height: 36, borderRadius: 8, border: "1px solid #ddd", padding: 2, cursor: "pointer" }}
            />
            <button
              onClick={async () => {
                if (!newAttendantName.trim()) return;
                await createAttendant({ name: newAttendantName.trim(), emoji: newAttendantEmoji, color: newAttendantColor });
                const res = await getAttendants();
                setAttendants(res.data);
                setNewAttendantName("");
                setNewAttendantEmoji("🙂");
                setNewAttendantColor("#505081");
              }}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#505081", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >+ Add</button>
          </div>
        </div>

        {/* Store Note Editor */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ fontWeight: 700, marginBottom: 12 }}>
            📢 Store Announcement
          </h2>
          <textarea
            placeholder="Add a note for customers (e.g., lahat ng malaking chichirya 30, lahat ng maliit 10, lahat ng tinapay 10)"
            value={storeNote}
            onChange={(e) => setStoreNote(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
              minHeight: 80,
              fontFamily: "inherit",
              marginBottom: 8,
            }}
          />
          <button
            onClick={async () => {
              await updateSetting("store_note", storeNote);
              alert("✅ Announcement saved!");
            }}
            style={{
              width: "100%",
              padding: 10,
              background: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            💾 Save Announcement
          </button>
        </div>

        {/* Add Product - MOVED TO TOP */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Add Product</h2>

          <input
            placeholder="Product name"
            value={prodName}
            onChange={(e) => setProdName(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 15,
              marginBottom: 8,
            }}
          />

          <select
            value={prodCategoryId}
            onChange={(e) => setProdCategoryId(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 15,
              marginBottom: 12,
            }}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          {/* Variants */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              Variants (size, flavor, price)
            </div>
            {variants.map((v, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <input
                  placeholder="Flavor"
                  value={v.flavor}
                  onChange={(e) =>
                    handleVariantChange(i, "flavor", e.target.value)
                  }
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    fontSize: 14,
                  }}
                />
                <input
                  placeholder="Size"
                  value={v.size}
                  onChange={(e) =>
                    handleVariantChange(i, "size", e.target.value)
                  }
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    fontSize: 14,
                  }}
                />
                <input
                  placeholder="₱ Price"
                  type="number"
                  value={v.price}
                  onChange={(e) =>
                    handleVariantChange(i, "price", e.target.value)
                  }
                  style={{
                    width: 80,
                    padding: "8px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    fontSize: 14,
                  }}
                />
                {variants.length > 1 && (
                  <button
                    onClick={() => handleRemoveVariant(i)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      fontSize: 18,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddVariant}
              style={{
                background: "none",
                border: "1px dashed #ddd",
                borderRadius: 8,
                padding: "6px 12px",
                color: "#888",
                width: "100%",
                marginTop: 4,
              }}
            >
              + Add another variant
            </button>
          </div>

          <button
            onClick={handleAddProduct}
            style={{
              width: "100%",
              padding: 12,
              background: "#505081",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 16,
              marginTop: 8,
            }}
          >
            Save Product
          </button>
        </div>

        {/* Add Category */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Add Category</h2>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              placeholder="Type category name..."
              list="categoryList"
              value={catName}
              onChange={(e) => {
                setCatName(e.target.value);
                // Auto-fill icon if it matches a predefined category
                const match = PREDEFINED_CATEGORIES.find(
                  (c) => c.name === e.target.value,
                );
                if (match) {
                  setCatIcon(match.icon);
                }
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 15,
              }}
            />
            <datalist id="categoryList">
              {PREDEFINED_CATEGORIES.map((cat) => (
                <option
                  key={cat.name}
                  value={cat.name}
                  label={`${cat.icon} ${cat.name}`}
                />
              ))}
            </datalist>
            <input
              type="text"
              placeholder="Icon (emoji)"
              value={catIcon}
              onChange={(e) => setCatIcon(e.target.value)}
              style={{
                width: 70,
                padding: "8px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 20,
                textAlign: "center",
              }}
            />
          </div>
          <button
            onClick={handleAddCategory}
            style={{
              width: "100%",
              padding: 10,
              background: "#505081",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Add Category
          </button>

          {/* Category list */}
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}
          >
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: 20,
                  padding: "4px 12px",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>
                  {cat.icon} {cat.name}
                </span>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: 16,
                    padding: 0,
                    marginLeft: 4,
                  }}
                  title="Delete category"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Excel Import */}
        <div
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            border: "1px solid #1d4ed8",
            color: "white",
          }}
        >
          <h2 style={{ fontWeight: 700, marginBottom: 12, color: "white" }}>
            📊 Bulk Import from Excel
          </h2>
          <p style={{ fontSize: 13, marginBottom: 12, opacity: 0.9 }}>
            Import multiple products and variants at once using an Excel file.
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <label
              style={{
                flex: 1,
                minWidth: 200,
                padding: 12,
                background: "rgba(255,255,255,0.2)",
                borderRadius: 8,
                border: "2px dashed rgba(255,255,255,0.5)",
                textAlign: "center",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }}
            >
              📁 Choose Excel File
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelImport}
                disabled={importLoading}
                style={{ display: "none" }}
              />
            </label>
            <button
              onClick={downloadExcelTemplate}
              style={{
                padding: 12,
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: 8,
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }}
            >
              📥 Download Template
            </button>
          </div>

          {importLoading && (
            <p style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
              ⏳ Importing... please wait
            </p>
          )}

          {importMessage && (
            <p
              style={{
                marginTop: 12,
                padding: 10,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 6,
                fontSize: 13,
                whiteSpace: "pre-wrap",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              {importMessage}
            </p>
          )}
        </div>

        {/* Product list with Search */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 16,
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h2 style={{ fontWeight: 700, margin: 0 }}>
              Products (
              {
                products.filter(
                  (p) =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.category?.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                ).length
              }
              )
            </h2>
            {selectedProducts.size > 0 && (
              <button
                onClick={handleBulkDelete}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                🗑️ Delete ({selectedProducts.size})
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
              marginBottom: 12,
            }}
          />

          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 12 }}
          >
            <input
              type="checkbox"
              checked={
                selectedProducts.size > 0 &&
                selectedProducts.size ===
                  products.filter(
                    (p) =>
                      p.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      p.category?.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                  ).length &&
                products.filter(
                  (p) =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.category?.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                ).length > 0
              }
              onChange={handleSelectAll}
              style={{ marginRight: 8, cursor: "pointer" }}
            />
            <label style={{ fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Select All Visible
            </label>
          </div>

          {products
            .filter(
              (p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()),
            )
            .map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #f3f4f6",
                  background: selectedProducts.has(p.id)
                    ? "#fef3c7"
                    : "transparent",
                  paddingLeft: 8,
                  borderRadius: 4,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.has(p.id)}
                  onChange={() => handleSelectProduct(p.id)}
                  style={{
                    marginRight: 12,
                    cursor: "pointer",
                    width: 16,
                    height: 16,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>
                    {p.category?.name}
                  </div>
                  <div style={{ fontSize: 13, color: "#505081", marginTop: 2 }}>
                    {p.variants
                      ?.map(
                        (v) =>
                          `${[v.flavor, v.size].filter(Boolean).join(" ")} ₱${v.price}`,
                      )
                      .join(" · ")}
                  </div>
                </div>
                <button
                  onClick={() => setEditingProduct(p)}
                  style={{
                    background: "#f3f4f6",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontWeight: 600,
                    fontSize: 13,
                    marginLeft: 8,
                  }}
                >
                  Edit
                </button>
              </div>
            ))}
        </div>

        {/* Edit modal */}
        {editingProduct && (
          <EditProductModal
            product={editingProduct}
            categories={categories}
            onClose={() => setEditingProduct(null)}
            onSave={() => {
              loadData();
              setEditingProduct(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default AdminPage;
