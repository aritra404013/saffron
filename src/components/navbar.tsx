import { Link, useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import FloatingCartBar from "./FloatingCartBar";

const Navbar = () => {
  const { user, isAuth, setUser, setIsAuth, quauntity } = useAppData();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark] = useState(() => localStorage.getItem("theme") === "dark");

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

  return (
    <>
      {/* â”€â”€ DESKTOP / TOP NAV â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header className="hide-mobile" style={{
        position: "sticky", top: 0, zIndex: 100, width: "100%",
        background: "rgba(255, 248, 246, 0.9)", // surface/90
        backdropFilter: "blur(12px)",
        boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "var(--sp-4) 20px", width: "100%", maxWidth: 1280, margin: "0 auto"
        }}>
          {/* Logo */}
          <Link to="/" style={{ fontSize: "24px", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>Foodify</span>
          </Link>

          {/* Nav Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "var(--sp-8)" }}>
            <Link to="/explore" style={{ color: "var(--primary)", fontWeight: 600, fontSize: "14px", borderBottom: "2px solid var(--primary)", paddingBottom: "4px", textDecoration: "none", transition: "color var(--t1)" }}>Explore</Link>
            <Link to="/offers" style={{ color: "var(--text-2)", fontSize: "14px", textDecoration: "none", transition: "color var(--t1)" }} onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-2)"}>Offers</Link>
            <Link to="/support" style={{ color: "var(--text-2)", fontSize: "14px", textDecoration: "none", transition: "color var(--t1)" }} onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-2)"}>Support</Link>
          </nav>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)" }}>
            <button style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", transition: "color var(--t1)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>location_on</span>
            </button>
            <Link to="/cart" style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", position: "relative", transition: "color var(--t1)", textDecoration: "none" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>shopping_cart</span>
              {quauntity > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  background: "var(--primary)", color: "var(--on-primary)",
                  fontSize: "10px", fontWeight: 500,
                  width: 16, height: 16, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>{quauntity}</span>
              )}
            </Link>
            <button style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", transition: "color var(--t1)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>notifications</span>
            </button>
            
            <div style={{ position: "relative", marginLeft: "var(--sp-2)" }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  border: "2px solid var(--surface-warm)",
                  overflow: "hidden", cursor: "pointer", background: "none", padding: 0
                }}
              >
                <img alt="User profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAM_vswh64EB9YmLIUjld5VF7KXQkb2pi-20630_aULZ8I0KWMn2q0s7TWiLVrcEkh75pyNXD11XOMYqk8cTkp6XnL0R6PIY7K0z5JgRKPdAmmAx_v8YVlGiAHEzDVdnvZJftOwxXekvdA2NxwdJzghlIM15thbKeB6Jj4cRPP3j--lCRs1mkxQf78TPzesYOAwLbbYeGbLUPSMmjGyw7qHgd_QisrQym-NuOrg3Zv9vuGF-koVyjL5M4Cf_LB-2uqhpA8QUIg4smI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
              {menuOpen && (
                <div className="card anim-scale-in" style={{
                  position: "absolute", right: 0, top: "calc(100% + 10px)",
                  minWidth: 200, zIndex: 200, padding: "var(--sp-2)",
                  boxShadow: "var(--shadow-lg)",
                }}>
                  <div style={{ padding: "var(--sp-3) var(--sp-4)", borderBottom: "1px solid var(--border)", marginBottom: "var(--sp-2)" }}>
                    <p style={{ fontWeight: 700, fontSize: ".875rem", color: "var(--text-1)" }}>{user?.name || "Guest User"}</p>
                    <p style={{ fontSize: ".72rem", color: "var(--text-3)", marginTop: 2 }}>{user?.email || "guest@example.com"}</p>
                  </div>
                  <Link to="/account" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "var(--sp-2) var(--sp-3)", borderRadius: "var(--r-sm)", fontSize: ".85rem", color: "var(--text-2)", transition: "all var(--t1)", textDecoration: "none" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--primary)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}>
                    ðŸ‘¤ Account
                  </Link>
                  <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "var(--sp-3) var(--sp-3) var(--sp-2)", borderRadius: "var(--r-sm)", fontSize: ".85rem", color: "var(--crimson)", width: "100%", background: "transparent", transition: "background var(--t1)", borderTop: "1px solid var(--border)", marginTop: "var(--sp-1)", borderLeft: "none", borderRight: "none", borderBottom: "none", cursor: "pointer", textAlign: "left" }} onMouseEnter={e => e.currentTarget.style.background = "var(--error-bg)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    ðŸšª Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* â”€â”€ MOBILE BOTTOM NAV â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <nav className="hide-desktop" style={{
        position: "fixed", bottom: 0, left: 0, width: "100%",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "var(--sp-2) var(--sp-4) calc(var(--sp-2) + env(safe-area-inset-bottom))",
        background: "var(--surface)",
        boxShadow: "0px -4px 12px rgba(45,52,70,0.05)",
        borderRadius: "16px 16px 0 0", zIndex: 100,
      }}>
        <Link to="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--success-bg)", color: "var(--success)", borderRadius: "9999px", padding: "4px 16px", textDecoration: "none" }}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span style={{ fontSize: "12px", fontWeight: 500, marginTop: "4px" }}>Home</span>
        </Link>
        <Link to="/search" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-2)", textDecoration: "none", padding: "4px" }} onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-2)"}>
          <span className="material-symbols-outlined">search</span>
          <span style={{ fontSize: "12px", fontWeight: 500, marginTop: "4px" }}>Search</span>
        </Link>
        <Link to="/orders" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-2)", textDecoration: "none", padding: "4px" }} onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-2)"}>
          <span className="material-symbols-outlined">receipt_long</span>
          <span style={{ fontSize: "12px", fontWeight: 500, marginTop: "4px" }}>Orders</span>
        </Link>
        <Link to="/account" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-2)", textDecoration: "none", padding: "4px" }} onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-2)"}>
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span style={{ fontSize: "12px", fontWeight: 500, marginTop: "4px" }}>Earnings</span>
        </Link>
      </nav>

      {/* ── FLOATING CART BAR (mobile) ───────────────────────── */}
      {isAuth && user?.role === "customer" && <FloatingCartBar />}
    </>
  );
};

export default Navbar;
