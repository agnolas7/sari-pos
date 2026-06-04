import { useState, useEffect } from "react";
import { getCategories, getProducts, adminLogin } from "../services/api";
import api from "../services/api";
import EditProductModal from "../components/admin/EditProductModal";
import Navbar from "../components/shared/Navbar";

function AdminPage() {
  const [pin, setPin] = useState("");
  const [token, setToken] = useState(localStorage.getItem("admin_token"));
  const [error, setError] = useState("");
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
        <h2 style={{ textAlign: "center", marginBottom: 24, fontSize: windowWidth < 640 ? 18 : 22 }}>
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
            background: "#f97316",
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
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: windowWidth < 640 ? "12px" : "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: windowWidth < 640 ? 18 : 22, fontWeight: 700 }}>⚙️ Admin Panel</h1>
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
          <input
            placeholder="Category name"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 15,
            }}
          />
        </div>
        <button
          onClick={handleAddCategory}
          style={{
            width: "100%",
            padding: 10,
            background: "#f97316",
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
            <span
              key={cat.id}
              style={{
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 14,
              }}
            >
              {cat.icon} {cat.name}
            </span>
          ))}
        </div>
      </div>

      {/* Add Product */}
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
          placeholder="Product name (e.g. Pancit Canton)"
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
                onChange={(e) => handleVariantChange(i, "size", e.target.value)}
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
            background: "#f97316",
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

      {/* Product list */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 16,
          border: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ fontWeight: 700, marginBottom: 12 }}>
          Products ({products.length})
        </h2>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: "#888" }}>
                {p.category?.name}
              </div>
              <div style={{ fontSize: 13, color: "#f97316", marginTop: 2 }}>
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
    </div>
  );
}

export default AdminPage;
