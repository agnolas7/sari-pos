import { useState, useEffect } from "react";
import { getCategories, getProducts, adminLogin } from "../services/api";
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
  const [token, setToken] = useState(localStorage.getItem("admin_token"));
  const [error, setError] = useState("");
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
  const [storeNote, setStoreNote] = useState(
    localStorage.getItem("store_note") || "",
  );

  // Selected products for bulk delete
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

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
    try {
      const res = await adminLogin(pin);
      localStorage.setItem("admin_token", res.data.token);
      setToken(res.data.token);
      setError("");
    } catch {
      setError("Wrong PIN. Try again.");
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
    return (
      <div
        style={{
          maxWidth: 320,
          margin: windowWidth < 640 ? "60px auto" : "80px auto",
          padding: 24,
          background: "white",
          borderRadius: 16,
          boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 24,
            fontSize: windowWidth < 640 ? 18 : 22,
          }}
        >
          🔐 Admin Login
        </h2>
        <input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 18,
            textAlign: "center",
            marginBottom: 12,
            letterSpacing: 8,
          }}
        />
        {error && (
          <p style={{ color: "#ef4444", textAlign: "center", marginBottom: 8 }}>
            {error}
          </p>
        )}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: 12,
            background: "#505081",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          Login
        </button>
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
            onClick={() => {
              localStorage.setItem("store_note", storeNote);
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
