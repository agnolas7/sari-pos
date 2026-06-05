import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLeaderboard } from "../services/api";
import Navbar from "../components/shared/Navbar";

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
];

const RANK_CROWNS = ["👑", "🥈", "🥉"];
const RANK_LABELS = ["Champion", "Runner-up", "Third Place"];

const FUN_MESSAGES = [
  "selling like a pro 🔥",
  "on fire today 🌶️",
  "the legend 🌟",
  "unstoppable 💪",
  "built different 😤",
  "the GOAT 🐐",
];

function LeaderboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("all");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1000,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    getLeaderboard(period)
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [period]);

  const isMobile = windowWidth < 640;

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div style={{ minHeight: "100vh", background: "#f0eff7" }}>
      <Navbar />

      {/* Hero header */}
      <div
        style={{
          background: "linear-gradient(135deg, #272757 0%, #505081 50%, #3b3278 100%)",
          padding: isMobile ? "28px 16px 48px" : "40px 40px 64px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative bg bubbles */}
        <div style={{ position: "absolute", top: -30, left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -40, right: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", top: 20, right: 80, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <button
          onClick={() => navigate("/")}
          style={{
            position: "absolute",
            top: isMobile ? 16 : 20,
            left: isMobile ? 16 : 28,
            background: "rgba(255,255,255,0.12)",
            border: "1.5px solid rgba(255,255,255,0.2)",
            color: "white",
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
        <h1
          style={{
            fontSize: isMobile ? 26 : 34,
            fontWeight: 900,
            color: "white",
            margin: "0 0 6px",
            letterSpacing: "-0.02em",
          }}
        >
          Top Sellers
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "0 0 24px" }}>
          Who's been killing it at the counter?
        </p>

        {/* Period tabs */}
        <div
          style={{
            display: "inline-flex",
            background: "rgba(255,255,255,0.10)",
            borderRadius: 14,
            padding: 4,
            gap: 2,
          }}
        >
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                padding: isMobile ? "7px 12px" : "8px 18px",
                borderRadius: 10,
                border: "none",
                background: period === p.key ? "white" : "transparent",
                color: period === p.key ? "#272757" : "rgba(255,255,255,0.75)",
                fontWeight: 700,
                fontSize: isMobile ? 12 : 13,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: 640,
          margin: "-28px auto 0",
          padding: isMobile ? "0 12px 32px" : "0 24px 48px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#a09ec0", fontSize: 16 }}>
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: 24,
              padding: "56px 24px",
              textAlign: "center",
              boxShadow: "0 4px 24px rgba(80,80,129,0.10)",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 14 }}>🏜️</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b", margin: "0 0 8px" }}>
              No sales yet!
            </h3>
            <p style={{ fontSize: 14, color: "#a09ec0", margin: 0 }}>
              Start saving sales from the cart to see who's on top 😤
            </p>
          </div>
        ) : (
          <>
            {/* Podium top 3 */}
            {top3.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  gap: isMobile ? 8 : 16,
                  marginBottom: 24,
                }}
              >
                {[top3[1], top3[0], top3[2]]
                  .filter(Boolean)
                  .map((entry, podiumIdx) => {
                    const realRank = entry === top3[0] ? 0 : entry === top3[1] ? 1 : 2;
                    const heights = [160, 200, 140];
                    const height = heights[realRank];
                    const a = entry.attendant;
                    const totalSales = parseFloat(entry.dataValues?.total_sales ?? entry.total_sales ?? 0);
                    const txCount = parseInt(entry.dataValues?.transaction_count ?? entry.transaction_count ?? 0);
                    const color = a?.color ?? "#505081";

                    return (
                      <div
                        key={a?.id ?? podiumIdx}
                        style={{
                          flex: realRank === 0 ? 1.15 : 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {/* Avatar */}
                        <div
                          style={{
                            width: realRank === 0 ? (isMobile ? 64 : 74) : (isMobile ? 54 : 62),
                            height: realRank === 0 ? (isMobile ? 64 : 74) : (isMobile ? 54 : 62),
                            borderRadius: realRank === 0 ? 22 : 18,
                            background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: realRank === 0 ? (isMobile ? 30 : 36) : (isMobile ? 24 : 30),
                            boxShadow: `0 8px 28px ${color}55`,
                            border: `3px solid ${realRank === 0 ? "#fbbf24" : "transparent"}`,
                            animation: realRank === 0 ? "avatarFloat 3s ease-in-out infinite" : "none",
                          }}
                        >
                          {a?.emoji ?? "🙂"}
                        </div>
                        <div style={{ fontSize: realRank === 0 ? 22 : 18 }}>{RANK_CROWNS[realRank]}</div>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: isMobile ? 12 : 13,
                            color: "#1e1b4b",
                            textAlign: "center",
                            maxWidth: isMobile ? 80 : 110,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {a?.name ?? "Unknown"}
                        </div>

                        {/* Podium block */}
                        <div
                          style={{
                            width: "100%",
                            height,
                            background: realRank === 0
                              ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
                              : realRank === 1
                                ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)"
                                : "linear-gradient(135deg, #c97c4a 0%, #a85f30 100%)",
                            borderRadius: "14px 14px 0 0",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: realRank === 0 ? "0 -6px 24px rgba(251,191,36,0.40)" : "none",
                            padding: "12px 8px",
                          }}
                        >
                          <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 900, color: "white" }}>
                            ₱{parseFloat(totalSales).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600, marginTop: 2 }}>
                            {txCount} sale{txCount !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Rest of the list */}
            {rest.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {rest.map((entry, idx) => {
                  const rank = idx + 4;
                  const a = entry.attendant;
                  const totalSales = parseFloat(entry.dataValues?.total_sales ?? entry.total_sales ?? 0);
                  const txCount = parseInt(entry.dataValues?.transaction_count ?? entry.transaction_count ?? 0);
                  const color = a?.color ?? "#505081";
                  return (
                    <div
                      key={a?.id ?? idx}
                      style={{
                        background: "white",
                        borderRadius: 18,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        boxShadow: "0 2px 12px rgba(80,80,129,0.08)",
                        border: "1.5px solid #eee",
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#c4c2e0", width: 22, textAlign: "center", flexShrink: 0 }}>
                        {rank}
                      </div>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 13,
                          background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        {a?.emoji ?? "🙂"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: "#1e1b4b" }}>{a?.name ?? "Unknown"}</div>
                        <div style={{ fontSize: 12, color: "#a09ec0" }}>{txCount} sale{txCount !== 1 ? "s" : ""}</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: color }}>
                        ₱{parseFloat(totalSales).toLocaleString("en-PH", { minimumFractionDigits: 0 })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fun footer note */}
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "#c4c2e0",
                marginTop: 28,
              }}
            >
              {data[0]?.attendant?.name ?? "Someone"} is {FUN_MESSAGES[Math.floor(Math.random() * FUN_MESSAGES.length)]}
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes avatarFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

export default LeaderboardPage;
