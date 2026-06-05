import { useState } from "react";

function VariantPicker({ product, onAdd, onClose }) {
  const [hoveredId, setHoveredId] = useState(null);

  const variants = product.variants?.filter((v) => v.is_active !== false) ?? [];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,14,71,0.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "24px 24px 0 0",
          padding: "8px 0 0 0",
          width: "100%",
          maxWidth: 540,
          boxShadow: "0 -8px 48px rgba(80,80,129,0.22)",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            background: "#e0dff0",
            borderRadius: 99,
            margin: "10px auto 0",
            flexShrink: 0,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px 12px",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#8886ac",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              {product.category?.icon} {product.category?.name}
            </div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#1e1b4b",
                margin: 0,
              }}
            >
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f0eefb",
              border: "none",
              width: 34,
              height: 34,
              borderRadius: "50%",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#505081",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#a09ec0",
            padding: "0 20px 12px",
            fontWeight: 500,
          }}
        >
          Choose a variant to add to cart
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#f0eefb", margin: "0 20px" }} />

        {/* Variants list */}
        <div
          style={{
            overflowY: "auto",
            padding: "12px 16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {variants.length === 0 && (
            <p
              style={{ color: "#bbb", textAlign: "center", padding: "24px 0" }}
            >
              No variants available.
            </p>
          )}
          {variants.map((variant) => {
            const label =
              [variant.flavor, variant.size].filter(Boolean).join(" · ") ||
              "Regular";
            const isHovered = hoveredId === variant.id;
            return (
              <button
                key={variant.id}
                onClick={() => onAdd(variant)}
                onMouseEnter={() => setHoveredId(variant.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  background: isHovered
                    ? "linear-gradient(135deg, #505081 0%, #3d3c5f 100%)"
                    : "#f7f6fd",
                  border: isHovered
                    ? "1.5px solid transparent"
                    : "1.5px solid #e9e7f8",
                  borderRadius: 14,
                  cursor: "pointer",
                  transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
                  transform: isHovered ? "scale(1.01)" : "scale(1)",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: isHovered ? "white" : "#1e1b4b",
                    transition: "color 0.18s",
                  }}
                >
                  {label}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 18,
                      color: isHovered ? "white" : "#505081",
                      transition: "color 0.18s",
                    }}
                  >
                    ₱{parseFloat(variant.price).toFixed(2)}
                  </span>
                  <span
                    style={{
                      background: isHovered
                        ? "rgba(255,255,255,0.2)"
                        : "#ede9fe",
                      color: isHovered ? "white" : "#505081",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 700,
                      transition: "all 0.18s",
                    }}
                  >
                    +
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VariantPicker;
