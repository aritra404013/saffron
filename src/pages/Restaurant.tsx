import { useEffect, useState } from "react";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { BASE_URL } from "../main";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import AddMenuItem from "../components/AddMenuItem";
import RestaurantOrders from "../components/RestaurantOrders";
import { useAppData } from "../context/AppContext";

type Tab = "orders" | "menu" | "add-item" | "profile";

const NAV_ITEMS: { key: Tab; icon: string; label: string }[] = [
  { key: "orders",    icon: "📋", label: "Orders" },
  { key: "menu",      icon: "🍽️", label: "Menu" },
  { key: "add-item",  icon: "➕", label: "Add Item" },
  { key: "profile",   icon: "🏪", label: "Profile" },
];

const Restaurant = () => {
  const { user, setUser, setIsAuth } = useAppData();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("orders");
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/restaurant/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRestaurant(data.restaurant || null);
      if (data.token) { localStorage.setItem("token", data.token); window.location.reload(); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const fetchMenuItems = async (id: string) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/item/all/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMenuItems(data);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchMyRestaurant(); }, []);
  useEffect(() => { if (restaurant?._id) fetchMenuItems(restaurant._id); }, [restaurant]);

  const logout = () => { localStorage.removeItem("token"); setUser(null); setIsAuth(false); };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", animation: "float 2s ease-in-out infinite", marginBottom: "var(--sp-3)" }}>🍽️</div>
        <p style={{ color: "var(--text-3)" }}>Loading your restaurant...</p>
      </div>
    </div>
  );

  if (!restaurant) return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface-2)" }}>
      {/* ── SIDEBAR ───────────────────────────────────── */}
      <div style={{
        width: sidebarOpen ? 240 : 72, transition: "width var(--t2)",
        background: "var(--charcoal)", color: "#fff",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto", flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "var(--sp-5) var(--sp-4)", display: "flex", alignItems: "center", gap: "var(--sp-3)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ width: 36, height: 36, borderRadius: "var(--r-md)", background: "linear-gradient(135deg,var(--crimson),var(--crimson-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>🍅</div>
          {sidebarOpen && <span style={{ fontWeight: 800, fontSize: ".95rem", letterSpacing: "-.02em" }}>tomato seller</span>}
        </div>

        {/* Restaurant name */}
        {sidebarOpen && (
          <div style={{ padding: "var(--sp-4)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
            <p style={{ fontSize: ".7rem", color: "rgba(255,255,255,.4)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "var(--sp-1)" }}>Restaurant</p>
            <p style={{ fontWeight: 700, fontSize: ".9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{restaurant.name}</p>
            <div style={{ marginTop: "var(--sp-2)", display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: "var(--r-full)", background: restaurant.isOpen ? "rgba(16,185,129,.2)" : "rgba(255,255,255,.08)", color: restaurant.isOpen ? "var(--success)" : "rgba(255,255,255,.4)", fontSize: ".7rem", fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              {restaurant.isOpen ? "Open" : "Closed"}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "var(--sp-3) var(--sp-2)" }}>
          {NAV_ITEMS.map(item => (
            <button key={item.key} onClick={() => setTab(item.key)} style={{
              display: "flex", alignItems: "center", gap: "var(--sp-3)",
              width: "100%", padding: sidebarOpen ? "var(--sp-3) var(--sp-3)" : "var(--sp-3)",
              borderRadius: "var(--r-md)", marginBottom: "var(--sp-1)",
              background: tab === item.key ? "rgba(226,55,68,.2)" : "transparent",
              color: tab === item.key ? "var(--crimson-light)" : "rgba(255,255,255,.6)",
              border: "none", cursor: "pointer", textAlign: "left",
              transition: "all var(--t1)",
              justifyContent: sidebarOpen ? "flex-start" : "center",
            }}
            onMouseEnter={e => { if (tab !== item.key) { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "#fff"; } }}
            onMouseLeave={e => { if (tab !== item.key) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.6)"; } }}
            >
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontWeight: 600, fontSize: ".875rem" }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "var(--sp-3) var(--sp-2)", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", width: "100%", padding: "var(--sp-3)", borderRadius: "var(--r-md)", background: "transparent", color: "rgba(255,255,255,.4)", border: "none", cursor: "pointer", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
            <span>{sidebarOpen ? "◀" : "▶"}</span>
            {sidebarOpen && <span style={{ fontSize: ".8rem" }}>Collapse</span>}
          </button>
          <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", width: "100%", padding: "var(--sp-3)", borderRadius: "var(--r-md)", background: "transparent", color: "rgba(255,255,255,.4)", border: "none", cursor: "pointer", marginTop: "var(--sp-1)", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
            <span>🚪</span>
            {sidebarOpen && <span style={{ fontSize: ".8rem" }}>Logout</span>}
          </button>
        </div>
      </div>

      {/* ── MAIN ──────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: "auto", padding: "var(--sp-6)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-6)" }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-.03em" }}>
              {NAV_ITEMS.find(n => n.key === tab)?.icon} {NAV_ITEMS.find(n => n.key === tab)?.label}
            </h1>
            <p style={{ color: "var(--text-3)", fontSize: ".8rem", marginTop: 2 }}>{restaurant.name}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
            <span className={`badge ${restaurant.isVerified ? "badge-green" : "badge-gold"}`}>
              {restaurant.isVerified ? "✓ Verified" : "⏳ Pending"}
            </span>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--crimson),var(--crimson-dark))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: ".85rem" }}>
              {user?.name?.[0]?.toUpperCase() || "S"}
            </div>
          </div>
        </div>

        {/* Content */}
        {tab === "orders" && <RestaurantOrders restaurantId={restaurant._id} />}
        {tab === "menu" && (
          menuItems.length === 0
            ? <div style={{ textAlign: "center", padding: "var(--sp-16) 0", color: "var(--text-3)" }}><div style={{ fontSize: "2.5rem", marginBottom: "var(--sp-3)" }}>🍽️</div><p>No menu items yet.</p><button className="btn btn-primary btn-sm" style={{ marginTop: "var(--sp-4)" }} onClick={() => setTab("add-item")}>Add your first item</button></div>
            : <MenuItems items={menuItems} onItemDeleted={() => fetchMenuItems(restaurant._id)} isSeller={true} />
        )}
        {tab === "add-item" && <AddMenuItem onItemAdded={() => { fetchMenuItems(restaurant._id); setTab("menu"); }} />}
        {tab === "profile" && <RestaurantProfile restaurant={restaurant} onUpdate={setRestaurant} isSeller={true} />}
      </main>
    </div>
  );
};

export default Restaurant;
