import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import storeLogo from "../../assets/storelogo.png";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1000,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu when navigating
  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const isMobile = windowWidth < 768;

  const navItems = [
    { path: "/", label: "Store", icon: "🛒" },
    { path: "/utang", label: "Utang List", icon: "📋" },
    { path: "/sales", label: "Sales", icon: "📊" },
    { path: "/leaderboard", label: "Top Sellers", icon: "🏆" },
    { path: "/admin", label: "Admin", icon: "⚙️" },
  ];

  return (
    <nav
      style={{
        background: "linear-gradient(135deg, #505081 0%, #3d3c5f 100%)",
        color: "white",
        padding: isMobile ? "10px 12px" : "10px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 0,
        boxShadow: "0 4px 20px rgba(80, 80, 129, 0.3)",
        position: "relative",
      }}
    >
      {/* Logo */}
      <div
        onClick={() => handleNavigation("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 8 : 12,
          cursor: "pointer",
          transition: "transform 0.2s",
          flexShrink: 0,
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <img
          src={storeLogo}
          alt="Sari-POS Logo"
          style={{
            height: isMobile ? 36 : 42,
            width: "auto",
            borderRadius: 8,
          }}
        />
        {!isMobile && (
          <span
            style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}
          >
            Sari-POS
          </span>
        )}
      </div>

      {/* Desktop Nav */}
      {!isMobile && (
        <div style={{ display: "flex", gap: 8 }}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`boton-elegante${isActive(item.path) ? " active" : ""}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Mobile Hamburger */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "none",
            color: "white",
            padding: "6px 10px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
          }}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      )}

      {/* Mobile Menu Dropdown */}
      {isMobile && mobileMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "linear-gradient(180deg, #3d3c5f 0%, #2a2950 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderTop: "none",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: "8px",
            zIndex: 100,
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              style={{
                background: isActive(item.path)
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
                padding: "10px 12px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                textAlign: "left",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.18)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = isActive(item.path)
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(255,255,255,0.08)")
              }
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
