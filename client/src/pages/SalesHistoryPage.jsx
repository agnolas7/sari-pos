import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/shared/Navbar";
import { getSalesHistory } from "../services/api";

const PAGE_SIZE = 50;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function SalesHistoryPage() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1000,
  );
  const isMobile = windowWidth < 640;

  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Date filter
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchSales = useCallback(
    async (pg = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = { page: pg, limit: PAGE_SIZE };
        if (fromDate) params.from = fromDate;
        if (toDate) params.to = toDate;
        const res = await getSalesHistory(params);
        setSales(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setPage(pg);
      } catch {
        setError("Failed to load sales history.");
      } finally {
        setLoading(false);
      }
    },
    [fromDate, toDate],
  );

  useEffect(() => {
    fetchSales(1);
  }, [fetchSales]);

  // Summary stats from current page (full-page totals come from server)
  const totalAmount = sales.reduce(
    (sum, s) => sum + parseFloat(s.total ?? 0),
    0,
  );
  const totalItems = sales.reduce(
    (sum, s) => sum + parseInt(s.item_count ?? 0),
    0,
  );

  const handleFilter = (e) => {
    e.preventDefault();
    fetchSales(1);
  };

  const clearFilter = () => {
    setFromDate("");
    setToDate("");
  };

  const hasFilter = fromDate || toDate;

  return (
    <div style={{ minHeight: "100vh", background: "#f0eff7" }}>
      <Navbar />

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(180deg, #505081 0%, #393870 100%)",
          padding: isMobile ? "20px 14px 24px" : "28px 32px 32px",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1
            style={{
              color: "white",
              fontSize: isMobile ? 22 : 28,
              fontWeight: 800,
              margin: "0 0 4px",
              letterSpacing: "-0.5px",
            }}
          >
            📊 Sales History
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: 13,
              margin: "0 0 20px",
            }}
          >
            All transactions with attendant info
          </p>

          {/* Date filter form */}
          <form
            onSubmit={handleFilter}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: "8px 14px",
                border: "1.5px solid rgba(255,255,255,0.2)",
                flex: isMobile ? "1 1 100%" : "0 0 auto",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                From
              </span>
              <input
                type="date"
                value={fromDate}
                max={toDate || getTodayStr()}
                onChange={(e) => setFromDate(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                  colorScheme: "dark",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: "8px 14px",
                border: "1.5px solid rgba(255,255,255,0.2)",
                flex: isMobile ? "1 1 100%" : "0 0 auto",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                To
              </span>
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                max={getTodayStr()}
                onChange={(e) => setToDate(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                  colorScheme: "dark",
                }}
              />
            </div>

            {hasFilter && (
              <button
                type="button"
                onClick={clearFilter}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  color: "white",
                  borderRadius: 12,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ✕ Clear
              </button>
            )}

            {/* Quick filter buttons */}
            <div
              style={{
                display: "flex",
                gap: 6,
                marginLeft: isMobile ? 0 : "auto",
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "Today", value: "today" },
                { label: "This Week", value: "week" },
                { label: "This Month", value: "month" },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const today = getTodayStr();
                    if (value === "today") {
                      setFromDate(today);
                      setToDate(today);
                    } else if (value === "week") {
                      const start = new Date(now);
                      start.setDate(now.getDate() - 6);
                      setFromDate(start.toISOString().slice(0, 10));
                      setToDate(today);
                    } else if (value === "month") {
                      setFromDate(
                        new Date(now.getFullYear(), now.getMonth(), 1)
                          .toISOString()
                          .slice(0, 10),
                      );
                      setToDate(today);
                    }
                  }}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    color: "white",
                    borderRadius: 10,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: isMobile ? "16px 12px 40px" : "24px 32px 60px",
        }}
      >
        {/* Summary strip */}
        {!loading && sales.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            {[
              {
                label: hasFilter ? "Filtered Records" : "Total Records",
                value: total.toLocaleString(),
                icon: "🧾",
              },
              {
                label: "Showing",
                value: `${sales.length} transactions`,
                icon: "📋",
              },
              {
                label: "Amount (this page)",
                value: `₱${totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
                icon: "💰",
              },
              {
                label: "Items (this page)",
                value: totalItems.toLocaleString(),
                icon: "📦",
              },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: "12px 18px",
                  boxShadow: "0 2px 8px rgba(80,80,129,0.08)",
                  border: "1.5px solid #e5e3f0",
                  flex: "1 1 120px",
                  minWidth: 120,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#8886ac",
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                >
                  {icon} {label}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 15 : 17,
                    fontWeight: 800,
                    color: "#1e1b4b",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "80px 0",
              gap: 14,
              color: "#8886ac",
              fontSize: 15,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                border: "3px solid #e5e3f0",
                borderTop: "3px solid #505081",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Loading sales...
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#e74c3c",
              fontSize: 15,
            }}
          >
            ⚠️ {error}
          </div>
        ) : sales.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "#aaa",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 14 }}>📊</div>
            <p
              style={{
                fontSize: 17,
                margin: 0,
                color: "#8886ac",
                fontWeight: 600,
              }}
            >
              No sales found.
            </p>
            <p style={{ fontSize: 13, color: "#bbb", marginTop: 6 }}>
              {hasFilter
                ? "Try adjusting the date filter."
                : "No transactions recorded yet."}
            </p>
          </div>
        ) : isMobile ? (
          /* Mobile: Card list */
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sales.map((sale) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                expanded={expandedId === sale.id}
                onToggle={() =>
                  setExpandedId(expandedId === sale.id ? null : sale.id)
                }
              />
            ))}
          </div>
        ) : (
          /* Desktop: Table */
          <div
            style={{
              background: "white",
              borderRadius: 18,
              border: "1.5px solid #e5e3f0",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(80,80,129,0.08)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "linear-gradient(135deg, #505081 0%, #3d3c5f 100%)",
                    color: "white",
                  }}
                >
                  {[
                    "#",
                    "Date",
                    "Time",
                    "Served By",
                    "Items",
                    "Amount",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 18px",
                        textAlign: h === "Amount" ? "right" : "left",
                        fontWeight: 700,
                        fontSize: 12,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        opacity: 0.9,
                        whiteSpace: "nowrap",
                        width: h === "" ? 32 : undefined,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, idx) => (
                  <SaleRow
                    key={sale.id}
                    sale={sale}
                    idx={(page - 1) * PAGE_SIZE + idx + 1}
                    isEven={idx % 2 === 0}
                    expanded={expandedId === sale.id}
                    onToggle={() =>
                      setExpandedId(expandedId === sale.id ? null : sale.id)
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => fetchSales(page - 1)}
              disabled={page === 1}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "1.5px solid #d1cee8",
                background: page === 1 ? "#f5f4fc" : "white",
                color: page === 1 ? "#b0aed0" : "#505081",
                fontWeight: 700,
                fontSize: 13,
                cursor: page === 1 ? "default" : "pointer",
              }}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span
                    key={`e-${idx}`}
                    style={{ color: "#a09ec0", fontSize: 13 }}
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => fetchSales(item)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border:
                        page === item
                          ? "1.5px solid #505081"
                          : "1.5px solid #d1cee8",
                      background:
                        page === item
                          ? "linear-gradient(135deg, #505081 0%, #272757 100%)"
                          : "white",
                      color: page === item ? "white" : "#505081",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {item}
                  </button>
                ),
              )}

            <button
              onClick={() => fetchSales(page + 1)}
              disabled={page === totalPages}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "1.5px solid #d1cee8",
                background: page === totalPages ? "#f5f4fc" : "white",
                color: page === totalPages ? "#b0aed0" : "#505081",
                fontWeight: 700,
                fontSize: 13,
                cursor: page === totalPages ? "default" : "pointer",
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ItemsBreakdown({ items }) {
  if (!items || items.length === 0) {
    return (
      <div
        style={{
          color: "#a09ec0",
          fontSize: 12,
          fontStyle: "italic",
          padding: "4px 0",
        }}
      >
        No item details recorded for this transaction.
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 600, color: "#1e1b4b", fontSize: 13 }}>
              {item.product_name}
            </span>
            {item.variant_label && (
              <span
                style={{
                  marginLeft: 6,
                  background: "#ede9fe",
                  color: "#5b4f9c",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 20,
                }}
              >
                {item.variant_label}
              </span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 12, color: "#8886ac" }}>
              ×{item.quantity}
            </span>
            <span
              style={{
                fontWeight: 700,
                color: "#505081",
                fontSize: 13,
                minWidth: 64,
                textAlign: "right",
              }}
            >
              ₱{(parseFloat(item.price) * item.quantity).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SaleRow({ sale, idx, isEven, expanded, onToggle }) {
  const a = sale.attendant;
  const color = a?.color ?? "#505081";
  const [hovered, setHovered] = useState(false);
  const hasItems = sale.items && sale.items.length > 0;

  return (
    <>
      <tr
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: expanded
            ? "rgba(80,80,129,0.06)"
            : hovered
              ? "rgba(80,80,129,0.04)"
              : isEven
                ? "#faf9fe"
                : "white",
          transition: "background 0.15s",
          borderBottom: expanded ? "none" : "1px solid #f0eefb",
          cursor: "pointer",
        }}
      >
        <td
          style={{
            padding: "13px 18px",
            color: "#a09ec0",
            fontWeight: 600,
            fontSize: 13,
            width: 52,
          }}
        >
          {idx}
        </td>
        <td
          style={{
            padding: "13px 18px",
            fontWeight: 600,
            color: "#1e1b4b",
            whiteSpace: "nowrap",
          }}
        >
          {formatDate(sale.createdAt)}
        </td>
        <td
          style={{
            padding: "13px 18px",
            color: "#6b7280",
            whiteSpace: "nowrap",
          }}
        >
          {formatTime(sale.createdAt)}
        </td>
        <td style={{ padding: "13px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: `${color}22`,
                border: `2px solid ${color}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {a?.emoji ?? "👤"}
            </span>
            <span style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 14 }}>
              {a?.name ?? "Unknown"}
            </span>
          </div>
        </td>
        <td style={{ padding: "13px 18px", color: "#6b7280", fontWeight: 600 }}>
          {sale.item_count ?? 0}
        </td>
        <td
          style={{
            padding: "13px 18px",
            textAlign: "right",
            fontWeight: 800,
            fontSize: 15,
            color: "#505081",
            whiteSpace: "nowrap",
          }}
        >
          ₱{parseFloat(sale.total).toFixed(2)}
        </td>
        <td style={{ padding: "13px 12px", width: 32 }}>
          <span
            style={{
              fontSize: 11,
              color: "#a09ec0",
              transition: "transform 0.2s",
              display: "inline-block",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▼
          </span>
        </td>
      </tr>
      {expanded && (
        <tr
          style={{
            background: isEven ? "#f5f3fc" : "#f8f7fe",
            borderBottom: "1px solid #e5e3f0",
          }}
        >
          <td colSpan={7} style={{ padding: "0 18px 16px 64px" }}>
            <div
              style={{
                borderLeft: `3px solid ${color}55`,
                paddingLeft: 16,
                paddingTop: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#8886ac",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Items Purchased
              </div>
              <ItemsBreakdown items={sale.items} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function SaleCard({ sale, expanded, onToggle }) {
  const a = sale.attendant;
  const color = a?.color ?? "#505081";

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        boxShadow: "0 2px 10px rgba(80,80,129,0.08)",
        border: expanded ? `1.5px solid ${color}55` : "1.5px solid #e5e3f0",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      {/* Header row */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Attendant avatar */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            background: `${color}22`,
            border: `2px solid ${color}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {a?.emoji ?? "👤"}
        </div>

        {/* Middle info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "#1e1b4b",
              marginBottom: 2,
            }}
          >
            {a?.name ?? "Unknown"}
          </div>
          <div style={{ fontSize: 12, color: "#8886ac" }}>
            {formatDate(sale.createdAt)} · {formatTime(sale.createdAt)}
          </div>
          <div style={{ fontSize: 12, color: "#a09ec0", marginTop: 2 }}>
            {sale.item_count ?? 0} item{sale.item_count !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Amount + chevron */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 16, color: "#505081" }}>
            ₱{parseFloat(sale.total).toFixed(2)}
          </div>
          <span
            style={{
              fontSize: 10,
              color: "#a09ec0",
              transition: "transform 0.2s",
              display: "inline-block",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▼
          </span>
        </div>
      </button>

      {/* Expanded items */}
      {expanded && (
        <div
          style={{
            borderTop: `1.5px solid ${color}22`,
            padding: "12px 16px 16px",
            background: "#faf9fe",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#8886ac",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Items Purchased
          </div>
          <ItemsBreakdown items={sale.items} />
        </div>
      )}
    </div>
  );
}
