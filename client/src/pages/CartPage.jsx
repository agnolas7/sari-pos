import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../store/cartStore";
import useAttendantStore from "../store/attendantStore";
import Navbar from "../components/shared/Navbar";
import { getAttendants, recordSale } from "../services/api";

function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getTotal } =
    useCartStore();
  const [amountPaid, setAmountPaid] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showAttendantPicker, setShowAttendantPicker] = useState(false);
  const [attendants, setAttendants] = useState([]);
  const [saleSaved, setSaleSaved] = useState(false);
  const { activeAttendant, setActiveAttendant } = useAttendantStore();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1000,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getAttendants()
      .then((res) => setAttendants(res.data))
      .catch(() => {});
  }, []);

  const handleSaveSale = async () => {
    if (!activeAttendant || items.length === 0) return;
    try {
      const itemCount = items.reduce((s, i) => s + i.quantity, 0);
      await recordSale({
        attendant_id: activeAttendant.id,
        total,
        item_count: itemCount,
        items,
      });
      setSaleSaved(true);
      clearCart();
      setAmountPaid("");
      setShowSaveConfirm(false);
      setTimeout(() => setSaleSaved(false), 2500);
    } catch (e) {
      // silent fail for family use
    }
  };

  const total = getTotal();
  const change = parseFloat(amountPaid) - total;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: windowWidth < 640 ? "12px" : "24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{ background: "none", border: "none", fontSize: 22 }}
          >
            ←
          </button>
          <h1
            style={{ fontSize: windowWidth < 640 ? 18 : 24, fontWeight: 700 }}
          >
            🛒 Cart
          </h1>
        </div>

        {/* Attendant strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: activeAttendant
              ? `linear-gradient(135deg, ${activeAttendant.color}18 0%, ${activeAttendant.color}08 100%)`
              : "#f0eff7",
            border: activeAttendant
              ? `1.5px solid ${activeAttendant.color}44`
              : "1.5px dashed #c4c2e0",
            borderRadius: 14,
            padding: "10px 14px",
            marginBottom: 16,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() => setShowAttendantPicker(true)}
        >
          {activeAttendant ? (
            <>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${activeAttendant.color} 0%, ${activeAttendant.color}bb 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                  boxShadow: `0 4px 12px ${activeAttendant.color}44`,
                }}
              >
                {activeAttendant.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "#8886ac",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  Serving
                </div>
                <div
                  style={{ fontSize: 15, fontWeight: 800, color: "#1e1b4b" }}
                >
                  {activeAttendant.name}
                </div>
              </div>
              <span style={{ fontSize: 12, color: "#a09ec0" }}>
                Tap to switch ›
              </span>
            </>
          ) : (
            <>
              <div style={{ fontSize: 26 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: "#505081" }}
                >
                  No attendant selected
                </div>
                <div style={{ fontSize: 12, color: "#a09ec0" }}>
                  Tap to pick who's serving
                </div>
              </div>
              <span style={{ fontSize: 18, color: "#c4c2e0" }}>›</span>
            </>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <p
            style={{
              textAlign: "center",
              color: "#999",
              marginTop: windowWidth < 640 ? 40 : 60,
            }}
          >
            Cart is empty. Go add some products!
          </p>
        )}

        {/* Cart Items */}
        {items.map((item) => (
          <div
            key={item.variantId}
            style={{
              background: "white",
              borderRadius: 10,
              padding: 14,
              marginBottom: 10,
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{item.productName}</div>
                <div style={{ fontSize: 13, color: "#888" }}>
                  {[item.flavor, item.size].filter(Boolean).join(" — ") ||
                    "Regular"}
                </div>
              </div>
              <button
                onClick={() => removeItem(item.variantId)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  fontSize: 18,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Quantity controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() =>
                    updateQuantity(item.variantId, item.quantity - 1)
                  }
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "1px solid #ddd",
                    background: "white",
                    fontSize: 18,
                  }}
                >
                  −
                </button>
                <span
                  style={{ fontWeight: 600, minWidth: 20, textAlign: "center" }}
                >
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.variantId, item.quantity + 1)
                  }
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "1px solid #ddd",
                    background: "white",
                    fontSize: 18,
                  }}
                >
                  +
                </button>
              </div>

              <div style={{ fontWeight: 700, color: "#505081", fontSize: 18 }}>
                ₱{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          </div>
        ))}

        {/* Total + Change Calculator */}
        {items.length > 0 && (
          <div
            style={{
              background: "white",
              borderRadius: 10,
              padding: 16,
              border: "1px solid #e5e7eb",
              marginTop: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 18 }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 22, color: "#505081" }}>
                ₱{total.toFixed(2)}
              </span>
            </div>

            {/* Amount paid input */}
            <input
              type="number"
              placeholder="Amount paid by customer"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 16,
                marginBottom: 12,
              }}
            />

            {/* Change */}
            {amountPaid && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 18 }}>Change</span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 22,
                    color: change >= 0 ? "#22c55e" : "#ef4444",
                  }}
                >
                  {change >= 0
                    ? `₱${change.toFixed(2)}`
                    : `Short ₱${Math.abs(change).toFixed(2)}`}
                </span>
              </div>
            )}

            {/* Clear cart */}
            <button
              onClick={() => setShowClearConfirm(true)}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "12px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Clear Cart
            </button>

            {/* Save Sale */}
            {activeAttendant && (
              <button
                onClick={() => setShowSaveConfirm(true)}
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: "12px",
                  background: saleSaved
                    ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                    : `linear-gradient(135deg, ${activeAttendant.color} 0%, ${activeAttendant.color}cc 100%)`,
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  transition: "background 0.3s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>{saleSaved ? "✅" : "💾"}</span>
                {saleSaved
                  ? "Sale Saved!"
                  : `Save as ${activeAttendant.name}'s Sale`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div
          onClick={() => setShowClearConfirm(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,14,71,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 16,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 20,
              width: "100%",
              maxWidth: 360,
              padding: "28px 24px 24px",
              boxShadow: "0 24px 64px rgba(15,14,71,0.25)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#1e1b4b",
                margin: "0 0 8px",
              }}
            >
              Clear cart?
            </h2>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>
              All {items.length} item{items.length !== 1 ? "s" : ""} will be
              removed.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: 10,
                  border: "1.5px solid #d1cee8",
                  background: "white",
                  color: "#505081",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setAmountPaid("");
                  setShowClearConfirm(false);
                }}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: 10,
                  border: "none",
                  background: "#ef4444",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Sale Confirmation Modal */}
      {showSaveConfirm && activeAttendant && (
        <div
          onClick={() => setShowSaveConfirm(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,14,71,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 16,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 20,
              width: "100%",
              maxWidth: 380,
              padding: "28px 24px 24px",
              boxShadow: "0 24px 64px rgba(15,14,71,0.25)",
            }}
          >
            {/* Attendant badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${activeAttendant.color} 0%, ${activeAttendant.color}bb 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  boxShadow: `0 6px 18px ${activeAttendant.color}44`,
                  flexShrink: 0,
                }}
              >
                {activeAttendant.emoji}
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8886ac", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2 }}>
                  Saving sale for
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b" }}>
                  {activeAttendant.name}
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div
              style={{
                background: "#f8f7fe",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 20,
                border: "1.5px solid #e5e3f0",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8886ac", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                Order Summary
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                {items.map((item) => (
                  <div key={item.variantId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b" }}>{item.productName}</span>
                      {(item.size || item.flavor) && (
                        <span style={{ marginLeft: 5, fontSize: 11, color: "#8886ac" }}>
                          {[item.size, item.flavor].filter(Boolean).join(" / ")}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 10, flexShrink: 0, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#a09ec0" }}>×{item.quantity}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#505081" }}>
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1.5px solid #e5e3f0", marginTop: 12, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#505081" }}>₱{total.toFixed(2)}</span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: "#8886ac", margin: "0 0 20px", textAlign: "center" }}>
              This will save the sale and clear the cart.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowSaveConfirm(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: "1.5px solid #d1cee8",
                  background: "white",
                  color: "#505081",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSale}
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: 10,
                  border: "none",
                  background: `linear-gradient(135deg, ${activeAttendant.color} 0%, ${activeAttendant.color}cc 100%)`,
                  color: "white",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: `0 4px 14px ${activeAttendant.color}44`,
                }}
              >
                💾 Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendant Picker Modal */}
      {showAttendantPicker && (
        <div
          onClick={() => setShowAttendantPicker(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,7,40,0.60)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 200,
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "24px 24px 0 0",
              width: "100%",
              maxWidth: 540,
              padding: "20px 20px 32px",
              boxShadow: "0 -8px 48px rgba(8,7,40,0.30)",
            }}
          >
            {/* Drag handle */}
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: "#e5e3f0",
                margin: "0 auto 18px",
              }}
            />
            <h3
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "#1e1b4b",
                margin: "0 0 4px",
              }}
            >
              Who's serving? 👋
            </h3>
            <p style={{ fontSize: 13, color: "#a09ec0", margin: "0 0 18px" }}>
              Pick your profile to track sales
            </p>

            {attendants.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  color: "#bbb",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
                <p style={{ fontSize: 14, margin: 0 }}>
                  No attendants yet. Ask admin to add some!
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {attendants.map((a) => {
                  const isActive = activeAttendant?.id === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        setActiveAttendant(a);
                        setShowAttendantPicker(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px 16px",
                        borderRadius: 16,
                        border: isActive
                          ? `2px solid ${a.color}`
                          : "1.5px solid #e5e3f0",
                        background: isActive
                          ? `linear-gradient(135deg, ${a.color}15 0%, ${a.color}08 100%)`
                          : "white",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.18s",
                      }}
                    >
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 14,
                          background: `linear-gradient(135deg, ${a.color} 0%, ${a.color}bb 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          flexShrink: 0,
                          boxShadow: `0 4px 14px ${a.color}44`,
                        }}
                      >
                        {a.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 15,
                            color: "#1e1b4b",
                          }}
                        >
                          {a.name}
                        </div>
                      </div>
                      {isActive && (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={a.color}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
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
        </div>
      )}
    </div>
  );
}

export default CartPage;
