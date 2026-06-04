import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../store/cartStore";

function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getTotal } =
    useCartStore();
  const [amountPaid, setAmountPaid] = useState("");

  const total = getTotal();
  const change = parseFloat(amountPaid) - total;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", fontSize: 22 }}
        >
          ←
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>🛒 Cart</h1>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <p style={{ textAlign: "center", color: "#999", marginTop: 60 }}>
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

            <div style={{ fontWeight: 700, color: "#f97316", fontSize: 18 }}>
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
            <span style={{ fontWeight: 700, fontSize: 22, color: "#f97316" }}>
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
            onClick={() => {
              clearCart();
              setAmountPaid("");
            }}
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
            }}
          >
            Clear Cart
          </button>
        </div>
      )}
    </div>
  );
}

export default CartPage;
