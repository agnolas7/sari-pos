import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, getProducts, getSetting } from "../services/api";
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
  const [storeNote, setStoreNote] = useState("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { items, addItem } = useCartStore();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  const [toast, setToast] = useState(null);
  const [cartBounce, setCartBounce] = useState(false);
  const toastTimerRef = useRef(null);

  const showToast = (name) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(name);
    toastTimerRef.current = setTimeout(() => setToast(null), 2200);
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 400);
  };

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data));
    getProducts().then((res) => setProducts(res.data));
    getSetting("store_note").then((res) => setStoreNote(res.data.value || ""));
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

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

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

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          {storeNote && (
            <button
              onClick={() => setShowAnnouncement(true)}
              className="boton-elegante"
              style={{
                padding: "10px 16px",
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              📢 Price Guide
            </button>
          )}
          <button
            onClick={() => setShowHelp(true)}
            className="boton-elegante"
            style={{ padding: "10px 16px", fontSize: 13, whiteSpace: "nowrap" }}
          >
            ❓ How to Use
          </button>
        </div>
      </div>

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
                setCurrentPage(1);
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
            {paginated.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
              marginTop: 32,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "1.5px solid #d1cee8",
                background: currentPage === 1 ? "#f5f4fc" : "white",
                color: currentPage === 1 ? "#b0aed0" : "#505081",
                fontWeight: 700,
                fontSize: 13,
                cursor: currentPage === 1 ? "default" : "pointer",
                transition: "all 0.18s",
              }}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1,
              )
              .reduce((acc, page, idx, arr) => {
                if (idx > 0 && page - arr[idx - 1] > 1) {
                  acc.push("...");
                }
                acc.push(page);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    style={{ color: "#a09ec0", fontSize: 13, padding: "0 2px" }}
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border:
                        currentPage === item
                          ? "1.5px solid #505081"
                          : "1.5px solid #d1cee8",
                      background:
                        currentPage === item
                          ? "linear-gradient(135deg, #505081 0%, #272757 100%)"
                          : "white",
                      color: currentPage === item ? "white" : "#505081",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.18s",
                    }}
                  >
                    {item}
                  </button>
                ),
              )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "1.5px solid #d1cee8",
                background: currentPage === totalPages ? "#f5f4fc" : "white",
                color: currentPage === totalPages ? "#b0aed0" : "#505081",
                fontWeight: 700,
                fontSize: 13,
                cursor: currentPage === totalPages ? "default" : "pointer",
                transition: "all 0.18s",
              }}
            >
              Next →
            </button>
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
          animation: cartBounce
            ? "cartBump 0.38s cubic-bezier(0.34,1.56,0.64,1)"
            : "none",
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
            showToast(selectedProduct.name);
            setSelectedProduct(null);
          }}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Add-to-cart Toast */}
      <div
        style={{
          position: "fixed",
          bottom: 90,
          right: 20,
          zIndex: 60,
          pointerEvents: "none",
          transition:
            "opacity 0.3s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          opacity: toast ? 1 : 0,
          transform: toast
            ? "translateY(0) scale(1)"
            : "translateY(12px) scale(0.95)",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #2e2d5a 0%, #1a1940 100%)",
            color: "white",
            borderRadius: 14,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow:
              "0 8px 32px rgba(8,7,40,0.40), 0 0 0 1px rgba(255,255,255,0.08)",
            maxWidth: 220,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>✅</span>
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: 1,
              }}
            >
              Added to cart
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {toast}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cartBump {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.22); }
          70%  { transform: scale(0.93); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Announcement Modal */}
      {showAnnouncement && (
        <InfoModal
          title="Price Guide"
          emoji="📢"
          accent="#3b3278"
          accentEnd="#1e1b4b"
          onClose={() => setShowAnnouncement(false)}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #edeaff 0%, #f5f3ff 100%)",
              borderRadius: 16,
              padding: "18px 20px",
              border: "1.5px solid #ddd8f8",
              marginBottom: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 18,
                  borderRadius: 4,
                  background: "linear-gradient(#7c6fcf, #505081)",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#7c6fcf",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Current Prices
              </span>
            </div>
            <p
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 2.1,
                fontSize: 15,
                color: "#1e1b4b",
                margin: 0,
                fontFamily: "inherit",
              }}
            >
              {storeNote}
            </p>
          </div>
        </InfoModal>
      )}

      {/* Help Modal */}
      {showHelp && (
        <InfoModal
          title="How to Use"
          emoji="❓"
          onClose={() => setShowHelp(false)}
        >
          {/* Intro pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#ede9fe",
              color: "#5b4f9c",
              fontSize: 12,
              fontWeight: 700,
              padding: "5px 12px",
              borderRadius: 20,
              marginBottom: 20,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            ✦ 5 quick steps
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              {
                icon: "🔍",
                step: "Search a product",
                desc: "Type the product name or brand in the search bar. If one doesn't work, try the other (e.g. 'Lucky Me' instead of 'Pancit Canton').",
                color: "#6d5fbc",
              },
              {
                icon: "🗂️",
                step: "Filter by category",
                desc: "Use the dropdown to narrow down by type — Snacks, Beverages, Bread, etc.",
                color: "#4d7fcc",
              },
              {
                icon: "👆",
                step: "Tap a product card",
                desc: "Tap any card to see its available sizes, flavors, and prices.",
                color: "#3a9e7c",
              },
              {
                icon: "🛒",
                step: "Add to cart",
                desc: "Pick a variant to add it to your cart. The floating cart button (bottom-right) shows your item count.",
                color: "#c07a2e",
              },
              {
                icon: "🧮",
                step: "Calculate your change",
                desc: "Open the cart and enter the cash amount — it instantly shows the exact change. The cart is your calculator.",
                color: "#b04a7a",
              },
            ].map(({ icon, step, desc, color }, index, arr) => (
              <div key={step} style={{ display: "flex", gap: 0 }}>
                {/* Timeline column */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                    width: 52,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
                      border: `2px solid ${color}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                      boxShadow: `0 4px 14px ${color}22`,
                    }}
                  >
                    {icon}
                  </div>
                  {index < arr.length - 1 && (
                    <div
                      style={{
                        width: 2,
                        flex: 1,
                        minHeight: 16,
                        margin: "5px 0",
                        background: `linear-gradient(${color}55, ${arr[index + 1].color}33)`,
                        borderRadius: 2,
                      }}
                    />
                  )}
                </div>

                {/* Content column */}
                <div
                  style={{
                    flex: 1,
                    paddingLeft: 14,
                    paddingBottom: index < arr.length - 1 ? 22 : 0,
                    paddingTop: 2,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      color: "#1e1b4b",
                      marginBottom: 5,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {step}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                      lineHeight: 1.7,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </InfoModal>
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

function InfoModal({
  title,
  emoji,
  accent = "#505081",
  accentEnd = "#272757",
  onClose,
  children,
}) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,7,40,0.70)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 16,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        animation: "fadeIn 0.18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 500,
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow:
            "0 40px 100px rgba(8,7,40,0.55), 0 0 0 1px rgba(255,255,255,0.06)",
          animation: "modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Gradient Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, ${accentEnd} 100%)`,
            padding: "24px 24px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: -20,
              right: 60,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -30,
              right: 10,
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "rgba(255,255,255,0.18)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
                backdropFilter: "blur(4px)",
              }}
            >
              {emoji}
            </div>
            <h2
              style={{
                fontSize: 19,
                fontWeight: 800,
                color: "white",
                margin: 0,
                letterSpacing: "-0.01em",
                textShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }}
            >
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1.5px solid rgba(255,255,255,0.20)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.9)",
              fontWeight: 700,
              flexShrink: 0,
              position: "relative",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.28)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
            }
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            overflowY: "auto",
            padding: "24px",
            background: "#f7f6fd",
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default LookupPage;
