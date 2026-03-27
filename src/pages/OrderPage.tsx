import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { BASE_URL } from "../main";
import UserOrderMap from "../components/UserOrderMap";

const STEPS: { key: IOrder["status"]; label: string; icon: string }[] = [
  { key: "placed",          label: "Order Placed",     icon: "📋" },
  { key: "accepted",        label: "Accepted",         icon: "✅" },
  { key: "preparing",       label: "Preparing",        icon: "👨‍🍳" },
  { key: "ready_for_rider", label: "Ready for Pickup", icon: "📦" },
  { key: "rider_assigned",  label: "Rider Assigned",   icon: "🛵" },
  { key: "picked_up",       label: "On the way",       icon: "🚀" },
  { key: "delivered",       label: "Delivered",        icon: "🎉" },
];

const ORDER_INDEX: Record<string, number> = {
  placed: 0, accepted: 1, preparing: 2, ready_for_rider: 3,
  rider_assigned: 4, picked_up: 5, delivered: 6,
};

const OrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/order/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrder(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  useEffect(() => {
    if (!socket) return;
    const onUpdate = () => fetchOrder();
    socket.on("order:update", onUpdate);
    socket.on("order:rider_assigned", onUpdate);
    socket.on("rider:location", ({ latitude, longitude }: any) => setRiderLocation([latitude, longitude]));
    return () => { socket.off("order:update", onUpdate); socket.off("order:rider_assigned", onUpdate); };
  }, [socket]);

  if (loading) return (
    <div className="page-pad">
      <div className="container" style={{ maxWidth: 640 }}>
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--r-xl)", marginBottom: "var(--sp-3)" }} />)}
      </div>
    </div>
  );

  if (!order) return (
    <div className="page-pad" style={{ textAlign: "center" }}>
      <p style={{ color: "var(--text-3)" }}>Order not found.</p>
      <button className="btn btn-ghost" style={{ marginTop: "var(--sp-4)" }} onClick={() => navigate("/orders")}>← My Orders</button>
    </div>
  );

  const currentStep = ORDER_INDEX[order.status] ?? 0;

  return (
    <div className="page-pad">
      <div className="container" style={{ maxWidth: 640 }}>
        <button onClick={() => navigate("/orders")} style={{ display: "flex", alignItems: "center", gap: "var(--sp-1)", color: "var(--text-3)", fontSize: ".85rem", fontWeight: 500, background: "none", border: "none", cursor: "pointer", marginBottom: "var(--sp-5)", padding: 0 }}>
          ← My Orders
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-5)" }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-.03em" }}>{order.restaurantName}</h1>
            <p style={{ color: "var(--text-3)", fontSize: ".78rem" }}>Order #{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <span className={`badge status-${order.status}`} style={{ fontSize: ".8rem", padding: "5px 12px" }}>
            {STEPS[currentStep]?.label || order.status}
          </span>
        </div>

        {/* Live status timeline */}
        <div className="card" style={{ padding: "var(--sp-5)", marginBottom: "var(--sp-4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-5)" }}>
            <h3 style={{ fontWeight: 700 }}>Live Tracking</h3>
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <span className="live-badge"><span className="live-dot" /> LIVE</span>
            )}
          </div>

          <div style={{ position: "relative" }}>
            {STEPS.filter(s => s.key !== "cancelled").map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={step.key} style={{ display: "flex", gap: "var(--sp-4)", paddingBottom: i < STEPS.length - 2 ? "var(--sp-5)" : 0, position: "relative" }}>
                  {/* Vertical line */}
                  {i < STEPS.filter(s => s.key !== "cancelled").length - 1 && (
                    <div style={{
                      position: "absolute", left: 16, top: 32, bottom: 0, width: 2,
                      background: done ? "#F5A623" : "var(--border)",
                      transition: "background .5s",
                    }} />
                  )}
                  {/* Circle */}
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                    background: done ? (active ? "#F5A623" : "var(--success)") : "var(--surface-3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: ".9rem",
                    boxShadow: active ? "0 0 0 4px rgba(226,55,68,.2)" : "none",
                    transition: "all .3s",
                  }}>
                    {done ? (active ? step.icon : "✓") : step.icon}
                  </div>
                  {/* Label */}
                  <div style={{ paddingTop: "var(--sp-1)" }}>
                    <p style={{ fontWeight: active ? 700 : 500, color: done ? "var(--text-1)" : "var(--text-4)", fontSize: ".88rem" }}>{step.label}</p>
                    {active && <p style={{ fontSize: ".75rem", color: "var(--text-3)", marginTop: 2 }}>In progress...</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rider info */}
        {(order.status === "rider_assigned" || order.status === "picked_up") && order.riderName && (
          <div className="card" style={{ padding: "var(--sp-4)", marginBottom: "var(--sp-4)", display: "flex", alignItems: "center", gap: "var(--sp-4)" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,var(--success),#047857)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>🛵</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700 }}>Your Rider</p>
              <p style={{ fontSize: ".85rem", color: "var(--text-2)" }}>{order.riderName}</p>
              {order.riderPhone && <p style={{ fontSize: ".8rem", color: "var(--text-3)" }}>📞 {order.riderPhone}</p>}
            </div>
          </div>
        )}

        {/* Map */}
        {(order.status === "rider_assigned" || order.status === "picked_up") && riderLocation && (
          <div style={{ marginBottom: "var(--sp-4)" }}>
            <UserOrderMap
              riderLocation={riderLocation}
              deliveryLocation={[order.deliveryAddress.latitude, order.deliveryAddress.longitude]}
            />
          </div>
        )}

        {/* Items & bill */}
        <div className="card" style={{ padding: "var(--sp-5)" }}>
          <h3 style={{ fontWeight: 700, marginBottom: "var(--sp-4)" }}>Items</h3>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: ".875rem", marginBottom: "var(--sp-2)", color: "var(--text-2)" }}>
              <span>{item.name} ×{item.quauntity}</span>
              <span style={{ fontWeight: 600 }}>₹{item.price * item.quauntity}</span>
            </div>
          ))}
          <hr className="divider" />
          {[
            { l: "Subtotal", v: `₹${order.subtotal}` },
            { l: "Delivery Fee", v: `₹${order.deliveryFee}` },
            { l: "Platform Fee", v: `₹${order.platfromFee}` },
          ].map(r => (
            <div key={r.l} style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", color: "var(--text-3)", marginBottom: "var(--sp-1)" }}>
              <span>{r.l}</span><span>{r.v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1rem", marginTop: "var(--sp-2)", paddingTop: "var(--sp-2)", borderTop: "1px solid var(--border)" }}>
            <span>Total</span><span style={{ color: "#F5A623" }}>₹{order.totalAmount}</span>
          </div>
          <div style={{ marginTop: "var(--sp-3)", display: "flex", gap: "var(--sp-3)", fontSize: ".78rem", color: "var(--text-3)" }}>
            <span>Payment: <b style={{ color: "var(--text-1)" }}>{order.paymentMethod.toUpperCase()}</b></span>
            <span className={`badge ${order.paymentStatus === "paid" ? "badge-green" : "badge-gold"}`}>{order.paymentStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
