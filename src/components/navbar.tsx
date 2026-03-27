import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import FloatingCartBar from "./FloatingCartBar";

const Navbar = () => {
  const { user, isAuth, setUser, setIsAuth, city, quauntity } = useAppData();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

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
          background: "transparent",
          display: "flex", alignItems: "center",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)" }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "var(--r-md)",
              background: "linear-gradient(135deg, var(--gold-light), var(--gold))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--shadow-gold)", flexShrink: 0,
            }}>
              {/* Saffron flame icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C12 2 7 7.5 7 12.5C7 15.538 9.239 18 12 18C14.761 18 17 15.538 17 12.5C17 10.5 15.5 9 15.5 9C15.5 9 15 11 13.5 11C12.5 11 12 10 12 9C12 6.5 13.5 4.5 13.5 4.5C13.5 4.5 12 2 12 2Z" fill="white" opacity="0.9"/>
                <path d="M12 14C12 14 10 13 10 11.5C10 10.5 10.8 10 11.5 10.5C11.5 10.5 11 12 12 12.5C13 13 13.5 12 13.5 12C13.5 13.5 12 14 12 14Z" fill="white"/>
                <circle cx="12" cy="20" r="2" fill="white" opacity="0.7"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "1.25rem", color: "#fff", letterSpacing: ".02em", textShadow: "0 1px 8px rgba(0,0,0,.4)" }}>
              Saffron Sky
            </span>
          </Link>

          {/* Location */}
          <div className="hide-mobile" style={{
            display: "flex", alignItems: "center", gap: "var(--sp-1)",
            padding: "var(--sp-2) var(--sp-3)", borderRadius: "var(--r-full)",
            border: "1px solid rgba(255,255,255,.2)",
            background: "rgba(255,255,255,.1)",
            backdropFilter: "blur(12px)",
            cursor: "pointer", flexShrink: 0,
            transition: "all var(--t1)",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.background = "rgba(255,255,255,.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; e.currentTarget.style.background = "rgba(255,255,255,.1)"; }}
          >
            <span style={{ fontSize: ".75rem", color: "var(--gold)" }}>◉</span>
            <span style={{ fontSize: ".78rem", fontWeight: 600, color: "rgba(255,255,255,.9)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {city}
            </span>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 520 }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "var(--sp-4)", top: "50%", transform: "translateY(-50%)", fontSize: ".85rem", color: "rgba(255,255,255,.5)" }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search restaurants, cuisines..."
                style={{
                  width: "100%", padding: "10px var(--sp-4) 10px calc(var(--sp-4) + 22px)",
                  border: "1px solid rgba(255,255,255,.2)", borderRadius: "var(--r-full)",
                  background: "rgba(255,255,255,.1)", backdropFilter: "blur(12px)",
                  color: "#fff", fontSize: ".875rem",
                  transition: "all var(--t1)", fontFamily: "inherit",
                }}
                onFocus={e => { e.target.style.borderColor = "var(--gold)"; e.target.style.background = "rgba(255,255,255,.18)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,166,35,.2)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.2)"; e.target.style.background = "rgba(255,255,255,.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </form>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginLeft: "auto", flexShrink: 0 }}>
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(d => !d)}
              title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                width: 36, height: 36, borderRadius: "var(--r-full)",
                border: "1px solid rgba(255,255,255,.2)",
                background: "rgba(255,255,255,.1)",
                backdropFilter: "blur(12px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: "1rem",
                transition: "all var(--t2)", flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.background = "rgba(255,255,255,.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; e.currentTarget.style.background = "rgba(255,255,255,.1)"; }}
            >
              {dark ? "☀️" : "🌙"}
            </button>
            {isAuth ? (
              <>
                {/* Cart */}
                <Link to="/cart" className="hide-mobile" style={{
                  position: "relative", padding: "8px var(--sp-4)", borderRadius: "var(--r-full)",
                  display: "flex", alignItems: "center", gap: "var(--sp-2)",
                  border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.1)",
                  backdropFilter: "blur(12px)",
                  fontSize: ".82rem", fontWeight: 600, color: "rgba(255,255,255,.9)",
                  transition: "all var(--t1)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; e.currentTarget.style.background = "rgba(255,255,255,.18)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; e.currentTarget.style.color = "rgba(255,255,255,.9)"; e.currentTarget.style.background = "rgba(255,255,255,.1)"; }}
                >
                  <span style={{ fontSize: "1rem" }}>🛒</span>
                  Cart
                  {quauntity > 0 && (
                    <span style={{
                      position: "absolute", top: -6, right: -6,
                      width: 18, height: 18, borderRadius: "50%",
                      background: "var(--gold)", color: "#fff",
                      fontSize: ".6rem", fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      animation: "pop .3s var(--ease) both",
                    }}>{quauntity}</span>
                  )}
                </Link>

                {/* Orders */}
                <Link to="/orders" className="hide-mobile" style={{
                  padding: "8px var(--sp-4)", borderRadius: "var(--r-full)",
                  display: "flex", alignItems: "center", gap: "var(--sp-2)",
                  border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.1)",
                  backdropFilter: "blur(12px)",
                  fontSize: ".82rem", fontWeight: 600, color: "rgba(255,255,255,.9)",
                  transition: "all var(--t1)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; e.currentTarget.style.background = "rgba(255,255,255,.18)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; e.currentTarget.style.color = "rgba(255,255,255,.9)"; e.currentTarget.style.background = "rgba(255,255,255,.1)"; }}
                >
                  📦 Orders
                </Link>

                {/* Avatar */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                      width: 38, height: 38, borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--gold-light), var(--gold))",
                      color: "#fff", fontWeight: 800, fontSize: ".85rem",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "var(--shadow-gold)", border: "2px solid rgba(255,255,255,.6)",
                      transition: "transform var(--t2)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                    onMouseLeave={e => e.currentTarget.style.transform = ""}
                  >
                    {user?.image
                      ? <img src={user.image} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                      : user?.name?.[0]?.toUpperCase() || "U"}
                  </button>
                  {menuOpen && (
                    <div className="card anim-scale-in" style={{
                      position: "absolute", right: 0, top: "calc(100% + 10px)",
                      minWidth: 200, zIndex: 200, padding: "var(--sp-2)",
                      boxShadow: "var(--shadow-lg)",
                    }}>
                      <div style={{ padding: "var(--sp-3) var(--sp-4)", borderBottom: "1px solid var(--border)", marginBottom: "var(--sp-2)" }}>
                        <p style={{ fontWeight: 700, fontSize: ".875rem", color: "var(--text-1)" }}>{user?.name}</p>
                        <p style={{ fontSize: ".72rem", color: "var(--text-3)", marginTop: 2 }}>{user?.email}</p>
                      </div>
                      <Link to="/account" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "var(--sp-2) var(--sp-3)", borderRadius: "var(--r-sm)", fontSize: ".85rem", color: "var(--text-2)", transition: "all var(--t1)" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--gold)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}>
                        👤 Account
                      </Link>
                      <Link to="/orders" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "var(--sp-2) var(--sp-3)", borderRadius: "var(--r-sm)", fontSize: ".85rem", color: "var(--text-2)", transition: "all var(--t1)" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--gold)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}>
                        📦 Orders
                      </Link>
                      <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "var(--sp-3) var(--sp-3) var(--sp-2)", borderRadius: "var(--r-sm)", fontSize: ".85rem", color: "var(--crimson)", width: "100%", background: "transparent", transition: "background var(--t1)", borderTop: "1px solid var(--border)", marginTop: "var(--sp-1)" }} onMouseEnter={e => e.currentTarget.style.background = "var(--error-bg)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        🚪 Sign Out
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
          position: "fixed",
          bottom: 16,
          left: 16,
          right: 16,
          zIndex: 100,
          height: 64,
          background: dark ? "rgba(10,14,20,.3)" : "rgba(255,255,255,.3)",
          backdropFilter: "saturate(200%) blur(32px)",
          WebkitBackdropFilter: "saturate(200%) blur(32px)",
          border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid rgba(255,255,255,.6)",
          borderRadius: 32,
          display: "flex", alignItems: "center", justifyContent: "space-around",
          boxShadow: dark
            ? "0 8px 32px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06)"
            : "0 8px 32px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.8)",
        }}>
          {[
            { icon: "🏠", label: "Home", to: "/" },
            { icon: "🔍", label: "Search", to: "/?search=" },
            { icon: "📦", label: "Orders", to: "/orders" },
            { icon: "👤", label: "Account", to: "/account" },
          ].map(item => (
            <Link key={item.to} to={item.to} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "var(--sp-2) var(--sp-4)",
              color: dark ? "rgba(255,255,255,.6)" : "var(--text-3)",
              fontSize: ".58rem", fontWeight: 700, letterSpacing: ".05em",
              transition: "color var(--t1)", position: "relative", textTransform: "uppercase",
            }}>
              <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
              {item.label}
              {item.label === "Orders" && quauntity > 0 && (
                <span style={{ position: "absolute", top: 2, right: 6, width: 14, height: 14, borderRadius: "50%", background: "var(--gold)", color: "#fff", fontSize: ".55rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{quauntity}</span>
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
