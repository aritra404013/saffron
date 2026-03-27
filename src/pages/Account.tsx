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
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "1.8rem", letterSpacing: ".01em", marginBottom: "var(--sp-6)" }}>Account</h1>

        {/* Profile card */}
        <div className="card anim-fade-up" style={{ padding: "var(--sp-8)", textAlign: "center", marginBottom: "var(--sp-4)", background: "linear-gradient(135deg, var(--surface-warm), var(--surface))" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", margin: "0 auto var(--sp-4)",
            background: "linear-gradient(135deg, var(--gold-light), var(--gold))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: "2rem",
            boxShadow: "var(--shadow-gold)",
          }}>
            {user?.image
              ? <img src={user.image} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "1.4rem", marginBottom: "var(--sp-1)" }}>{user?.name}</h2>
          <p style={{ color: "var(--text-3)", fontSize: ".875rem" }}>{user?.email}</p>
          <span className="badge badge-gold" style={{ margin: "var(--sp-3) auto 0", display: "inline-flex" }}>
            {user?.role || "customer"}
          </span>
        </div>

        {/* Quick links */}
        {[
          { icon: "📦", label: "My Orders", to: "/orders" },
          { icon: "📍", label: "Saved Addresses", to: "/address" },
        ].map(item => (
          <Link key={item.to} to={item.to} style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "var(--sp-4) var(--sp-5)", background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", marginBottom: "var(--sp-3)", textDecoration: "none", transition: "all var(--t1)", boxShadow: "var(--shadow-sm)" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = ""; }}
          >
            <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
            <span style={{ fontWeight: 600, color: "var(--text-1)", flex: 1 }}>{item.label}</span>
            <span style={{ color: "var(--text-4)" }}>›</span>
          </Link>
        ))}

        <button
          onClick={logout}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "var(--sp-4) var(--sp-5)", background: "var(--error-bg)", borderRadius: "var(--r-xl)", border: "1.5px solid rgba(196,45,57,.2)", fontWeight: 700, color: "var(--crimson)", cursor: "pointer", fontSize: ".9rem", marginTop: "var(--sp-2)" }}
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Account;
