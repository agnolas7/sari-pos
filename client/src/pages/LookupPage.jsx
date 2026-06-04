import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCategories,
  getProducts,
  getProductByBarcode,
} from "../services/api";
import useCartStore from "../store/cartStore";
import VariantPicker from "../components/pos/VariantPicker";
import BarcodeScanner from "../components/pos/BarcodeScanner";

function LookupPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const { items, addItem } = useCartStore();

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data));
    getProducts().then((res) => setProducts(res.data));
  }, []);

  const filtered = products.filter((p) => {
    const matchesCategory = selectedCategory
      ? p.category_id === selectedCategory
      : true;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBarcodeScan = useCallback(
    async (code) => {
      setShowScanner(false);
      try {
        const res = await getProductByBarcode(code);
        const variant = res.data;
        addItem(variant, variant.product.name);
        alert(
          `✅ Added: ${variant.product.name} ${variant.flavor || ""} ${variant.size || ""} — ₱${variant.price}`,
        );
      } catch {
        alert("❌ Product not found. Try searching manually.");
      }
    },
    [addItem],
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>🏪 Sari-Sari Store</h1>
        <button
          onClick={() => navigate("/cart")}
          style={{
            background: "#f97316",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            fontWeight: 600,
          }}
        >
          🛒 Cart ({items.length})
        </button>
      </div>

      {/* Search + Scan */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 16,
          }}
        />
        <button
          onClick={() => setShowScanner(true)}
          style={{
            padding: "10px 14px",
            background: "#f97316",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 20,
          }}
        >
          📷
        </button>
      </div>

      {/* Categories */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 8,
          marginBottom: 12,
        }}
      >
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            border: "none",
            whiteSpace: "nowrap",
            background: selectedCategory === null ? "#f97316" : "#e5e7eb",
            color: selectedCategory === null ? "white" : "#333",
            fontWeight: 600,
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "none",
              whiteSpace: "nowrap",
              background: selectedCategory === cat.id ? "#f97316" : "#e5e7eb",
              color: selectedCategory === cat.id ? "white" : "#333",
              fontWeight: 600,
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
        }}
      >
        {filtered.length === 0 && (
          <p
            style={{
              color: "#999",
              gridColumn: "span 2",
              textAlign: "center",
              marginTop: 32,
            }}
          >
            No products found.
          </p>
        )}
        {filtered.map((product) => (
          <button
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 14,
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {product.name}
            </div>
            <div style={{ fontSize: 13, color: "#888" }}>
              {product.category?.name}
            </div>
            <div style={{ fontSize: 13, color: "#f97316", marginTop: 4 }}>
              {product.variants?.length} variant
              {product.variants?.length !== 1 ? "s" : ""}
            </div>
          </button>
        ))}
      </div>

      {/* Variant Picker Modal */}
      {selectedProduct && (
        <VariantPicker
          product={selectedProduct}
          onAdd={(variant) => {
            addItem(variant, selectedProduct.name);
            setSelectedProduct(null);
          }}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

export default LookupPage;
