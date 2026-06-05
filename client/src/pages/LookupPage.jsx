import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, getProducts } from "../services/api";
import useCartStore from "../store/cartStore";
import VariantPicker from "../components/pos/VariantPicker";
import Navbar from "../components/shared/Navbar";

function LookupPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1000,
  );
  const [storeNote, setStoreNote] = useState(
    localStorage.getItem("store_note") || "",
  );
  const { items, addItem } = useCartStore();

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data));
    getProducts().then((res) => setProducts(res.data));
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filtered = products.filter((p) => {
    const matchesCategory = selectedCategory
      ? p.category_id === selectedCategory
      : true;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isMobile = windowWidth < 640;
  const cols = isMobile
    ? "repeat(2,1fr)"
    : windowWidth < 1024
      ? "repeat(3,1fr)"
      : "repeat(4,1fr)";

  return (
    <div style={{ minHeight: "100vh", background: "#f0eff7" }}>
      <Navbar />

      {/* Search & Filter Bar */}
      <div
        style={{
          background: "linear-gradient(180deg, #505081 0%, #393870 100%)",
          padding: isMobile ? "14px 12px" : "18px 32px",
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <form className="search-form" onSubmit={(e) => e.preventDefault()}>
          <button type="button" aria-label="search">
            <svg
              width="17"
              height="16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
            >
              <path
                d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                stroke="currentColor"
                strokeWidth="1.333"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </button>
          <input
            className="search-input"
            placeholder="Search products..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="reset"
            type="button"
            onClick={() => setSearch("")}
            aria-label="clear"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </form>

        <CategoryDropdown
          categories={categories}
          selected={selectedCategory}
          onChange={setSelectedCategory}
          isMobile={isMobile}
        />
      </div>

      {/* Announcement Banner */}
      {storeNote && (
        <div
          style={{
            background: "#fffbeb",
            borderBottom: "2px solid #fbbf24",
            padding: "11px 24px",
            fontSize: 14,
            fontWeight: 600,
            color: "#92400e",
            textAlign: "center",
            whiteSpace: "pre-wrap",
            letterSpacing: "0.01em",
          }}
        >
          📢 {storeNote}
        </div>
      )}

      {/* Product Grid */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: isMobile ? "16px 10px" : "28px 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#8886ac",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {filtered.length} Product{filtered.length !== 1 ? "s" : ""}
            {selectedCategory
              ? ` in ${categories.find((c) => c.id === selectedCategory)?.name ?? ""}`
              : ""}
          </span>
          {(search || selectedCategory) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory(null);
              }}
              style={{
                background: "none",
                border: "none",
                color: "#505081",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "72px 0",
              color: "#aaa",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 14 }}>🛒</div>
            <p style={{ fontSize: 17, margin: 0 }}>No products found.</p>
            <p style={{ fontSize: 13, color: "#bbb", marginTop: 6 }}>
              Try adjusting your search or category filter.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: cols,
              gap: isMobile ? 10 : 16,
            }}
          >
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart FAB */}
      <button
        onClick={() => navigate("/cart")}
        style={{
          position: "fixed",
          bottom: 24,
          right: 20,
          background: "linear-gradient(135deg, #505081 0%, #272757 100%)",
          color: "white",
          border: "none",
          borderRadius: 50,
          padding: items.length > 0 ? "14px 22px" : "15px 18px",
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
          boxShadow: "0 6px 28px rgba(80,80,129,0.50)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          zIndex: 50,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
          e.currentTarget.style.boxShadow = "0 10px 36px rgba(80,80,129,0.60)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "0 6px 28px rgba(80,80,129,0.50)";
        }}
      >
        <span style={{ fontSize: 20 }}>🛒</span>
        {items.length > 0 && (
          <>
            <span style={{ fontSize: 14 }}>Cart</span>
            <span
              style={{
                background: "#ef4444",
                color: "white",
                borderRadius: "50%",
                width: 22,
                height: 22,
                fontSize: 12,
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {items.length}
            </span>
          </>
        )}
      </button>

      {/* Variant Picker */}
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
    </div>
  );
}

function ProductCard({ product, onClick }) {
  const [hovered, setHovered] = useState(false);

  const prices = product.variants
    ?.filter((v) => v.is_active !== false)
    .map((v) => parseFloat(v.price))
    .filter((p) => !isNaN(p));
  const lowestPrice = prices?.length ? Math.min(...prices) : null;
  const hasMultiple = (prices?.length ?? 0) > 1;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? "linear-gradient(145deg, #ffffff 0%, #f5f4fc 100%)"
          : "white",
        border: hovered ? "1.5px solid #8886ac" : "1.5px solid #e5e3f0",
        borderRadius: 18,
        padding: 16,
        textAlign: "left",
        cursor: "pointer",
        boxShadow: hovered
          ? "0 10px 36px rgba(80,80,129,0.16)"
          : "0 2px 8px rgba(80,80,129,0.07)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minHeight: 110,
      }}
    >
      {/* Category pill */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "#ede9fe",
          color: "#5b4f9c",
          fontSize: 11,
          fontWeight: 700,
          padding: "3px 9px",
          borderRadius: 20,
          alignSelf: "flex-start",
          letterSpacing: "0.02em",
        }}
      >
        {product.category?.icon} {product.category?.name}
      </span>

      {/* Product name */}
      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          color: "#1e1b4b",
          lineHeight: 1.35,
          flex: 1,
        }}
      >
        {product.name}
      </div>

      {/* Footer: variants + price */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingTop: 8,
          borderTop: "1px solid #f0eefb",
          marginTop: "auto",
        }}
      >
        <span style={{ fontSize: 11, color: "#a09ec0", fontWeight: 600 }}>
          {product.variants?.length} variant
          {product.variants?.length !== 1 ? "s" : ""}
        </span>
        {lowestPrice !== null && (
          <span
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: hovered ? "#3d3c5f" : "#505081",
              transition: "color 0.2s",
            }}
          >
            {hasMultiple ? "from " : ""}₱{lowestPrice.toFixed(2)}
          </span>
        )}
      </div>
    </button>
  );
}

