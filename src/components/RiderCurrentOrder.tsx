import axios from "axios";
import type { IOrder } from "../types";
import { BASE_URL } from "../main";
import toast from "react-hot-toast";
import { useState } from "react";

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const STATUS_MAP: Record<string, { next: string; label: string; icon: string; color: string }> = {
  rider_assigned: { next: "picked_up",  label: "Reached Restaurant — Pick Up",  icon: "🏪", color: "#F59E0B" },
  picked_up:      { next: "delivered",  label: "Mark as Delivered",              icon: "✅", color: "#10B981" },
};

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const [loading, setLoading] = useState(false);

  const updateStatus = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${BASE_URL}/api/rider/order/update/${order._id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Status updated!");
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const action = STATUS_MAP[order.status];

  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      border: "1.5px solid var(--border)",
      boxShadow: "0 8px 32px rgba(0,0,0,.07)",
      overflow: "hidden",
      animation: "fadeUp .4s var(--ease-out) both",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, var(--charcoal) 0%, #1F2937 100%)",
        padding: "var(--sp-5)",
        color: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>Active Delivery</p>
            <p style={{ fontWeight: 800, fontSize: "1.1rem" }}>#{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <div style={{
            padding: "6px 14px", borderRadius: "var(--r-full)",
            background: order.status === "picked_up" ? "rgba(16,185,129,.2)" : "rgba(245,158,11,.2)",
            color: order.status === "picked_up" ? "#34D399" : "#FCD34D",
            fontSize: ".78rem", fontWeight: 700,
          }}>
            {order.status === "picked_up" ? "🚀 On the Way" : "⏳ At Restaurant"}
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: "var(--sp-5)" }}>
        {/* Route visual */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: "var(--sp-5)" }}>
          {/* Pickup */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--sp-3)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>🏪</div>
              <div style={{ width: 2, height: 28, background: "var(--border)", margin: "4px 0" }} />
            </div>
            <div style={{ paddingTop: 8 }}>
              <p style={{ fontSize: ".7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>Pickup from</p>
              <p style={{ fontWeight: 700, fontSize: ".9rem" }}>{order.restaurantName}</p>
            </div>
          </div>
          {/* Drop */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--sp-3)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>📦</div>
            <div style={{ paddingTop: 8 }}>
              <p style={{ fontSize: ".7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>Deliver to</p>
              <p style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--text-1)" }}>{order.deliveryAddress.fromattedAddress}</p>
            </div>
          </div>
        </div>

        {/* Earnings row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)", marginBottom: "var(--sp-5)" }}>
          {[
            { label: "Order Total", value: `₹${order.totalAmount}`, icon: "🧾" },
            { label: "Your Earning", value: `₹${order.riderAmount || 0}`, icon: "💰", highlight: true },
          ].map(item => (
            <div key={item.label} style={{ padding: "var(--sp-4)", background: item.highlight ? "linear-gradient(135deg,#ECFDF5,#D1FAE5)" : "var(--surface-2)", borderRadius: 14, border: item.highlight ? "1px solid rgba(16,185,129,.3)" : "1px solid var(--border)" }}>
              <p style={{ fontSize: "1.2rem", marginBottom: 4 }}>{item.icon}</p>
              <p style={{ fontWeight: 800, fontSize: "1.1rem", color: item.highlight ? "#047857" : "var(--text-1)" }}>{item.value}</p>
              <p style={{ fontSize: ".72rem", color: "var(--text-3)" }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Customer contact */}
        {order.deliveryAddress.mobile && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--sp-3) var(--sp-4)", background: "var(--surface-2)", borderRadius: 14, border: "1px solid var(--border)", marginBottom: "var(--sp-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
              <span style={{ fontSize: "1.1rem" }}>📞</span>
              <div>
                <p style={{ fontSize: ".7rem", color: "var(--text-3)" }}>Customer</p>
                <p style={{ fontWeight: 700, fontSize: ".9rem" }}>{order.deliveryAddress.mobile}</p>
              </div>
            </div>
            <a
              href={`tel:${order.deliveryAddress.mobile}`}
              style={{ padding: "8px 18px", borderRadius: "var(--r-full)", background: "linear-gradient(135deg,#3B82F6,#2563EB)", color: "#fff", fontWeight: 700, fontSize: ".82rem", textDecoration: "none", boxShadow: "0 4px 12px rgba(59,130,246,.35)" }}
            >
              Call
            </a>
          </div>
        )}

        {/* Action button */}
        {action && (
          <button
            onClick={updateStatus}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              background: loading ? "#9CA3AF" : `linear-gradient(135deg, ${action.color}, ${action.color}CC)`,
              color: "#fff",
              fontWeight: 800,
              fontSize: ".95rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--sp-2)",
              boxShadow: loading ? "none" : `0 6px 20px ${action.color}55`,
              transition: "all .2s",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
          >
            {loading
              ? <><span className="spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,.3)" }} /> Updating...</>
              : <><span style={{ fontSize: "1.2rem" }}>{action.icon}</span> {action.label}</>
            }
          </button>
        )}

        {order.status === "delivered" && (
          <div style={{ textAlign: "center", padding: "var(--sp-4)", background: "#D1FAE5", borderRadius: 14, color: "#047857", fontWeight: 700 }}>
            🎉 Order Delivered!
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderCurrentOrder;
