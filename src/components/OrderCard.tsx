import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { ORDER_ACTIONS } from "../utils/orderflow";
import axios from "axios";
import { BASE_URL } from "../main";
import toast from "react-hot-toast";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  placed:          { bg: "#EEF2FF", color: "#4F46E5", label: "Order Placed" },
  accepted:        { bg: "#FEF3C7", color: "#92400E", label: "Accepted" },
  preparing:       { bg: "#FEF3C7", color: "#92400E", label: "Preparing" },
  ready_for_rider: { bg: "#DBEAFE", color: "#1E40AF", label: "Ready for Rider" },
  rider_assigned:  { bg: "#DBEAFE", color: "#1E40AF", label: "Rider Assigned" },
  picked_up:       { bg: "#EDE9FE", color: "#6D28D9", label: "Picked Up" },
  delivered:       { bg: "#D1FAE5", color: "#065F46", label: "Delivered ✓" },
  cancelled:       { bg: "#FEE2E5", color: "#E23744", label: "Cancelled" },
};

const OrderCard = ({ order, onStatusUpdate }: { order: IOrder; onStatusUpdate?: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [retryVisible, setRetryVisible] = useState(false);
  const actions = ORDER_ACTIONS[order.status] || [];
  const s = STATUS_STYLES[order.status] || { bg: "var(--surface-3)", color: "var(--text-2)", label: order.status };

  useEffect(() => {
    if (order.status !== "ready_for_rider") { setRetryVisible(false); return; }
    const t = setTimeout(() => setRetryVisible(true), 10000);
    return () => clearTimeout(t);
  }, [order.status]);

  const updateStatus = async (status: string) => {
    try {
      setLoading(true); setRetryVisible(false);
      await axios.put(`${BASE_URL}/api/order/${order._id}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Order updated");
      onStatusUpdate?.();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="card" style={{ padding: "var(--sp-4)", display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: ".875rem" }}>#{order._id.slice(-8).toUpperCase()}</p>
          <p style={{ fontSize: ".75rem", color: "var(--text-3)" }}>
            {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <span style={{ padding: "4px 10px", borderRadius: "var(--r-full)", background: s.bg, color: s.color, fontSize: ".72rem", fontWeight: 700 }}>
          {s.label}
        </span>
      </div>

      {/* Items */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--sp-2)" }}>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem", color: "var(--text-2)", marginBottom: 3 }}>
            <span>{item.name} ×{item.quauntity}</span>
            <span style={{ fontWeight: 600 }}>₹{item.price * item.quauntity}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: ".9rem", borderTop: "1px solid var(--border)", paddingTop: "var(--sp-2)" }}>
        <span>Total</span>
        <span style={{ color: "var(--crimson)" }}>₹{order.totalAmount}</span>
      </div>

      {/* Payment */}
      <span className={`badge ${order.paymentStatus === "paid" ? "badge-green" : "badge-gold"}`} style={{ alignSelf: "flex-start" }}>
        {order.paymentStatus === "paid" ? "✓ Paid" : "⏳ " + order.paymentStatus}
      </span>

      {/* Actions */}
      {order.paymentStatus === "paid" && actions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-2)" }}>
          {actions.map((status: string) => (
            <button key={status} disabled={loading} onClick={() => updateStatus(status)} className="btn btn-primary btn-sm" style={{ fontSize: ".75rem" }}>
              {loading ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : `→ ${status.replace(/_/g, " ")}`}
            </button>
          ))}
        </div>
      )}

      {/* Retry */}
      {order.status === "ready_for_rider" && retryVisible && (
        <button onClick={() => updateStatus("ready_for_rider")} className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center" }}>
          🔄 Retry Ready for Rider
        </button>
      )}
    </div>
  );
};

export default OrderCard;
