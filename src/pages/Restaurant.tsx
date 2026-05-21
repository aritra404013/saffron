import { useEffect, useState } from "react";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { BASE_URL } from "../config";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import AddMenuItem from "../components/AddMenuItem";
import RestaurantOrders from "../components/RestaurantOrders";
import RestaurantDashboard from "../components/RestaurantDashboard";
import RestaurantEarnings from "../components/RestaurantEarnings";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";

type Tab = "dashboard" | "orders" | "menu" | "earnings" | "analytics" | "settings" | "help";

const NAV_ITEMS: { key: Tab; icon: string; label: string }[] = [
  { key: "dashboard", icon: "dashboard", label: "Dashboard" },
  { key: "orders", icon: "restaurant_menu", label: "Orders" },
  { key: "menu", icon: "edit_note", label: "Menu Editor" },
  { key: "earnings", icon: "payments", label: "Earnings" },
  { key: "analytics", icon: "trending_up", label: "Analytics" },
  { key: "settings", icon: "settings", label: "Settings" },
  { key: "help", icon: "help", label: "Help Center" },
];

const Restaurant = () => {
  const { user, setUser, setIsAuth } = useAppData();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [togglingKitchen, setTogglingKitchen] = useState(false);

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

  const toggleKitchen = async () => {
    if (!restaurant) return;
    try {
      setTogglingKitchen(true);
      const { data } = await axios.put(
        `${BASE_URL}/api/restaurant/status`,
        { status: !restaurant.isOpen },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(data.message);
      setRestaurant({ ...restaurant, isOpen: data.restaurant.isOpen });
    } catch (err: any) { toast.error(err?.response?.data?.message || "Failed"); }
    finally { setTogglingKitchen(false); }
  };

  useEffect(() => { fetchMyRestaurant(); }, []);
  useEffect(() => { if (restaurant?._id) fetchMenuItems(restaurant._id); }, [restaurant]);

  const logout = async () => {
    try {
      await axios.put(`${BASE_URL}/api/restaurant/status`, { status: false }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch { /* ignore */ }
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)" }}>
      <div style={{ textAlign: "center" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--primary)", animation: "float 2s ease-in-out infinite", display: "block", marginBottom: "var(--sp-3)" }}>storefront</span>
        <p style={{ color: "var(--text-3)" }}>Loading your restaurant...</p>
      </div>
    </div>
  );

  if (!restaurant) return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;

  const pageTitle = NAV_ITEMS.find(n => n.key === tab)?.label || "Dashboard";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface-2)" }}>

      {/* ═══════ SIDEBAR ═══════════════════════════════ */}
      <aside style={{
        width: sidebarOpen ? 250 : 72,
        transition: "width 300ms cubic-bezier(.4,0,.2,1)",
        background: "linear-gradient(180deg, #1a1210 0%, var(--charcoal) 100%)",
        color: "#fff",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
        overflowY: "auto", overflowX: "hidden", flexShrink: 0,
        boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
        zIndex: 10,
      }}>

        {/* Logo */}
        <div style={{
          padding: sidebarOpen ? "var(--sp-5) var(--sp-4)" : "var(--sp-5) var(--sp-2)",
          display: "flex", alignItems: "center", gap: "var(--sp-3)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          justifyContent: sidebarOpen ? "flex-start" : "center",
        }}>
          <img src="/logo.png" alt="Foodify" style={{ height: 36, objectFit: "contain" }} />
          {sidebarOpen && (
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: ".95rem", letterSpacing: "-.02em" }}>
              Vendor Central
            </span>
          )}
        </div>

        {/* Kitchen Status Toggle */}
        <div style={{
          padding: sidebarOpen ? "var(--sp-4)" : "var(--sp-3) var(--sp-2)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}>
          {sidebarOpen && (
            <p style={{ fontSize: ".68rem", color: "rgba(255,255,255,.35)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: "var(--sp-2)" }}>
              Kitchen Status
            </p>
          )}
          <button
            onClick={toggleKitchen}
            disabled={togglingKitchen}
            style={{
              width: "100%",
              padding: sidebarOpen ? "8px 12px" : "8px",
              borderRadius: 10, border: "none", cursor: "pointer",
              background: restaurant.isOpen ? "rgba(0,109,55,0.2)" : "rgba(186,26,26,0.2)",
              display: "flex", alignItems: "center", gap: 8,
              justifyContent: sidebarOpen ? "flex-start" : "center",
              transition: "all var(--t2)",
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: restaurant.isOpen ? "#4ade80" : "#f87171",
              animation: restaurant.isOpen ? "livePulse 1.5s infinite" : "none",
              flexShrink: 0,
            }} />
            {sidebarOpen && (
              <span style={{
                fontWeight: 700, fontSize: ".78rem",
                color: restaurant.isOpen ? "#4ade80" : "#f87171",
              }}>
                {togglingKitchen ? "Updating..." : restaurant.isOpen ? "Open" : "Closed"}
              </span>
            )}
          </button>
        </div>

        {/* Restaurant Name */}
        {sidebarOpen && (
          <div style={{ padding: "var(--sp-3) var(--sp-4)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            <p style={{ fontWeight: 700, fontSize: ".85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {restaurant.name}
            </p>
            <p style={{ fontSize: ".7rem", color: "rgba(255,255,255,.35)", marginTop: 2 }}>
              {restaurant.isVerified ? "✓ Verified" : "⏳ Pending Verification"}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "var(--sp-3) var(--sp-2)" }}>
          {NAV_ITEMS.map(item => {
            const isActive = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { setTab(item.key); setAddingItem(false); }}
                style={{
                  display: "flex", alignItems: "center",
                  gap: "var(--sp-3)",
                  width: "100%",
                  padding: sidebarOpen ? "10px 12px" : "10px",
                  borderRadius: 10, marginBottom: 2,
                  background: isActive ? "rgba(168,57,0,.25)" : "transparent",
                  color: isActive ? "#ffb59a" : "rgba(255,255,255,.5)",
                  border: "none", cursor: "pointer", textAlign: "left",
                  transition: "all 150ms ease",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  position: "relative",
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "#fff"; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; } }}
              >
                {isActive && (
                  <div style={{
                    position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)",
                    width: 3, height: 20, borderRadius: 4,
                    background: "var(--gold-light)",
                  }} />
                )}
                <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0 }}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span style={{ fontWeight: isActive ? 700 : 500, fontSize: ".85rem" }}>{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: "var(--sp-3) var(--sp-2)", borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: "flex", alignItems: "center", gap: "var(--sp-3)",
              width: "100%", padding: "10px 12px", borderRadius: 10,
              background: "transparent", color: "rgba(255,255,255,.35)",
              border: "none", cursor: "pointer",
              justifyContent: sidebarOpen ? "flex-start" : "center",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20, transition: "transform var(--t2)", transform: sidebarOpen ? "" : "rotate(180deg)" }}>
              chevron_left
            </span>
            {sidebarOpen && <span style={{ fontSize: ".8rem" }}>Collapse</span>}
          </button>
          <button
            onClick={logout}
            style={{
              display: "flex", alignItems: "center", gap: "var(--sp-3)",
              width: "100%", padding: "10px 12px", borderRadius: 10, marginTop: 2,
              background: "transparent", color: "rgba(255,255,255,.35)",
              border: "none", cursor: "pointer",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              transition: "all var(--t1)",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(186,26,26,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.35)"; e.currentTarget.style.background = "transparent"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
            {sidebarOpen && <span style={{ fontSize: ".8rem" }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ═══════ MAIN CONTENT ══════════════════════════ */}
      <main style={{ flex: 1, overflow: "auto", minHeight: "100vh" }}>

        {/* ── TOP HEADER BAR ───────────────────────────── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 5,
          padding: "var(--sp-4) var(--sp-6)",
          background: "rgba(255,248,246,0.85)",
          backdropFilter: "blur(16px) saturate(180%)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800, fontSize: "1.3rem",
              letterSpacing: "-.03em", color: "var(--text-1)",
            }}>
              {pageTitle}
            </h1>
            <p style={{ fontSize: ".78rem", color: "var(--text-3)", marginTop: 1 }}>{restaurant.name}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
            {tab === "menu" && (
              <button
                onClick={() => setAddingItem(!addingItem)}
                className="btn btn-primary btn-sm"
                style={{ gap: 6 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  {addingItem ? "close" : "add"}
                </span>
                {addingItem ? "Cancel" : "Add Item"}
              </button>
            )}
            <span className={`badge ${restaurant.isVerified ? "badge-green" : "badge-gold"}`}>
              {restaurant.isVerified ? "✓ Verified" : "⏳ Pending"}
            </span>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: "linear-gradient(135deg, var(--gold-light), var(--gold))",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: ".85rem",
              boxShadow: "var(--shadow-gold)",
            }}>
              {user?.name?.[0]?.toUpperCase() || "V"}
            </div>
          </div>
        </header>

        {/* ── CONTENT AREA ─────────────────────────────── */}
        <div style={{ padding: "var(--sp-6)" }}>
          {tab === "dashboard" && (
            <RestaurantDashboard
              restaurantId={restaurant._id}
              onNavigate={(t) => setTab(t as Tab)}
            />
          )}
          {tab === "orders" && <RestaurantOrders restaurantId={restaurant._id} />}
          {tab === "menu" && (
            addingItem
              ? <AddMenuItem onItemAdded={() => { fetchMenuItems(restaurant._id); setAddingItem(false); }} />
              : menuItems.length === 0
                ? (
                  <div style={{ textAlign: "center", padding: "var(--sp-16) 0", color: "var(--text-3)", animation: "fadeUp .4s var(--ease-out) both" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 64, color: "var(--text-4)", display: "block", marginBottom: "var(--sp-4)" }}>restaurant_menu</span>
                    <p style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "var(--sp-2)" }}>No menu items yet</p>
                    <p style={{ fontSize: ".85rem", marginBottom: "var(--sp-5)" }}>Start building your menu to attract customers</p>
                    <button className="btn btn-primary" onClick={() => setAddingItem(true)}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                      Add your first item
                    </button>
                  </div>
                )
                : <MenuItems items={menuItems} onItemDeleted={() => fetchMenuItems(restaurant._id)} isSeller={true} />
          )}
          {(tab === "earnings" || tab === "analytics") && (
            <RestaurantEarnings restaurantId={restaurant._id} />
          )}
          {tab === "settings" && (
            <RestaurantProfile restaurant={restaurant} onUpdate={setRestaurant} isSeller={true} />
          )}
          {tab === "help" && (
            <div style={{ maxWidth: 600, animation: "fadeUp .4s var(--ease-out) both" }}>
              <div style={{ background: "var(--surface)", borderRadius: 20, padding: "var(--sp-8)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", textAlign: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 56, color: "var(--primary)", display: "block", marginBottom: "var(--sp-4)" }}>support_agent</span>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "1.3rem", marginBottom: "var(--sp-2)" }}>Need Help?</h2>
                <p style={{ color: "var(--text-3)", fontSize: ".9rem", lineHeight: 1.6, marginBottom: "var(--sp-5)" }}>
                  Our support team is available 24/7 to help you with any questions about managing your restaurant on Foodify.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>
                  {[
                    { icon: "mail", title: "Email Support", desc: "support@areswebsolution.com" },
                    { icon: "phone", title: "Phone Support", desc: "+91 8918515757" },
                    { icon: "chat", title: "Live Chat", desc: "Available 24/7" },
                    { icon: "article", title: "Knowledge Base", desc: "Browse FAQs & guides" },
                  ].map(item => (
                    <div key={item.title} style={{ padding: "var(--sp-4)", background: "var(--surface-warm)", borderRadius: 12, textAlign: "left" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)", marginBottom: 8, display: "block" }}>{item.icon}</span>
                      <p style={{ fontWeight: 700, fontSize: ".82rem", marginBottom: 2 }}>{item.title}</p>
                      <p style={{ fontSize: ".75rem", color: "var(--text-3)" }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Restaurant;
