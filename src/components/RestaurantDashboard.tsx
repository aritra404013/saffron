import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { BASE_URL } from "../config";

const ACTIVE_STATUSES = ["placed", "accepted", "preparing", "ready_for_rider", "rider_assigned", "picked_up"];

interface Props {
  restaurantId: string;
  onNavigate: (tab: string) => void;
}

const RestaurantDashboard = ({ restaurantId, onNavigate }: Props) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/order/restaurant/${restaurantId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setOrders(data.orders || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [restaurantId]);

  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter(o => o.status === "delivered");
  const cancelledOrders = orders.filter(o => o.status === "cancelled");

  const todayOrders = orders.filter(o => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const todayRevenue = todayOrders
    .filter(o => o.status === "delivered")
    .reduce((sum, o) => sum + o.subtotal, 0);

  const avgOrderValue = completedOrders.length > 0
    ? (completedOrders.reduce((sum, o) => sum + o.subtotal, 0) / completedOrders.length)
    : 0;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
    placed:          { bg: "#EEF2FF", color: "#4F46E5", label: "New" },
    accepted:        { bg: "#FEF3C7", color: "#92400E", label: "Accepted" },
    preparing:       { bg: "#FEF3C7", color: "#92400E", label: "Preparing" },
    ready_for_rider: { bg: "#DBEAFE", color: "#1E40AF", label: "Ready" },
    rider_assigned:  { bg: "#DBEAFE", color: "#1E40AF", label: "Rider Assigned" },
    picked_up:       { bg: "#EDE9FE", color: "#6D28D9", label: "Picked Up" },
    delivered:       { bg: "#D1FAE5", color: "#065F46", label: "Delivered" },
    cancelled:       { bg: "#FEE2E5", color: "#E23744", label: "Cancelled" },
  };

  const statCards = [
    {
      icon: "receipt_long",
      label: "Today's Orders",
      value: todayOrders.length.toString(),
      sub: `${activeOrders.length} active`,
      accent: "var(--primary)",
      bg: "rgba(168,57,0,0.08)",
    },
    {
      icon: "payments",
      label: "Revenue Today",
      value: `₹${todayRevenue.toLocaleString("en-IN")}`,
      sub: `${todayOrders.filter(o => o.status === "delivered").length} completed`,
      accent: "var(--success)",
      bg: "rgba(0,109,55,0.08)",
    },
    {
      icon: "avg_pace",
      label: "Avg Order Value",
      value: `₹${avgOrderValue.toFixed(0)}`,
      sub: `from ${completedOrders.length} orders`,
      accent: "var(--tertiary)",
      bg: "rgba(115,92,0,0.08)",
    },
    {
      icon: "local_fire_department",
      label: "Active Orders",
      value: activeOrders.length.toString(),
      sub: activeOrders.length > 0 ? "Needs attention" : "All clear",
      accent: activeOrders.length > 0 ? "var(--error)" : "var(--success)",
      bg: activeOrders.length > 0 ? "rgba(186,26,26,0.08)" : "rgba(0,109,55,0.08)",
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--sp-4)" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: 130, borderRadius: "var(--r-xl)" }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 300, borderRadius: "var(--r-xl)" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)", animation: "fadeUp .4s var(--ease-out) both" }}>

      {/* ── STAT CARDS ─────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--sp-4)" }}>
        {statCards.map((card, i) => (
          <div
            key={card.label}
            style={{
              background: "var(--surface)", borderRadius: 16,
              padding: "var(--sp-5)", border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
              display: "flex", flexDirection: "column", gap: "var(--sp-3)",
              animation: `fadeUp .4s var(--ease-out) ${i * 60}ms both`,
              transition: "box-shadow var(--t2), transform var(--t2)",
              cursor: "default",
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = ""; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: card.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: card.accent }}>
                {card.icon}
              </span>
            </div>
            <div>
              <p style={{ fontSize: ".78rem", color: "var(--text-3)", fontWeight: 500, marginBottom: 4 }}>{card.label}</p>
              <p style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Montserrat', sans-serif", letterSpacing: "-.03em", color: "var(--text-1)" }}>
                {card.value}
              </p>
            </div>
            <p style={{ fontSize: ".75rem", color: card.accent, fontWeight: 600 }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── QUICK ACTIONS ──────────────────────────── */}
      <div style={{ display: "flex", gap: "var(--sp-3)", flexWrap: "wrap" }}>
        <button
          onClick={() => onNavigate("orders")}
          className="btn btn-primary"
          style={{ gap: 8 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>restaurant_menu</span>
          View All Orders
        </button>
        <button
          onClick={() => onNavigate("menu")}
          className="btn btn-ghost"
          style={{ gap: 8 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit_note</span>
          Manage Menu
        </button>
        <button
          onClick={() => onNavigate("earnings")}
          className="btn btn-ghost"
          style={{ gap: 8 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>trending_up</span>
          View Earnings
        </button>
      </div>

      {/* ── RECENT ORDERS ──────────────────────────── */}
      <div style={{
        background: "var(--surface)", borderRadius: 16,
        border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "var(--sp-5) var(--sp-5) var(--sp-3)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", fontFamily: "'Montserrat', sans-serif" }}>
              Recent Orders
            </h3>
            <p style={{ fontSize: ".78rem", color: "var(--text-3)", marginTop: 2 }}>Latest activity in your kitchen</p>
          </div>
          <button
            onClick={() => onNavigate("orders")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--primary)", fontWeight: 600, fontSize: ".82rem",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            View All
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: "var(--sp-10)", textAlign: "center", color: "var(--text-3)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--text-4)", marginBottom: 8, display: "block" }}>inbox</span>
            <p>No orders yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recentOrders.map((order, i) => {
              const s = STATUS_COLORS[order.status] || { bg: "var(--surface-3)", color: "var(--text-2)", label: order.status };
              const itemNames = order.items.map(it => `${it.quauntity}× ${it.name}`).join(", ");
              return (
                <div
                  key={order._id}
                  style={{
                    display: "flex", alignItems: "center", gap: "var(--sp-4)",
                    padding: "var(--sp-3) var(--sp-5)",
                    borderTop: i === 0 ? "1px solid var(--border)" : "none",
                    borderBottom: "1px solid var(--border)",
                    transition: "background var(--t1)",
                    cursor: "default",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--surface-warm)"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}
                >
                  {/* Order avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `linear-gradient(135deg, ${s.bg}, var(--surface-container-high))`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: s.color }}>
                      {order.status === "delivered" ? "check_circle" : order.status === "cancelled" ? "cancel" : "receipt_long"}
                    </span>
                  </div>

                  {/* Order info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: ".85rem" }}>#{order._id.slice(-6).toUpperCase()}</span>
                      <span style={{
                        padding: "2px 8px", borderRadius: "var(--r-full)",
                        background: s.bg, color: s.color,
                        fontSize: ".68rem", fontWeight: 700,
                      }}>{s.label}</span>
                    </div>
                    <p style={{
                      fontSize: ".78rem", color: "var(--text-3)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{itemNames}</p>
                  </div>

                  {/* Amount & time */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--text-1)" }}>₹{order.subtotal}</p>
                    <p style={{ fontSize: ".72rem", color: "var(--text-3)" }}>
                      {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ORDER BREAKDOWN ────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)" }}>
        {/* Completed */}
        <div style={{
          background: "var(--surface)", borderRadius: 16,
          padding: "var(--sp-5)", border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-3)" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(0,109,55,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--success)" }}>check_circle</span>
            </div>
            <div>
              <p style={{ fontSize: ".72rem", color: "var(--text-3)", fontWeight: 500 }}>Completed</p>
              <p style={{ fontWeight: 800, fontSize: "1.3rem", fontFamily: "'Montserrat', sans-serif" }}>{completedOrders.length}</p>
            </div>
          </div>
          <div style={{ height: 4, borderRadius: 4, background: "var(--surface-container-high)" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              background: "var(--success)",
              width: orders.length > 0 ? `${(completedOrders.length / orders.length) * 100}%` : "0%",
              transition: "width 1s var(--ease)",
            }} />
          </div>
        </div>

        {/* Cancelled */}
        <div style={{
          background: "var(--surface)", borderRadius: 16,
          padding: "var(--sp-5)", border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-3)" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(186,26,26,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--error)" }}>cancel</span>
            </div>
            <div>
              <p style={{ fontSize: ".72rem", color: "var(--text-3)", fontWeight: 500 }}>Cancelled</p>
              <p style={{ fontWeight: 800, fontSize: "1.3rem", fontFamily: "'Montserrat', sans-serif" }}>{cancelledOrders.length}</p>
            </div>
          </div>
          <div style={{ height: 4, borderRadius: 4, background: "var(--surface-container-high)" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              background: "var(--error)",
              width: orders.length > 0 ? `${(cancelledOrders.length / orders.length) * 100}%` : "0%",
              transition: "width 1s var(--ease)",
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
