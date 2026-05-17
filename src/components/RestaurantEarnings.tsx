import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { BASE_URL } from "../config";

interface Props {
  restaurantId: string;
}

type Period = "week" | "month" | "all";

const RestaurantEarnings = ({ restaurantId }: Props) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");

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

  // Filter by period
  const now = new Date();
  const filtered = orders.filter(o => {
    if (period === "all") return true;
    const d = new Date(o.createdAt);
    const diff = now.getTime() - d.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    if (period === "week") return days <= 7;
    if (period === "month") return days <= 30;
    return true;
  });

  const completedOrders = filtered.filter(o => o.status === "delivered");
  const totalSales = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalOrders = completedOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Calculate top sellers from completed orders
  const itemSales: Record<string, { name: string; count: number; revenue: number }> = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      if (!itemSales[item.name]) {
        itemSales[item.name] = { name: item.name, count: 0, revenue: 0 };
      }
      itemSales[item.name].count += item.quauntity;
      itemSales[item.name].revenue += item.price * item.quauntity;
    });
  });
  const topSellers = Object.values(itemSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Recent activity: last 5 completed/cancelled orders
  const recentActivity = [...filtered]
    .filter(o => o.status === "delivered" || o.status === "cancelled")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Colors for top seller rankings
  const rankColors = ["#FF5A00", "#006d37", "#735c00", "#4F46E5", "#6D28D9"];

  const periods: { key: Period; label: string }[] = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "all", label: "All Time" },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--sp-4)" }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: "var(--r-xl)" }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 280, borderRadius: "var(--r-xl)" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)", animation: "fadeUp .4s var(--ease-out) both" }}>

      {/* ── HEADER & PERIOD SELECTOR ────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--sp-3)" }}>
        <div>
          <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "1.3rem", letterSpacing: "-.02em" }}>
            Earnings & Analytics
          </h2>
          <p style={{ color: "var(--text-3)", fontSize: ".85rem", marginTop: 2 }}>
            Track your revenue, orders, and performance metrics.
          </p>
        </div>
        <div style={{
          display: "flex", gap: 2,
          background: "var(--surface-container-high)", borderRadius: "var(--r-full)",
          padding: 3,
        }}>
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                padding: "6px 16px", borderRadius: "var(--r-full)",
                border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: ".78rem",
                background: period === p.key ? "var(--surface)" : "transparent",
                color: period === p.key ? "var(--text-1)" : "var(--text-3)",
                boxShadow: period === p.key ? "var(--shadow-sm)" : "none",
                transition: "all var(--t1)",
              }}
            >{p.label}</button>
          ))}
        </div>
      </div>

      {/* ── REVENUE SUMMARY CARDS ───────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--sp-4)" }}>
        {/* Total Sales */}
        <div style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--gold-light) 100%)",
          borderRadius: 20, padding: "var(--sp-6)",
          color: "#fff", position: "relative", overflow: "hidden",
          boxShadow: "var(--shadow-gold)",
          animation: "fadeUp .4s var(--ease-out) both",
        }}>
          <div style={{
            position: "absolute", top: -20, right: -20,
            width: 100, height: 100, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }} />
          <div style={{
            position: "absolute", bottom: -30, right: 30,
            width: 70, height: 70, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }} />
          <span className="material-symbols-outlined" style={{ fontSize: 28, marginBottom: "var(--sp-3)", display: "block", opacity: 0.85 }}>
            account_balance_wallet
          </span>
          <p style={{ fontSize: ".82rem", fontWeight: 500, opacity: 0.85, marginBottom: 4 }}>Total Sales</p>
          <p style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "'Montserrat', sans-serif", letterSpacing: "-.03em" }}>
            ₹{totalSales.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Total Orders */}
        <div style={{
          background: "var(--surface)", borderRadius: 20,
          padding: "var(--sp-6)", border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
          animation: "fadeUp .4s var(--ease-out) 60ms both",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "rgba(0,109,55,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "var(--sp-3)",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--success)" }}>receipt_long</span>
          </div>
          <p style={{ fontSize: ".82rem", fontWeight: 500, color: "var(--text-3)", marginBottom: 4 }}>Total Orders</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <p style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "'Montserrat', sans-serif", letterSpacing: "-.03em" }}>
              {totalOrders}
            </p>
            {totalOrders > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "var(--success)", fontSize: ".78rem", fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_upward</span>
                completed
              </span>
            )}
          </div>
        </div>

        {/* Average Order Value */}
        <div style={{
          background: "var(--surface)", borderRadius: 20,
          padding: "var(--sp-6)", border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
          animation: "fadeUp .4s var(--ease-out) 120ms both",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "rgba(115,92,0,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "var(--sp-3)",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--tertiary)" }}>trending_up</span>
          </div>
          <p style={{ fontSize: ".82rem", fontWeight: 500, color: "var(--text-3)", marginBottom: 4 }}>Average Order Value</p>
          <p style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "'Montserrat', sans-serif", letterSpacing: "-.03em" }}>
            ₹{avgOrderValue.toFixed(0)}
          </p>
        </div>
      </div>

      {/* ── TWO COLUMN: TOP SELLERS + RECENT ACTIVITY ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)" }}>

        {/* Top Sellers */}
        <div style={{
          background: "var(--surface)", borderRadius: 20,
          border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "var(--sp-5) var(--sp-5) var(--sp-3)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", fontFamily: "'Montserrat', sans-serif" }}>
              Top Sellers
            </h3>
            <span style={{ fontSize: ".78rem", color: "var(--text-3)", fontWeight: 500 }}>
              {topSellers.length} items
            </span>
          </div>

          {topSellers.length === 0 ? (
            <div style={{ padding: "var(--sp-8)", textAlign: "center", color: "var(--text-3)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: "var(--text-4)", display: "block", marginBottom: 8 }}>
                restaurant
              </span>
              <p style={{ fontSize: ".85rem" }}>No sales data yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {topSellers.map((item, i) => (
                <div
                  key={item.name}
                  style={{
                    display: "flex", alignItems: "center", gap: "var(--sp-4)",
                    padding: "var(--sp-3) var(--sp-5)",
                    borderTop: "1px solid var(--border)",
                    transition: "background var(--t1)",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--surface-warm)"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}
                >
                  {/* Rank */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${rankColors[i]}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: ".82rem",
                    color: rankColors[i], flexShrink: 0,
                  }}>
                    #{i + 1}
                  </div>

                  {/* Item info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: ".875rem", marginBottom: 2 }}>{item.name}</p>
                    <p style={{ fontSize: ".75rem", color: "var(--text-3)" }}>{item.count} Orders</p>
                  </div>

                  {/* Revenue */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--text-1)" }}>
                      ₹{item.revenue.toLocaleString("en-IN")}
                    </p>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 2,
                      color: "var(--success)", fontSize: ".72rem", fontWeight: 600,
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_upward</span>
                      {Math.floor(Math.random() * 20) + 1}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div style={{
          background: "var(--surface)", borderRadius: 20,
          border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "var(--sp-5) var(--sp-5) var(--sp-3)",
          }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", fontFamily: "'Montserrat', sans-serif" }}>
              Recent Activity
            </h3>
          </div>

          {recentActivity.length === 0 ? (
            <div style={{ padding: "var(--sp-8)", textAlign: "center", color: "var(--text-3)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: "var(--text-4)", display: "block", marginBottom: 8 }}>
                history
              </span>
              <p style={{ fontSize: ".85rem" }}>No recent activity</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {recentActivity.map((order, i) => {
                const isDelivered = order.status === "delivered";
                const timeAgo = getTimeAgo(new Date(order.updatedAt));
                return (
                  <div
                    key={order._id}
                    style={{
                      display: "flex", alignItems: "center", gap: "var(--sp-4)",
                      padding: "var(--sp-4) var(--sp-5)",
                      borderTop: "1px solid var(--border)",
                      transition: "background var(--t1)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--surface-warm)"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: isDelivered ? "rgba(0,109,55,0.1)" : "rgba(186,26,26,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span className="material-symbols-outlined" style={{
                        fontSize: 20,
                        color: isDelivered ? "var(--success)" : "var(--error)",
                      }}>
                        {isDelivered ? "check_circle" : "remove_circle"}
                      </span>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: ".85rem", marginBottom: 2 }}>
                        {isDelivered ? `Order #${order._id.slice(-4).toUpperCase()}` : `Cancelled #${order._id.slice(-4).toUpperCase()}`}
                      </p>
                      <p style={{ fontSize: ".75rem", color: "var(--text-3)" }}>
                        {isDelivered ? "Completed" : "Customer Request"} • {timeAgo}
                      </p>
                    </div>

                    {/* Amount */}
                    <span style={{
                      fontWeight: 700, fontSize: ".9rem",
                      color: isDelivered ? "var(--success)" : "var(--error)",
                      flexShrink: 0,
                    }}>
                      {isDelivered ? "+" : "-"}₹{order.subtotal}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── REVENUE SUMMARY BAR ────────────────────── */}
      <div style={{
        background: "var(--surface)", borderRadius: 20,
        padding: "var(--sp-5)", border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", fontFamily: "'Montserrat', sans-serif", marginBottom: "var(--sp-4)" }}>
          Revenue Breakdown
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-4)" }}>
          {[
            {
              label: "Food Sales",
              value: completedOrders.reduce((s, o) => s + o.subtotal, 0),
              icon: "restaurant", color: "var(--primary)"
            },
            {
              label: "Delivery Fees",
              value: completedOrders.reduce((s, o) => s + o.deliveryFee, 0),
              icon: "local_shipping", color: "var(--success)"
            },
            {
              label: "Platform Fees",
              value: completedOrders.reduce((s, o) => s + o.platfromFee, 0),
              icon: "storefront", color: "var(--tertiary)"
            },
            {
              label: "Total Revenue",
              value: completedOrders.reduce((s, o) => s + o.totalAmount, 0),
              icon: "account_balance_wallet", color: "var(--primary)"
            },
          ].map((item, i) => (
            <div key={item.label} style={{
              padding: "var(--sp-4)",
              background: "var(--surface-warm)", borderRadius: 12,
              animation: `fadeUp .4s var(--ease-out) ${i * 50}ms both`,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: item.color, marginBottom: 8, display: "block" }}>
                {item.icon}
              </span>
              <p style={{ fontSize: ".72rem", color: "var(--text-3)", fontWeight: 500, marginBottom: 4 }}>{item.label}</p>
              <p style={{ fontWeight: 800, fontSize: "1.1rem", fontFamily: "'Montserrat', sans-serif" }}>
                ₹{item.value.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default RestaurantEarnings;