function CategoryDropdown({ categories, selected, onChange, isMobile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selectedCat = categories.find((c) => c.id === selected) ?? null;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options = [
    { id: null, icon: "🏪", name: "All Categories" },
    ...categories,
  ];

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        minWidth: isMobile ? "100%" : 200,
        zIndex: 20,
      }}
    >
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "11px 16px",
          borderRadius: open ? "14px 14px 0 0" : 14,
          border: open
            ? "1.5px solid rgba(255,255,255,0.55)"
            : "1.5px solid rgba(255,255,255,0.22)",
          background: open
            ? "rgba(255,255,255,0.22)"
            : "rgba(255,255,255,0.14)",
          color: "white",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          transition: "all 0.25s ease",
          outline: "none",
          whiteSpace: "nowrap",
          boxShadow: open ? "0 0 0 2px rgba(255,255,255,0.12)" : "none",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 17 }}>
            {selectedCat ? selectedCat.icon : "🏪"}
          </span>
          <span>{selectedCat ? selectedCat.name : "All Categories"}</span>
        </span>
        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: "transform 0.3s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            opacity: 0.8,
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "linear-gradient(160deg, #2e2d5a 0%, #1a1940 100%)",
            border: "1.5px solid rgba(255,255,255,0.18)",
            borderTop: "none",
            borderRadius: "0 0 16px 16px",
            overflow: "hidden",
            boxShadow: "0 24px 48px rgba(15,14,71,0.55)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            animation: "dropdownSlide 0.22s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {options.map((cat, i) => {
            const isSelected = cat.id === selected;
            return (
              <button
                key={cat.id ?? "all"}
                type="button"
                onClick={() => {
                  onChange(cat.id);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 16px",
                  background: isSelected
                    ? "rgba(134,134,172,0.25)"
                    : "transparent",
                  border: "none",
                  borderBottom:
                    i < options.length - 1
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "none",
                  color: isSelected ? "white" : "rgba(255,255,255,0.75)",
                  fontSize: 14,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: isSelected
                      ? "rgba(255,255,255,0.18)"
                      : "rgba(255,255,255,0.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                >
                  {cat.icon}
                </span>
                <span style={{ flex: 1 }}>{cat.name}</span>
                {isSelected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0.9 }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LookupPage;
