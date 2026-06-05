import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLeaderboard } from "../services/api";
import Navbar from "../components/shared/Navbar";
import storeLogo from "../assets/storelogo.png";

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
          background:
            "linear-gradient(135deg, #272757 0%, #505081 50%, #3b3278 100%)",
          padding: isMobile ? "28px 16px 48px" : "40px 40px 64px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative bg bubbles */}
        <div
          style={{
            position: "absolute",
            top: -30,
            left: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            right: -20,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 80,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

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

        <img
          src={storeLogo}
          alt="Store Logo"
          style={{
            height: isMobile ? 100 : 140,
            width: "auto",
          }}
        />
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
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
            margin: "0 0 24px",
          }}
        >
          Who's been killing it at the counter?
        </p>

        {/* Period tabs */}
        <div
          data-testid="period-filter-buttons"
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
        data-testid="leaderboard-content"
        style={{
          maxWidth: 640,
          margin: "0 auto 0",
          padding: isMobile ? "48px 12px 32px" : "72px 24px 48px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#a09ec0",
              fontSize: 16,
            }}
          >
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
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#1e1b4b",
                margin: "0 0 8px",
              }}
            >
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
                data-testid="podium-section"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  gap: isMobile ? 6 : 12,
                  marginBottom: isMobile ? 48 : 64,
                  height: isMobile ? 240 : 280,
                  paddingBottom: isMobile ? 16 : 24,
                }}
              >
                {(() => {
                  const maxSales = Math.max(
                    ...data.map((e) =>
                      parseFloat(
                        e.dataValues?.total_sales ?? e.total_sales ?? 0,
                      ),
                    ),
                  );
                  const minHeight = isMobile ? 80 : 120;
                  const maxHeight = isMobile ? 200 : 240;

                  return [top3[1], top3[0], top3[2]]
                    .filter(Boolean)
                    .map((entry, podiumIdx) => {
                      const realRank =
                        entry === top3[0] ? 0 : entry === top3[1] ? 1 : 2;
                      const totalSales = parseFloat(
                        entry.dataValues?.total_sales ?? entry.total_sales ?? 0,
                      );
                      const heightPercent =
                        maxSales > 0 ? totalSales / maxSales : 0;
                      const height =
                        minHeight + heightPercent * (maxHeight - minHeight);
                      const a = entry.attendant;
                      const txCount = parseInt(
                        entry.dataValues?.transaction_count ??
                          entry.transaction_count ??
                          0,
                      );
                      const color = a?.color ?? "#505081";

                      return (
                        <div
                          key={a?.id ?? podiumIdx}
                          style={{
                            flex: realRank === 0 ? 1.15 : 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {/* Avatar */}
                          <div
                            style={{
                              width:
                                realRank === 0
                                  ? isMobile
                                    ? 56
                                    : 68
                                  : isMobile
                                    ? 48
                                    : 56,
                              height:
                                realRank === 0
                                  ? isMobile
                                    ? 56
                                    : 68
                                  : isMobile
                                    ? 48
                                    : 56,
                              borderRadius: realRank === 0 ? 18 : 14,
                              background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize:
                                realRank === 0
                                  ? isMobile
                                    ? 26
                                    : 32
                                  : isMobile
                                    ? 22
                                    : 28,
                              boxShadow: `0 8px 28px ${color}55`,
                              border: `3px solid ${realRank === 0 ? "#fbbf24" : "transparent"}`,
                              animation:
                                realRank === 0
                                  ? "avatarFloat 3s ease-in-out infinite"
                                  : "none",
                            }}
                          >
                            {a?.emoji ?? "🙂"}
                          </div>
                          <div style={{ fontSize: realRank === 0 ? 20 : 16 }}>
                            {RANK_CROWNS[realRank]}
                          </div>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: isMobile ? 11 : 12,
                              color: "#1e1b4b",
                              textAlign: "center",
                              maxWidth: isMobile ? 70 : 100,
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
                              background:
                                realRank === 0
                                  ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
                                  : realRank === 1
                                    ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)"
                                    : "linear-gradient(135deg, #c97c4a 0%, #a85f30 100%)",
                              borderRadius: "12px 12px 0 0",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow:
                                realRank === 0
                                  ? "0 -6px 24px rgba(251,191,36,0.40)"
                                  : "none",
                              padding: isMobile ? "8px 6px" : "10px 8px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: isMobile ? 13 : 16,
                                fontWeight: 900,
                                color: "white",
                              }}
                            >
                              ₱
                              {parseFloat(totalSales).toLocaleString("en-PH", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "rgba(255,255,255,0.8)",
                                fontWeight: 600,
                                marginTop: 2,
                              }}
                            >
                              {txCount}
                            </div>
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            )}

            {/* Rest of the list with bar chart (ranks 4+) */}
            {rest.length > 0 && (
              <div
                data-testid="leaderboard-bar-chart-section"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  marginTop: isMobile ? 12 : 24,
                  paddingTop: isMobile ? 16 : 24,
                  borderTop: "1px solid rgba(80, 80, 129, 0.1)",
                }}
              >
                {(() => {
                  const maxSales = Math.max(
                    ...data.map((e) =>
                      parseFloat(
                        e.dataValues?.total_sales ?? e.total_sales ?? 0,
                      ),
                    ),
                  );

                  return rest.map((entry, idx) => {
                    const rank = idx + 4;
                    const a = entry.attendant;
                    const totalSales = parseFloat(
                      entry.dataValues?.total_sales ?? entry.total_sales ?? 0,
                    );
                    const txCount = parseInt(
                      entry.dataValues?.transaction_count ??
                        entry.transaction_count ??
                        0,
                    );
                    const color = a?.color ?? "#505081";
                    const barWidth =
                      maxSales > 0 ? (totalSales / maxSales) * 100 : 0;

                    return (
                      <div
                        key={a?.id ?? idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: isMobile ? 10 : 14,
                        }}
                      >
                        {/* Rank */}
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "#c4c2e0",
                            width: 24,
                            textAlign: "center",
                            flexShrink: 0,
                          }}
                        >
                          {rank}
                        </div>

                        {/* Avatar */}
                        <div
                          style={{
                            width: isMobile ? 38 : 44,
                            height: isMobile ? 38 : 44,
                            borderRadius: 11,
                            background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: isMobile ? 18 : 20,
                            flexShrink: 0,
                          }}
                        >
                          {a?.emoji ?? "🙂"}
                        </div>

                        {/* Bar chart section */}
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 2,
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: isMobile ? 13 : 14,
                                color: "#1e1b4b",
                              }}
                            >
                              {a?.name ?? "Unknown"}
                            </div>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: isMobile ? 13 : 14,
                                color,
                              }}
                            >
                              ₱
                              {parseFloat(totalSales).toLocaleString("en-PH", {
                                minimumFractionDigits: 0,
                              })}
                            </div>
                          </div>

                          {/* Bar background */}
                          <div
                            style={{
                              width: "100%",
                              height: isMobile ? 20 : 24,
                              background: "#f0eff7",
                              borderRadius: 8,
                              overflow: "hidden",
                              position: "relative",
                            }}
                          >
                            {/* Colored bar */}
                            <div
                              style={{
                                height: "100%",
                                width: `${barWidth}%`,
                                background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
                                borderRadius: 8,
                                transition: "width 0.3s ease",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                paddingRight: barWidth > 15 ? 6 : 0,
                              }}
                            >
                              {barWidth > 20 && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: "white",
                                    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                                  }}
                                >
                                  {txCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
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
              {data[0]?.attendant?.name ?? "Someone"} is{" "}
              {FUN_MESSAGES[Math.floor(Math.random() * FUN_MESSAGES.length)]}
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
