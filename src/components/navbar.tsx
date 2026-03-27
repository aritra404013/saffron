import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import FloatingCartBar from "./FloatingCartBar";

const Navbar = () => {
  const { user, isAuth, setUser, setIsAuth, city, quauntity } = useAppData();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    setMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search });
    navigate(`/?search=${encodeURIComponent(search)}`);
  };

  return (
    <>
      {/* ── DESKTOP / TOP NAV ────────────────────────────── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          height: "var(--nav-h)",
          background: "rgba(255,255,255,.88)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)" }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "var(--r-md)",
              background: "linear-gradient(135deg,var(--crimson),var(--crimson-dark))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem", boxShadow: "var(--shadow-red)",
            }}>🍅</div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text-1)", letterSpacing: "-.02em" }}>
              Saffron Sky
            </span>
          </Link>

          {/* Location */}
          <div className="hide-mobile" style={{
            display: "flex", alignItems: "center", gap: "var(--sp-1)",
            padding: "var(--sp-2) var(--sp-3)", borderRadius: "var(--r-full)",
            border: "1.5px solid var(--border)", background: "var(--surface)",
            cursor: "pointer", flexShrink: 0,
          }}>
            <span style={{ fontSize: ".75rem" }}>📍</span>
            <span style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--text-2)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {city}
            </span>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 520 }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "var(--sp-3)", top: "50%", transform: "translateY(-50%)", fontSize: ".9rem", color: "var(--text-4)" }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search restaurants, cuisines..."
                style={{
                  width: "100%", padding: "var(--sp-2) var(--sp-4) var(--sp-2) calc(var(--sp-4) + 20px)",
                  border: "1.5px solid var(--border)", borderRadius: "var(--r-full)",
                  background: "var(--surface-2)", color: "var(--text-1)",
                  fontSize: ".875rem", transition: "border-color var(--t1), box-shadow var(--t1)",
                  fontFamily: "inherit",
                }}
                onFocus={e => { e.target.style.borderColor = "var(--crimson)"; e.target.style.boxShadow = "0 0 0 3px rgba(226,55,68,.1)"; e.target.style.background = "var(--surface)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; e.target.style.background = "var(--surface-2)"; }}
              />
            </div>
          </form>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginLeft: "auto", flexShrink: 0 }}>
            {isAuth ? (
              <>
                {/* Cart */}
                <Link to="/cart" className="hide-mobile" style={{ position: "relative", padding: "var(--sp-2) var(--sp-3)", borderRadius: "var(--r-full)", display: "flex", alignItems: "center", gap: "var(--sp-1)", border: "1.5px solid var(--border)", background: "var(--surface)", transition: "border-color var(--t1)" }}>
                  <span style={{ fontSize: "1rem" }}>🛒</span>
                  <span style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--text-2)" }}>Cart</span>
                  {quauntity > 0 && (
                    <span style={{
                      position: "absolute", top: -6, right: -6,
                      width: 18, height: 18, borderRadius: "50%",
                      background: "var(--crimson)", color: "#fff",
                      fontSize: ".65rem", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      animation: "pop .3s var(--ease) both",
                    }}>{quauntity}</span>
                  )}
                </Link>

                {/* Orders */}
                <Link to="/orders" className="hide-mobile" style={{ padding: "var(--sp-2) var(--sp-3)", borderRadius: "var(--r-full)", display: "flex", alignItems: "center", gap: "var(--sp-1)", border: "1.5px solid var(--border)", background: "var(--surface)", fontSize: ".8rem", fontWeight: 600, color: "var(--text-2)" }}>
                  📦 Orders
                </Link>

                {/* User avatar dropdown */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "linear-gradient(135deg,var(--crimson),var(--crimson-dark))",
                      color: "#fff", fontWeight: 700, fontSize: ".85rem",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "var(--shadow-red)", border: "none",
                    }}
                  >
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </button>
                  {menuOpen && (
                    <div className="card anim-fade-in" style={{
                      position: "absolute", right: 0, top: "calc(100% + 8px)",
                      minWidth: 180, zIndex: 200, padding: "var(--sp-2)",
                    }}>
                      <div style={{ padding: "var(--sp-2) var(--sp-3) var(--sp-3)", borderBottom: "1px solid var(--border)", marginBottom: "var(--sp-2)" }}>
                        <p style={{ fontWeight: 600, fontSize: ".875rem", color: "var(--text-1)" }}>{user?.name}</p>
                        <p style={{ fontSize: ".75rem", color: "var(--text-3)" }}>{user?.email}</p>
                      </div>
                      <Link to="/account" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "var(--sp-2) var(--sp-3)", borderRadius: "var(--r-sm)", fontSize: ".85rem", color: "var(--text-2)", transition: "background var(--t1)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        👤 Account
                      </Link>
                      <Link to="/orders" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "var(--sp-2) var(--sp-3)", borderRadius: "var(--r-sm)", fontSize: ".85rem", color: "var(--text-2)", transition: "background var(--t1)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        📦 Orders
                      </Link>
                      <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "var(--sp-2) var(--sp-3)", borderRadius: "var(--r-sm)", fontSize: ".85rem", color: "var(--crimson)", width: "100%", background: "transparent", transition: "background var(--t1)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--error-bg)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────── */}
      {isAuth && (
        <nav className="hide-desktop" style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          height: "var(--bottom-nav-h)",
          background: "rgba(255,255,255,.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-around",
        }}>
          {[
            { icon: "🏠", label: "Home", to: "/" },
            { icon: "🔍", label: "Search", to: "/?search=" },
            { icon: "📦", label: "Orders", to: "/orders" },
            { icon: "👤", label: "Account", to: "/account" },
          ].map(item => (
            <Link key={item.to} to={item.to} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "var(--sp-2)", color: "var(--text-3)", fontSize: ".65rem", fontWeight: 600, letterSpacing: ".02em", transition: "color var(--t1)", position: "relative" }}>
              <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
              {item.label}
              {item.label === "Orders" && quauntity > 0 && (
                <span style={{ position: "absolute", top: 4, right: 10, width: 14, height: 14, borderRadius: "50%", background: "var(--crimson)", color: "#fff", fontSize: ".55rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{quauntity}</span>
              )}
            </Link>
          ))}
        </nav>
      )}

      {/* ── FLOATING CART BAR (mobile) ─────────────────────────── */}
      {isAuth && user?.role === "customer" && <FloatingCartBar />}
    </>
  );
};

export default Navbar;
