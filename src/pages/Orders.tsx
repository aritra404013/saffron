import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../main";
import type { IOrder } from "../types";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  placed:          { label: "Order Placed",    color: "#4F46E5", bg: "#EEF2FF" },
  accepted:        { label: "Accepted",        color: "#B45309", bg: "#FEF3C7" },
  preparing:       { label: "Preparing",       color: "#B45309", bg: "#FEF3C7" },
  ready_for_rider: { label: "Ready for Pickup",color: "#1D4ED8", bg: "#DBEAFE" },
  rider_assigned:  { label: "Rider Assigned",  color: "#1D4ED8", bg: "#DBEAFE" },
  picked_up:       { label: "On the way",      color: "#1D4ED8", bg: "#DBEAFE" },
  delivered:       { label: "Delivered ✓",     color: "#059669", bg: "#D1FAE5" },
  cancelled:       { label: "Cancelled",       color: "#E23744", bg: "#FEE2E5" },
};

const Orders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/order/myorder`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setOrders(data.orders || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div className="page-pad">
      <div className="container" style={{ maxWidth: 680 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-8)" }}>
          <span className="accent-line" />
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-.03em" }}>My Orders</h1>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: "var(--sp-4)", display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
                <div className="skeleton skeleton-title" style={{ width: "50%" }} />
                <div className="skeleton skeleton-text" style={{ width: "30%" }} />
                <div className="skeleton skeleton-text" style={{ width: "40%" }} />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--sp-20) 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "var(--sp-4)" }}>📦</div>
            <h3 style={{ fontWeight: 700, marginBottom: "var(--sp-2)" }}>No orders yet</h3>
            <p style={{ color: "var(--text-3)", marginBottom: "var(--sp-6)" }}>Your order history will appear here</p>
            <Link to="/" className="btn btn-primary">Order Now</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            {orders.map((order, i) => {
              const s = statusConfig[order.status] || { label: order.status, color: "var(--text-2)", bg: "var(--surface-3)" };
              return (
                <Link key={order._id} to={`/order/${order._id}`} style={{ textDecoration: "none", animation: `fadeUp .35s var(--ease-out) ${i * 40}ms both`, display: "block" }}>
                  <div className="card" style={{ padding: "var(--sp-4)", transition: "box-shadow var(--t2), transform var(--t2)" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--sp-3)" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-1)" }}>
                          <p style={{ fontWeight: 700, fontSize: ".95rem" }}>{order.restaurantName}</p>
                        </div>
                        <p style={{ fontSize: ".8rem", color: "var(--text-3)", marginBottom: "var(--sp-2)" }}>
                          {order.items.map(i => `${i.name} ×${i.quauntity}`).join(", ")}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)" }}>
                          <span style={{ fontWeight: 800, color: "var(--text-1)" }}>₹{order.totalAmount}</span>
                          <span style={{ fontSize: ".75rem", color: "var(--text-3)" }}>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="badge" style={{ background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginTop: "var(--sp-3)", paddingTop: "var(--sp-3)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: ".75rem", color: "var(--text-3)" }}>#{order._id.slice(-8).toUpperCase()}</span>
                      <span style={{ fontSize: ".78rem", color: "#F5A623", fontWeight: 600 }}>View Details →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
