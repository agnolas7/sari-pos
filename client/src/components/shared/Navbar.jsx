import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        background: "#f97316",
        color: "white",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        borderRadius: 8,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700 }}>🏪 Sari-POS</div>

      <div style={{ display: "flex", gap: 16 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: isActive("/") ? "rgba(255,255,255,0.3)" : "transparent",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: isActive("/") ? 600 : 400,
          }}
        >
          🛒 Store
        </button>

        <button
          onClick={() => navigate("/utang")}
          style={{
            background: isActive("/utang")
              ? "rgba(255,255,255,0.3)"
              : "transparent",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: isActive("/utang") ? 600 : 400,
          }}
        >
          📋 Utang List
        </button>

        <button
          onClick={() => navigate("/admin")}
          style={{
            background: isActive("/admin")
              ? "rgba(255,255,255,0.3)"
              : "transparent",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: isActive("/admin") ? 600 : 400,
          }}
        >
          ⚙️ Admin
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
