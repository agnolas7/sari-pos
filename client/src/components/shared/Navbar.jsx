import { useNavigate, useLocation } from "react-router-dom";
import storeLogo from "../../assets/storelogo.png";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        background: "linear-gradient(135deg, #505081 0%, #3d3c5f 100%)",
        color: "white",
        padding: "10px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 0,
        boxShadow: "0 4px 20px rgba(80, 80, 129, 0.3)",
      }}
    >
      <div
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          transition: "transform 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <img
          src={storeLogo}
          alt="Sari-POS Logo"
          style={{
            height: 42,
            width: "auto",
            borderRadius: 8,
          }}
        />
        <span
          style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}
        >
          Sari-POS
        </span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => navigate("/")}
          className={`boton-elegante${isActive("/") ? " active" : ""}`}
        >
          🛒 Store
        </button>

        <button
          onClick={() => navigate("/utang")}
          className={`boton-elegante${isActive("/utang") ? " active" : ""}`}
        >
          📋 Utang List
        </button>

        <button
          onClick={() => navigate("/leaderboard")}
          className={`boton-elegante${isActive("/leaderboard") ? " active" : ""}`}
        >
          🏆 Top Sellers
        </button>

        <button
          onClick={() => navigate("/admin")}
          className={`boton-elegante${isActive("/admin") ? " active" : ""}`}
        >
          ⚙️ Admin
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
