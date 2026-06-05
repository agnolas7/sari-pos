import { useState, useEffect } from "react";
import {
  getUtangs,
  addUtang,
  payUtang,
  deleteUtang,
  getAttendants,
} from "../services/api";
import useAttendantStore from "../store/attendantStore";
import Navbar from "../components/shared/Navbar";

function UtangPage() {
  const [utangs, setUtangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1000,
  );
  const [newUtang, setNewUtang] = useState({
    customer_name: "",
    amount: "",
    notes: "",
    attendant_id: "",
  });
  const [paymentForm, setPaymentForm] = useState({ id: null, amount: "" });
  const [attendants, setAttendants] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ open: false, utang: null });
  const { activeAttendant } = useAttendantStore();

  useEffect(() => {
    loadUtangs();
    getAttendants()
      .then((res) => setAttendants(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
      setNewUtang({
        customer_name: "",
        amount: "",
        notes: "",
        attendant_id: "",
      });
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
    const utang = utangs.find((u) => u.id === id);
    setDeleteModal({ open: true, utang });
  };

  const confirmDelete = async () => {
    if (!deleteModal.utang) return;
    try {
      await deleteUtang(deleteModal.utang.id);
      setDeleteModal({ open: false, utang: null });
      loadUtangs();
    } catch (err) {
      alert("Error deleting utang");
      setDeleteModal({ open: false, utang: null });
    }
  };

  const totalOwed = utangs.reduce(
    (sum, u) => sum + (parseFloat(u.amount) - parseFloat(u.paid_amount)),
    0,
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />

      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: windowWidth < 640 ? "16px" : "24px",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: windowWidth < 640 ? 24 : 32,
              fontWeight: 800,
              marginBottom: 8,
              color: "#1e293b",
            }}
          >
            📋 Credit Tracking (Utang)
          </h1>
          <p
            style={{ color: "#64748b", fontSize: windowWidth < 640 ? 12 : 14 }}
          >
            Manage customer credit records and payment tracking
          </p>
        </div>

        {/* Summary Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #505081 0%, #3d3c5f 100%)",
            borderRadius: 12,
            padding: windowWidth < 640 ? 16 : 24,
            marginBottom: 24,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            color: "white",
          }}
        >
          <div
            style={{
              fontSize: windowWidth < 640 ? 12 : 14,
              opacity: 0.9,
              marginBottom: 8,
            }}
          >
            Total Amount Owed
          </div>
          <div
            style={{ fontSize: windowWidth < 640 ? 28 : 40, fontWeight: 800 }}
          >
            ₱{totalOwed.toFixed(2)}
          </div>
        </div>

        {/* Add button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              width: "100%",
              padding: 14,
              background: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 24,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 4px rgba(34, 197, 94, 0.2)",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#16a34a";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 8px rgba(34, 197, 94, 0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#22c55e";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 4px rgba(34, 197, 94, 0.2)";
            }}
          >
            ➕ Add New Utang Record
          </button>
        )}

        {/* Add form */}
        {showAddForm && (
          <div
            style={{
              background: "white",
              border: "2px solid #e2e8f0",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            }}
          >
            <h2
              style={{
                fontSize: windowWidth < 640 ? 16 : 18,
                fontWeight: 700,
                marginBottom: 16,
                color: "#1e293b",
              }}
            >
              New Utang Record
            </h2>
            <input
              placeholder="Customer Name *"
              value={newUtang.customer_name}
              onChange={(e) =>
                setNewUtang({ ...newUtang, customer_name: e.target.value })
              }
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                marginBottom: 12,
                fontSize: 14,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <input
              placeholder="Amount (₱) *"
              type="number"
              value={newUtang.amount}
              onChange={(e) =>
                setNewUtang({ ...newUtang, amount: e.target.value })
              }
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                marginBottom: 12,
                fontSize: 14,
                fontFamily: "inherit",
                boxSizing: "border-box",
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
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                marginBottom: 16,
                fontSize: 14,
                fontFamily: "inherit",
                minHeight: 80,
                boxSizing: "border-box",
              }}
            />

            {/* Attendant picker */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#64748b",
                  marginBottom: 8,
                }}
              >
                👤 Served by
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setNewUtang({ ...newUtang, attendant_id: "" })}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: !newUtang.attendant_id
                      ? "2px solid #505081"
                      : "1.5px solid #e2e8f0",
                    background: !newUtang.attendant_id ? "#ede9fe" : "white",
                    color: !newUtang.attendant_id ? "#505081" : "#94a3b8",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  None
                </button>
                {attendants.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() =>
                      setNewUtang({ ...newUtang, attendant_id: a.id })
                    }
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      border:
                        newUtang.attendant_id === a.id
                          ? `2px solid ${a.color}`
                          : "1.5px solid #e2e8f0",
                      background:
                        newUtang.attendant_id === a.id
                          ? `${a.color}18`
                          : "white",
                      color:
                        newUtang.attendant_id === a.id ? a.color : "#64748b",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.15s",
                    }}
                  >
                    <span>{a.emoji}</span>
                    <span>{a.name}</span>
                  </button>
                ))}
              </div>
              {activeAttendant && !newUtang.attendant_id && (
                <button
                  type="button"
                  onClick={() =>
                    setNewUtang({
                      ...newUtang,
                      attendant_id: activeAttendant.id,
                    })
                  }
                  style={{
                    marginTop: 8,
                    background: "none",
                    border: "none",
                    color: "#505081",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Use active attendant ({activeAttendant.emoji}{" "}
                  {activeAttendant.name})
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleAddUtang}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#22c55e",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#16a34a";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "#22c55e";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                💾 Save Record
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#e2e8f0",
                  color: "#64748b",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#cbd5e1";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "#e2e8f0";
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Utang list */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: windowWidth < 640 ? 30 : 40,
              color: "#64748b",
            }}
          >
            <div
              style={{ fontSize: windowWidth < 640 ? 16 : 20, marginBottom: 8 }}
            >
              ⏳ Loading records...
            </div>
          </div>
        ) : utangs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: windowWidth < 640 ? 40 : 60,
              background: "white",
              borderRadius: 12,
              border: "2px dashed #cbd5e1",
              color: "#64748b",
            }}
          >
            <div
              style={{
                fontSize: windowWidth < 640 ? 32 : 40,
                marginBottom: 12,
              }}
            >
              📭
            </div>
            <div
              style={{ fontSize: windowWidth < 640 ? 16 : 18, fontWeight: 600 }}
            >
              No records yet
            </div>
            <div
              style={{
                fontSize: windowWidth < 640 ? 12 : 14,
                marginTop: 8,
                opacity: 0.8,
              }}
            >
              Add your first utang record to get started
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                windowWidth < 640
                  ? "1fr"
                  : windowWidth < 1024
                    ? "repeat(2, 1fr)"
                    : "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {utangs.map((utang) => {
              const amount = parseFloat(utang.amount);
              const paidAmount = parseFloat(utang.paid_amount);
              const remaining = amount - paidAmount;
              const percentage = (paidAmount / amount) * 100;
              const isPaid = utang.status === "paid";

              return (
                <div
                  key={utang.id}
                  style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: windowWidth < 640 ? 14 : 20,
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0, 0, 0, 0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 2px 4px rgba(0, 0, 0, 0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: windowWidth < 640 ? 14 : 16,
                          fontWeight: 700,
                          color: "#1e293b",
                        }}
                      >
                        {utang.customer_name}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}
                      >
                        ID: {utang.id}
                      </div>
                      {utang.attendant && (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            marginTop: 6,
                            background: `${utang.attendant.color}14`,
                            border: `1px solid ${utang.attendant.color}33`,
                            borderRadius: 8,
                            padding: "3px 9px",
                          }}
                        >
                          <span style={{ fontSize: 13 }}>
                            {utang.attendant.emoji}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: utang.attendant.color,
                            }}
                          >
                            {utang.attendant.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background: isPaid
                          ? "#dcfce7"
                          : percentage > 50
                            ? "#fef3c7"
                            : "#fee2e2",
                        color: isPaid
                          ? "#16a34a"
                          : percentage > 50
                            ? "#b45309"
                            : "#dc2626",
                        padding: "6px 12px",
                        borderRadius: 6,
                      }}
                    >
                      {utang.status.replace("_", " ").toUpperCase()}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        marginBottom: 6,
                        color: "#64748b",
                      }}
                    >
                      <span>Progress</span>
                      <span style={{ fontWeight: 700 }}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div
                      style={{
                        background: "#e2e8f0",
                        borderRadius: 8,
                        height: 10,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          background: isPaid
                            ? "#22c55e"
                            : percentage > 50
                              ? "#505081"
                              : "#ef4444",
                          height: "100%",
                          width: `${Math.min(percentage, 100)}%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Amount breakdown */}
                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            marginBottom: 4,
                          }}
                        >
                          Total
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#1e293b",
                          }}
                        >
                          ₱{amount.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            marginBottom: 4,
                          }}
                        >
                          Paid
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#22c55e",
                          }}
                        >
                          ₱{paidAmount.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            marginBottom: 4,
                          }}
                        >
                          Remaining
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#ef4444",
                          }}
                        >
                          ₱{remaining.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            marginBottom: 4,
                          }}
                        >
                          Created
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {new Date(utang.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {utang.notes && (
                    <div
                      style={{
                        background: "#fef3c7",
                        padding: 10,
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#78350f",
                        marginBottom: 16,
                        borderLeft: "3px solid #505081",
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        📝 Notes:
                      </div>
                      {utang.notes}
                    </div>
                  )}

                  {/* Payment form - only show if not fully paid */}
                  {!isPaid && (
                    <>
                      {paymentForm.id === utang.id ? (
                        <div style={{ marginBottom: 12 }}>
                          <input
                            placeholder="Payment amount (₱)"
                            type="number"
                            value={paymentForm.amount}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                amount: e.target.value,
                              })
                            }
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                              marginBottom: 8,
                              fontSize: 14,
                              boxSizing: "border-box",
                            }}
                          />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={handlePayment}
                              style={{
                                flex: 1,
                                padding: 10,
                                background: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: 6,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontSize: 13,
                              }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() =>
                                setPaymentForm({ id: null, amount: "" })
                              }
                              style={{
                                flex: 1,
                                padding: 10,
                                background: "#e2e8f0",
                                color: "#64748b",
                                border: "none",
                                borderRadius: 6,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontSize: 13,
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setPaymentForm({ id: utang.id, amount: "" })
                          }
                          style={{
                            width: "100%",
                            padding: 10,
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: "pointer",
                            marginBottom: 8,
                            fontSize: 13,
                          }}
                        >
                          💳 Add Payment
                        </button>
                      )}
                    </>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(utang.id)}
                    style={{
                      width: "100%",
                      padding: 10,
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    🗑️ Delete Record
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.open && deleteModal.utang && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "16px",
              animation: "fadeIn 0.2s ease-out",
            }}
            onClick={() => setDeleteModal({ open: false, utang: null })}
          >
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                maxWidth: "400px",
                width: "100%",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  ⚠️
                </div>
                <div>
                  <h2
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "#1e293b",
                    }}
                  >
                    Delete Record?
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    This action cannot be undone
                  </p>
                </div>
              </div>

              {/* Record Details */}
              <div
                style={{
                  background: "#f1f5f9",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Customer
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#1e293b",
                    }}
                  >
                    {deleteModal.utang.customer_name}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Total Amount
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#dc2626",
                    }}
                  >
                    ₱{parseFloat(deleteModal.utang.amount).toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Remaining Balance
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#1e293b",
                    }}
                  >
                    ₱
                    {(
                      parseFloat(deleteModal.utang.amount) -
                      parseFloat(deleteModal.utang.paid_amount)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                }}
              >
                <button
                  onClick={() => setDeleteModal({ open: false, utang: null })}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    background: "#f1f5f9",
                    color: "#64748b",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "#e2e8f0";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "#f1f5f9";
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "#b91c1c";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(220, 38, 38, 0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "#dc2626";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  🗑️ Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default UtangPage;
