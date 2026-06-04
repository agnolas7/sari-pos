import { useState, useEffect } from "react";
import { getUtangs, addUtang, payUtang, deleteUtang } from "../services/api";
import Navbar from "../components/shared/Navbar";

function UtangPage() {
  const [utangs, setUtangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUtang, setNewUtang] = useState({
    customer_name: "",
    amount: "",
    notes: "",
  });
  const [paymentForm, setPaymentForm] = useState({ id: null, amount: "" });

  useEffect(() => {
    loadUtangs();
  }, []);

  const loadUtangs = async () => {
    try {
      const res = await getUtangs();
      setUtangs(res.data);
      setLoading(false);
    } catch (err) {
      alert("Error loading utangs");
      setLoading(false);
    }
  };

  const handleAddUtang = async () => {
    if (!newUtang.customer_name || !newUtang.amount) {
      return alert("Please fill in customer name and amount");
    }
    try {
      const response = await addUtang(newUtang);
      console.log("Utang added:", response.data);
      setNewUtang({ customer_name: "", amount: "", notes: "" });
      setShowAddForm(false);
      await loadUtangs();
      alert("✅ Utang added!");
    } catch (err) {
      console.error("Error adding utang:", err.response?.data || err.message);
      alert(
        "Error adding utang: " + (err.response?.data?.error || err.message),
      );
    }
  };

  const handlePayment = async () => {
    if (!paymentForm.amount || paymentForm.amount <= 0) {
      return alert("Please enter a valid amount");
    }
    try {
      await payUtang(paymentForm.id, paymentForm.amount);
      setPaymentForm({ id: null, amount: "" });
      loadUtangs();
      alert("✅ Payment recorded!");
    } catch (err) {
      alert("Error recording payment");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this utang record?")) return;
    try {
      await deleteUtang(id);
      loadUtangs();
      alert("✅ Deleted!");
    } catch (err) {
      alert("Error deleting utang");
    }
  };

  const totalOwed = utangs.reduce(
    (sum, u) => sum + (parseFloat(u.amount) - parseFloat(u.paid_amount)),
    0,
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <Navbar />

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        📋 Utang List
      </h1>

      {/* Summary */}
      <div
        style={{
          background: "#fef3c7",
          borderLeft: "4px solid #f97316",
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 13, color: "#666" }}>Total Amount Owed</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#f97316" }}>
          ₱{totalOwed.toFixed(2)}
        </div>
      </div>

      {/* Add button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            width: "100%",
            padding: 12,
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            marginBottom: 16,
            cursor: "pointer",
          }}
        >
          + Add New Utang
        </button>
      )}

      {/* Add form */}
      {showAddForm && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #dcfce7",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <input
            placeholder="Customer Name"
            value={newUtang.customer_name}
            onChange={(e) =>
              setNewUtang({ ...newUtang, customer_name: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #dcfce7",
              marginBottom: 10,
              fontSize: 14,
            }}
          />
          <input
            placeholder="Amount"
            type="number"
            value={newUtang.amount}
            onChange={(e) =>
              setNewUtang({ ...newUtang, amount: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #dcfce7",
              marginBottom: 10,
              fontSize: 14,
            }}
          />
          <textarea
            placeholder="Notes (optional)"
            value={newUtang.notes}
            onChange={(e) =>
              setNewUtang({ ...newUtang, notes: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #dcfce7",
              marginBottom: 10,
              fontSize: 14,
              minHeight: 60,
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleAddUtang}
              style={{
                flex: 1,
                padding: 10,
                background: "#22c55e",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                flex: 1,
                padding: 10,
                background: "#e5e7eb",
                color: "#333",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Utang list */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#999" }}>Loading...</p>
      ) : utangs.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999" }}>No utang records</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {utangs.map((utang) => {
            const amount = parseFloat(utang.amount);
            const paidAmount = parseFloat(utang.paid_amount);
            const remaining = amount - paidAmount;
            const percentage = (paidAmount / amount) * 100;

            return (
              <div
                key={utang.id}
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{utang.customer_name}</div>
                  <div
                    style={{
                      fontSize: 12,
                      background:
                        utang.status === "paid"
                          ? "#dcfce7"
                          : utang.status === "partially_paid"
                            ? "#fef3c7"
                            : "#fee2e2",
                      color:
                        utang.status === "paid"
                          ? "#16a34a"
                          : utang.status === "partially_paid"
                            ? "#b45309"
                            : "#dc2626",
                      padding: "4px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {utang.status.replace("_", " ").toUpperCase()}
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    background: "#e5e7eb",
                    borderRadius: 4,
                    height: 8,
                    marginBottom: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "#3b82f6",
                      height: "100%",
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    marginBottom: 10,
                    color: "#666",
                  }}
                >
                  <div>Paid: ₱{paidAmount.toFixed(2)}</div>
                  <div>Remaining: ₱{remaining.toFixed(2)}</div>
                  <div style={{ fontWeight: 600 }}>
                    Total: ₱{amount.toFixed(2)}
                  </div>
                </div>

                {utang.notes && (
                  <div
                    style={{
                      background: "#f3f4f6",
                      padding: 8,
                      borderRadius: 6,
                      fontSize: 12,
                      marginBottom: 10,
                      color: "#666",
                    }}
                  >
                    <strong>Notes:</strong> {utang.notes}
                  </div>
                )}

                {/* Payment form */}
                {paymentForm.id === utang.id ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="number"
                      placeholder="Amount to pay"
                      value={paymentForm.amount}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          amount: e.target.value,
                        })
                      }
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: 13,
                      }}
                    />
                    <button
                      onClick={handlePayment}
                      style={{
                        padding: "8px 12px",
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setPaymentForm({ id: null, amount: "" })}
                      style={{
                        padding: "8px 12px",
                        background: "#e5e7eb",
                        color: "#333",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 6 }}>
                    {utang.status !== "paid" && (
                      <button
                        onClick={() =>
                          setPaymentForm({ id: utang.id, amount: "" })
                        }
                        style={{
                          flex: 1,
                          padding: "8px",
                          background: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        💰 Add Payment
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(utang.id)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UtangPage;
