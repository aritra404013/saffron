import { Link, useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
  };

  return (
    <div className="page-pad">
      <div className="container" style={{ maxWidth: 480 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 3, height: 20, borderRadius: 99, background: "linear-gradient(180deg, #F5A623, #D4891A)" }} />
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-.03em", color: "#111118" }}>Account</h1>
        </div>

        {/* Profile card */}
        <div style={{
          padding: 28, marginBottom: 16,
          background: "#111118",
          borderRadius: 20,
          border: "1px solid rgba(245,166,35,.15)",
          boxShadow: "0 4px 24px rgba(0,0,0,.12)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #F5A623, #D4891A)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: "1.5rem",
              boxShadow: "0 4px 16px rgba(245,166,35,.4)",
            }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#fff", marginBottom: 4 }}>{user?.name}</h2>
              <p style={{ color: "rgba(255,255,255,.4)", fontSize: ".78rem" }}>{user?.email}</p>
              <span style={{
                display: "inline-flex", alignItems: "center",
                marginTop: 8, padding: "2px 10px",
                borderRadius: 999,
                background: "rgba(245,166,35,.15)", border: "1px solid rgba(245,166,35,.25)",
                color: "#F5A623", fontSize: ".65rem", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase",
              }}>
                {user?.role || "customer"}
              </span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {[
            { icon: "📦", label: "My Orders", sub: "View your order history", to: "/orders" },
            { icon: "📍", label: "Saved Addresses", sub: "Manage delivery addresses", to: "/address" },
          ].map(item => (
            <Link key={item.to} to={item.to} style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "16px 20px",
              background: "#fff", borderRadius: 16,
              border: "1.5px solid #E8E5DF",
              textDecoration: "none",
              transition: "all 200ms ease",
              boxShadow: "0 1px 4px rgba(0,0,0,.04)",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#F5A623"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(245,166,35,.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E8E5DF"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)"; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: "#111118", fontSize: ".875rem" }}>{item.label}</p>
                <p style={{ fontSize: ".73rem", color: "#7A7A8C", marginTop: 2 }}>{item.sub}</p>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B0B0BE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
          ))}
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "14px 20px",
            background: "#FEF2F2", borderRadius: 16,
            border: "1.5px solid rgba(239,68,68,.15)",
            fontWeight: 700, color: "#EF4444", cursor: "pointer", fontSize: ".875rem",
            transition: "all 150ms", fontFamily: "inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.borderColor = "rgba(239,68,68,.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.borderColor = "rgba(239,68,68,.15)"; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Account;
