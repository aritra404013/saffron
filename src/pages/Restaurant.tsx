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
  { key: "orders", icon: "📋", label: "Orders" },
  { key: "menu", icon: "🍽️", label: "Menu" },
  { key: "add-item", icon: "➕", label: "Add Item" },
  { key: "profile", icon: "🏪", label: "Profile" },
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
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.reload();
      }
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

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F6F3" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", animation: "float 2s ease-in-out infinite", marginBottom: 12 }}>🍽️</div>
        <p style={{ color: "#7A7A8C", fontSize: ".875rem" }}>Loading your restaurant...</p>
      </div>
    </div>
  );

  if (!restaurant) return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F7F6F3" }}>

      {/* ── SIDEBAR ───────────────────────────────────── */}
      <div style={{
        width: sidebarOpen ? 240 : 68,
        transition: "width 250ms ease",
        background: "#111118",
        color: "#fff",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
        overflowY: "auto", overflowX: "hidden",
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#F5A623,#D4891A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem", flexShrink: 0, boxShadow: "0 3px 10px rgba(245,166,35,.35)" }}>✦</div>
          {sidebarOpen && (
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: ".95rem", letterSpacing: "-.02em", whiteSpace: "nowrap" }}>
              Saffron<span style={{ color: "#F5A623" }}>Sky</span>
            </span>
          )}
        </div>

        {/* Restaurant info */}
        {sidebarOpen && (
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
            <p style={{ fontSize: ".65rem", color: "rgba(255,255,255,.35)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>Restaurant</p>
            <p style={{ fontWeight: 700, fontSize: ".875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{restaurant.name}</p>
            <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 999, background: restaurant.isOpen ? "rgba(16,185,129,.15)" : "rgba(255,255,255,.07)", color: restaurant.isOpen ? "#10B981" : "rgba(255,255,255,.35)", fontSize: ".68rem", fontWeight: 600 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              {restaurant.isOpen ? "Open" : "Closed"}
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              style={{
                display: "flex", alignItems: "center",
                gap: sidebarOpen ? 10 : 0,
                justifyContent: sidebarOpen ? "flex-start" : "center",
                width: "100%",
                padding: sidebarOpen ? "10px 12px" : "10px",
                borderRadius: 10, marginBottom: 2,
                background: tab === item.key ? "rgba(245,166,35,.15)" : "transparent",
                color: tab === item.key ? "#F5A623" : "rgba(255,255,255,.55)",
                border: tab === item.key ? "1px solid rgba(245,166,35,.2)" : "1px solid transparent",
                cursor: "pointer", textAlign: "left",
                transition: "all 150ms",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => { if (tab !== item.key) { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "#fff"; } }}
              onMouseLeave={e => { if (tab !== item.key) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.55)"; } }}
            >
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontWeight: 600, fontSize: ".83rem" }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom controls */}
        <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,.07)" }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "flex-start" : "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 10, background: "transparent", color: "rgba(255,255,255,.35)", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: ".8rem" }}
          >
            <span style={{ fontSize: ".9rem" }}>{sidebarOpen ? "◀" : "▶"}</span>
            {sidebarOpen && "Collapse"}
          </button>
          <button
            onClick={logout}
            style={{ display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "flex-start" : "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 10, background: "transparent", color: "rgba(255,255,255,.35)", border: "none", cursor: "pointer", marginTop: 2, fontFamily: "inherit", fontSize: ".8rem" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.35)"; e.currentTarget.style.background = "transparent"; }}
          >
            <span>🚪</span>
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────── */}
      <main style={{ flex: 1, overflow: "auto", padding: "28px 28px" }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.35rem", letterSpacing: "-.03em", color: "#111118" }}>
              {NAV_ITEMS.find(n => n.key === tab)?.label}
            </h1>
            <p style={{ color: "#7A7A8C", fontSize: ".78rem", marginTop: 3 }}>{restaurant.name}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 12px", borderRadius: 999,
              background: restaurant.isVerified ? "#D1FAE5" : "#FEF3C7",
              color: restaurant.isVerified ? "#065F46" : "#92400E",
              fontSize: ".72rem", fontWeight: 700,
            }}>
              {restaurant.isVerified ? "✓ Verified" : "⏳ Pending Verification"}
            </span>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#F5A623,#D4891A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: ".8rem", boxShadow: "0 3px 10px rgba(245,166,35,.35)" }}>
              {user?.name?.[0]?.toUpperCase() || "S"}
            </div>
          </div>
        </div>

        {/* Tab content */}
        {tab === "orders" && <RestaurantOrders restaurantId={restaurant._id} />}
        {tab === "menu" && (
          menuItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: "#7A7A8C" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🍽️</div>
              <p style={{ fontWeight: 600, marginBottom: 16 }}>No menu items yet</p>
              <button
                onClick={() => setTab("add-item")}
                style={{ padding: "10px 24px", borderRadius: 999, background: "linear-gradient(135deg,#F5A623,#D4891A)", color: "#fff", fontWeight: 700, fontSize: ".875rem", border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(245,166,35,.35)", fontFamily: "inherit" }}
              >
                Add your first item
              </button>
            </div>
          ) : (
            <MenuItems items={menuItems} onItemDeleted={() => fetchMenuItems(restaurant._id)} isSeller={true} />
          )
        )}
        {tab === "add-item" && (
          <AddMenuItem onItemAdded={() => { fetchMenuItems(restaurant._id); setTab("menu"); }} />
        )}
        {tab === "profile" && (
          <RestaurantProfile restaurant={restaurant} onUpdate={setRestaurant} isSeller={true} />
        )}
      </main>
    </div>
  );
};

export default Restaurant;
