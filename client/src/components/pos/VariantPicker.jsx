function VariantPicker({ product, onAdd, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px 16px 0 0",
          padding: 20,
          width: "100%",
          maxWidth: 600,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{product.name}</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 22 }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {product.variants?.length === 0 && (
            <p style={{ color: "#999" }}>No variants available.</p>
          )}
          {product.variants?.map((variant) => (
            <button
              key={variant.id}
              onClick={() => onAdd(variant)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              <span style={{ fontWeight: 500 }}>
                {[variant.flavor, variant.size].filter(Boolean).join(" — ") ||
                  "Regular"}
              </span>
              <span style={{ fontWeight: 700, color: "#f97316", fontSize: 18 }}>
                ₱{parseFloat(variant.price).toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VariantPicker;
