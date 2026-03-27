import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../main";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import RiderAdmin from "../components/RiderAdmin";
import { useAppData } from "../context/AppContext";

const TABS = [
  { key: "restaurant" as const, icon: "🍽️", label: "Restaurants" },
  { key: "rider" as const, icon: "🛵", label: "Riders" },
];

const Admin = () => {
  const { user, setUser, setIsAuth } = useAppData();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"restaurant" | "rider">("restaurant");

  const fetchData = async () => {
    try {
      const [rRes, ridRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/restaurant/pending`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        axios.get(`${BASE_URL}/api/admin/rider/pending`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
      ]);
      setRestaurants(rRes.data.restaurants);
      setRiders(ridRes.data.riders);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const logout = () => { localStorage.removeItem("token"); setUser(null); setIsAuth(false); };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface-2)" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "var(--charcoal)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto", flexShrink: 0 }}>
        <div style={{ padding: "var(--sp-5) var(--sp-4)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "var(--r-md)", background: "linear-gradient(135deg,#F5A623,#D4891A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem", boxShadow: "0 3px 10px rgba(245,166,35,.35)" }}>✦</div>
            <span style={{ fontFamily: "'Syne',sans-serif", color: "#fff", fontWeight: 800, fontSize: ".9rem" }}>Saffron Sky admin</span>
          </div>
        </div>
        <div style={{ padding: "var(--sp-4)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "var(--sp-1)" }}>Logged in as</p>
          <p style={{ color: "#fff", fontWeight: 600, fontSize: ".875rem" }}>{user?.name}</p>
        </div>
        <nav style={{ flex: 1, padding: "var(--sp-3) var(--sp-2)" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", width: "100%", padding: "var(--sp-3)", borderRadius: "var(--r-md)", marginBottom: "var(--sp-1)", background: tab === t.key ? "rgba(245,166,35,.15)" : "transparent", color: tab === t.key ? "#F5A623" : "rgba(255,255,255,.6)", border: tab === t.key ? "1px solid rgba(245,166,35,.2)" : "1px solid transparent", cursor: "pointer", fontSize: ".875rem", fontWeight: 600, textAlign: "left", transition: "all var(--t1)", fontFamily: "inherit" }}
              onMouseEnter={e => { if (tab !== t.key) { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "#fff"; } }}
              onMouseLeave={e => { if (tab !== t.key) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.6)"; } }}
            >
              <span style={{ fontSize: "1rem" }}>{t.icon}</span> {t.label}
              <span style={{ marginLeft: "auto", background: "rgba(255,255,255,.1)", padding: "2px 8px", borderRadius: "var(--r-full)", fontSize: ".7rem" }}>
                {t.key === "restaurant" ? restaurants.length : riders.length}
              </span>
            </button>
          ))}
        </nav>
        <div style={{ padding: "var(--sp-3) var(--sp-2)", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", color: "rgba(255,255,255,.4)", background: "transparent", border: "none", cursor: "pointer", padding: "var(--sp-2) var(--sp-3)", fontSize: ".8rem", width: "100%" }}>🚪 Logout</button>
        </div>
      </div>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", padding: "var(--sp-6)" }}>
        {/* Header */}
        <div style={{ marginBottom: "var(--sp-6)" }}>
          <h1 style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-.03em" }}>
            {TABS.find(t => t.key === tab)?.icon} {TABS.find(t => t.key === tab)?.label} — Pending Verification
          </h1>
          <p style={{ color: "var(--text-3)", fontSize: ".85rem", marginTop: 4 }}>
            Review and verify {tab === "restaurant" ? "restaurant" : "rider"} applications
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--sp-4)", marginBottom: "var(--sp-6)" }}>
          {[
            { icon: "🍽️", label: "Pending Restaurants", value: restaurants.length, color: "#F5A623" },
            { icon: "🛵", label: "Pending Riders", value: riders.length, color: "var(--success)" },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: "var(--sp-5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>{stat.icon}</div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: "1.6rem", color: stat.color }}>{stat.value}</p>
                  <p style={{ color: "var(--text-3)", fontSize: ".75rem" }}>{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--sp-4)" }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: "var(--r-xl)" }} />)}
          </div>
        ) : tab === "restaurant" ? (
          restaurants.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--sp-16) 0", color: "var(--text-3)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "var(--sp-3)" }}>✅</div>
              <p>No pending restaurant verifications</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--sp-4)" }}>
              {restaurants.map(r => <AdminRestaurantCard key={r._id} restaurant={r} onVerify={fetchData} />)}
            </div>
          )
        ) : (
          riders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--sp-16) 0", color: "var(--text-3)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "var(--sp-3)" }}>✅</div>
              <p>No pending rider verifications</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--sp-4)" }}>
              {riders.map(r => <RiderAdmin key={r._id} rider={r} onVerify={fetchData} />)}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default Admin;
