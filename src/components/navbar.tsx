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
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        height: "var(--nav-h)",
        background: "rgba(255,255,255,.95)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid #EEECEA",
        display: "flex", alignItems: "center",
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 16 }}>

          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, textDecoration: "none" }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "linear-gradient(135deg, #F5A623, #D4891A)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".95rem", boxShadow: "0 3px 12px rgba(245,166,35,.35)", flexShrink: 0,
            }}>✦</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#111118", letterSpacing: "-.03em" }}>
              Saffron<span style={{ color: "#F5A623" }}>Sky</span>
            </span>
          </Link>

          {/* Location */}
          <div className="hide-mobile" style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 12px", borderRadius: 999,
            border: "1.5px solid #E8E5DF", background: "#F7F6F3",
            cursor: "pointer", flexShrink: 0,
            transition: "border-color 150ms",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#F5A623"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#E8E5DF"}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span style={{ fontSize: ".75rem", fontWeight: 600, color: "#3D3D4A", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {city}
            </span>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480 }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B0B0BE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search restaurants, cuisines..."
                style={{
                  width: "100%",
                  padding: "8px 14px 8px 34px",
                  border: "1.5px solid #E8E5DF",
                  borderRadius: 999,
                  background: "#F7F6F3",
                  color: "#111118",
                  fontSize: ".83rem",
                  transition: "border-color 150ms, box-shadow 150ms, background 150ms",
                  fontFamily: "inherit",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "#F5A623";
                  e.target.style.boxShadow = "0 0 0 3px rgba(245,166,35,.15)";
                  e.target.style.background = "#fff";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "#E8E5DF";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "#F7F6F3";
                }}
              />
            </div>
          </form>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexShrink: 0 }}>
            {isAuth ? (
              <>
                <Link to="/cart" className="hide-mobile" style={{
                  position: "relative",
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 999,
                  border: "1.5px solid #E8E5DF", background: "#fff",
                  fontSize: ".8rem", fontWeight: 600, color: "#3D3D4A",
                  transition: "all 150ms", textDecoration: "none",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#F5A623"; e.currentTarget.style.color = "#D4891A"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E8E5DF"; e.currentTarget.style.color = "#3D3D4A"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Cart
                  {quauntity > 0 && (
                    <span style={{
                      position: "absolute", top: -5, right: -5,
                      width: 17, height: 17, borderRadius: "50%",
                      background: "#F5A623", color: "#fff",
                      fontSize: ".58rem", fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(245,166,35,.5)",
                    }}>{quauntity}</span>
                  )}
                </Link>

                <Link to="/orders" className="hide-mobile" style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 999,
                  border: "1.5px solid #E8E5DF", background: "#fff",
                  fontSize: ".8rem", fontWeight: 600, color: "#3D3D4A",
                  transition: "all 150ms", textDecoration: "none",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#F5A623"; e.currentTarget.style.color = "#D4891A"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E8E5DF"; e.currentTarget.style.color = "#3D3D4A"; }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Orders
                </Link>

                {/* Avatar */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: "linear-gradient(135deg, #F5A623, #D4891A)",
                      color: "#fff", fontWeight: 800, fontSize: ".8rem",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 3px 10px rgba(245,166,35,.4)", border: "none",
                      transition: "transform 150ms",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.07)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  >
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </button>

                  {menuOpen && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setMenuOpen(false)} />
                      <div style={{
                        position: "absolute", right: 0, top: "calc(100% + 8px)",
                        minWidth: 196, zIndex: 200,
                        background: "#fff", borderRadius: 16,
                        border: "1px solid #E8E5DF",
                        boxShadow: "0 8px 32px rgba(0,0,0,.1), 0 2px 8px rgba(0,0,0,.06)",
                        padding: 6, overflow: "hidden",
                        animation: "fadeIn .15s ease both",
                      }}>
                        <div style={{ padding: "10px 12px 10px", borderBottom: "1px solid #F0EDE8", marginBottom: 4 }}>
                          <p style={{ fontWeight: 700, fontSize: ".85rem", color: "#111118" }}>{user?.name}</p>
                          <p style={{ fontSize: ".72rem", color: "#7A7A8C", marginTop: 2 }}>{user?.email}</p>
                        </div>
                        {[
                          { label: "Account", to: "/account" },
                          { label: "Orders", to: "/orders" },
                        ].map(item => (
                          <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} style={{
                            display: "flex", alignItems: "center",
                            padding: "8px 12px", borderRadius: 10,
                            fontSize: ".83rem", color: "#3D3D4A",
                            transition: "background 120ms", textDecoration: "none",
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = "#F7F6F3"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            {item.label}
                          </Link>
                        ))}
                        <div style={{ borderTop: "1px solid #F0EDE8", marginTop: 4, paddingTop: 4 }}>
                          <button onClick={logout} style={{
                            display: "flex", alignItems: "center",
                            padding: "8px 12px", borderRadius: 10,
                            fontSize: ".83rem", color: "#EF4444", width: "100%",
                            background: "transparent", transition: "background 120ms",
                            cursor: "pointer",
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = "#FEE2E2"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" style={{
                padding: "8px 18px", borderRadius: 999,
                background: "linear-gradient(135deg, #F5A623, #D4891A)",
                color: "#fff", fontWeight: 700, fontSize: ".82rem",
                boxShadow: "0 3px 12px rgba(245,166,35,.35)",
                transition: "transform 150ms, box-shadow 150ms",
                textDecoration: "none", display: "inline-flex", alignItems: "center",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(245,166,35,.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 3px 12px rgba(245,166,35,.35)"; }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────── */}
      {isAuth && (
        <nav className="hide-desktop" style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
          height: "var(--bottom-nav-h)",
          background: "rgba(255,255,255,.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid #EEECEA",
          display: "flex", alignItems: "center", justifyContent: "space-around",
        }}>
          {[
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label: "Home", to: "/" },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>, label: "Search", to: "/?search=" },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, label: "Orders", to: "/orders" },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label: "Account", to: "/account" },
          ].map(item => (
            <Link key={item.to} to={item.to} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: 8, color: "#B0B0BE",
              fontSize: ".58rem", fontWeight: 600, letterSpacing: ".03em",
              transition: "color 150ms", position: "relative", textDecoration: "none",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#F5A623"}
              onMouseLeave={e => e.currentTarget.style.color = "#B0B0BE"}
            >
              {item.icon}
              {item.label}
              {item.label === "Orders" && quauntity > 0 && (
                <span style={{
                  position: "absolute", top: 4, right: 6,
                  width: 13, height: 13, borderRadius: "50%",
                  background: "#F5A623", color: "#fff",
                  fontSize: ".48rem", fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{quauntity}</span>
              )}
            </Link>
          ))}
        </nav>
      )}

      {isAuth && user?.role === "customer" && <FloatingCartBar />}
    </>
  );
};

export default Navbar;
