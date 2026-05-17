import { useEffect, useRef, useState } from "react";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import audio from "../assets/quack.mp3";
import axios from "axios";
import { BASE_URL } from "../config";
import { ORDER_ACTIONS } from "../utils/orderflow";
import toast from "react-hot-toast";

const KANBAN_COLUMNS = [
  { key: "new", label: "New", statuses: ["placed"], icon: "notifications_active", color: "#4F46E5", bg: "#EEF2FF" },
  { key: "preparing", label: "Preparing", statuses: ["accepted", "preparing"], icon: "skillet", color: "#92400E", bg: "#FEF3C7" },
  { key: "ready", label: "Ready", statuses: ["ready_for_rider", "rider_assigned"], icon: "check_circle", color: "#1E40AF", bg: "#DBEAFE" },
  { key: "dispatched", label: "Dispatched", statuses: ["picked_up"], icon: "local_shipping", color: "#6D28D9", bg: "#EDE9FE" },
];

const RestaurantOrders = ({ restaurantId }: { restaurantId: string }) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { socket } = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { audioRef.current = new Audio(audio); audioRef.current.load(); }, []);

  const unlockAudio = () => {
    audioRef.current?.play().then(() => { audioRef.current!.pause(); audioRef.current!.currentTime = 0; setAudioUnlocked(true); }).catch(() => {});
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/order/restaurant/${restaurantId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(data.orders || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [restaurantId]);

  useEffect(() => {
    if (!socket) return;
    const onNew = () => {
      if (audioUnlocked && audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); }
      fetchOrders();
    };
    socket.on("order:new", onNew);
    socket.on("order:rider_assigned", fetchOrders);
    return () => { socket.off("order:new", onNew); socket.off("order:rider_assigned", fetchOrders); };
  }, [socket, audioUnlocked]);

  const updateStatus = async (orderId: string, status: string) => {
    if (status === "cancelled" && !window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    try {
      setUpdatingId(orderId);
      await axios.put(`${BASE_URL}/api/order/${orderId}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success(status === "cancelled" ? "Order cancelled" : "Order updated");
      fetchOrders();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Failed"); }
    finally { setUpdatingId(null); }
  };

  const completedOrders = orders.filter(o => o.status === "delivered" || o.status === "cancelled");
  const activeCount = orders.filter(o => !["delivered", "cancelled"].includes(o.status)).length;

  // Friendly action labels + icons
  const ACTION_LABEL: Record<string, { label: string; icon: string }> = {
    accepted: { label: "Accept Order", icon: "check" },
    preparing: { label: "Start Preparing", icon: "skillet" },
    ready_for_rider: { label: "Mark Ready", icon: "done_all" },
    rider_assigned: { label: "Assign to Rider", icon: "two_wheeler" },
    cancelled: { label: "Cancel", icon: "close" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)", animation: "fadeUp .4s var(--ease-out) both" }}>

      {/* ── SOUND NOTIFICATION ──────────────────────── */}
      {!audioUnlocked && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "var(--sp-4) var(--sp-5)",
          background: "linear-gradient(135deg, rgba(115,92,0,0.08) 0%, rgba(115,92,0,0.04) 100%)",
          borderRadius: 16, border: "1px solid rgba(115,92,0,0.15)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "rgba(115,92,0,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--tertiary)" }}>notifications_active</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: ".875rem", color: "var(--text-1)" }}>Enable Sound Notifications</p>
              <p style={{ fontSize: ".78rem", color: "var(--text-3)" }}>Get alerted when new orders arrive</p>
            </div>
          </div>
          <button onClick={unlockAudio} className="btn btn-primary btn-sm">Enable</button>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", fontFamily: "'Montserrat', sans-serif" }}>Active Orders</h2>
          <span className="live-badge"><span className="live-dot" /> LIVE</span>
          <span style={{
            padding: "4px 10px", borderRadius: "var(--r-full)",
            background: "rgba(168,57,0,0.1)", color: "var(--primary)",
            fontSize: ".75rem", fontWeight: 700,
          }}>{activeCount} active</span>
        </div>
        <button onClick={fetchOrders} className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
          Refresh
        </button>
      </div>

      {/* ── KANBAN BOARD ───────────────────────────── */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-4)" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
              <div className="skeleton" style={{ height: 36, borderRadius: 8 }} />
              <div className="skeleton" style={{ height: 180, borderRadius: 16 }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--sp-4)", alignItems: "start",
        }}>
          {KANBAN_COLUMNS.map(col => {
            const colOrders = orders.filter(o => col.statuses.includes(o.status));
            return (
              <div key={col.key} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
                {/* Column Header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "var(--sp-2)",
                  padding: "var(--sp-2) var(--sp-3)",
                  borderRadius: 10, background: col.bg,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: col.color }}>{col.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: ".82rem", color: col.color }}>{col.label}</span>
                  <span style={{
                    marginLeft: "auto",
                    width: 22, height: 22, borderRadius: "50%",
                    background: col.color, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: ".7rem", fontWeight: 800,
                  }}>{colOrders.length}</span>
                </div>

                {/* Cards */}
                {colOrders.length === 0 ? (
                  <div style={{
                    padding: "var(--sp-8) var(--sp-4)",
                    textAlign: "center",
                    border: "2px dashed var(--border)",
                    borderRadius: 16, color: "var(--text-4)",
                    fontSize: ".8rem",
                  }}>
                    No orders
                  </div>
                ) : (
                  colOrders.map((order, i) => {
                    const actions = ORDER_ACTIONS[order.status] || [];
                    const isUpdating = updatingId === order._id;
                    return (
                      <div
                        key={order._id}
                        style={{
                          background: "var(--surface)", borderRadius: 16,
                          border: "1px solid var(--border)",
                          boxShadow: "var(--shadow-sm)",
                          padding: "var(--sp-4)",
                          display: "flex", flexDirection: "column",
                          gap: "var(--sp-3)",
                          animation: `fadeUp .35s var(--ease-out) ${i * 40}ms both`,
                          transition: "box-shadow var(--t2), transform var(--t2)",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = ""; }}
                      >
                        {/* Order ID + time */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: `linear-gradient(135deg, ${col.bg}, var(--surface-container-high))`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontWeight: 800, fontSize: ".75rem", color: col.color,
                            }}>
                              {order._id.slice(-2).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: ".85rem" }}>#{order._id.slice(-6).toUpperCase()}</p>
                              <p style={{ fontSize: ".68rem", color: "var(--text-4)" }}>
                                {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                {" · "}{order.items.reduce((s, it) => s + it.quauntity, 0)} items
                              </p>
                            </div>
                          </div>
                          {/* Payment badge */}
                          <span style={{
                            padding: "2px 6px", borderRadius: "var(--r-full)",
                            background: order.paymentStatus === "paid" ? "rgba(0,109,55,0.1)" : "rgba(168,57,0,0.1)",
                            color: order.paymentStatus === "paid" ? "var(--success)" : "var(--primary)",
                            fontSize: ".65rem", fontWeight: 700,
                          }}>
                            {order.paymentStatus === "paid" ? "Paid" : order.paymentMethod === "cod" ? "COD" : order.paymentStatus}
                          </span>
                        </div>

                        {/* ── CUSTOMER DETAILS ────────────────── */}
                        <div style={{
                          background: "var(--surface-warm)", borderRadius: 10,
                          padding: "var(--sp-3)",
                          display: "flex", flexDirection: "column", gap: 4,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--text-3)" }}>person</span>
                            <span style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--text-1)" }}>
                              Customer
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--text-3)" }}>call</span>
                            <span style={{ fontSize: ".78rem", color: "var(--text-2)" }}>
                              {order.deliveryAddress?.mobile || "N/A"}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--text-3)", marginTop: 1 }}>location_on</span>
                            <span style={{
                              fontSize: ".72rem", color: "var(--text-3)", lineHeight: 1.3,
                              overflow: "hidden", textOverflow: "ellipsis",
                              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                            }}>
                              {order.deliveryAddress?.fromattedAddress || "No address"}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        <div style={{
                          borderTop: "1px solid var(--border)", paddingTop: "var(--sp-2)",
                          display: "flex", flexDirection: "column", gap: 3,
                        }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{
                              display: "flex", justifyContent: "space-between",
                              fontSize: ".8rem", color: "var(--text-2)",
                            }}>
                              <span>{item.quauntity}× {item.name}</span>
                              <span style={{ fontWeight: 600, color: "var(--text-1)" }}>₹{item.price * item.quauntity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Total */}
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          fontWeight: 800, fontSize: ".9rem",
                          borderTop: "1px solid var(--border)",
                          paddingTop: "var(--sp-2)",
                        }}>
                          <span>Total</span>
                          <span style={{ color: "var(--primary)" }}>₹{order.totalAmount}</span>
                        </div>

                        {/* Rider info (for ready/dispatched columns) */}
                        {order.riderName && (col.key === "ready" || col.key === "dispatched") && (
                          <div style={{
                            display: "flex", alignItems: "center", gap: "var(--sp-2)",
                            padding: "var(--sp-2) var(--sp-3)",
                            background: "rgba(0,109,55,0.06)",
                            borderRadius: 10, border: "1px solid rgba(0,109,55,0.12)",
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--success)" }}>two_wheeler</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 600, fontSize: ".78rem", color: "var(--success)" }}>{order.riderName}</p>
                              {order.riderPhone && (
                                <p style={{ fontSize: ".7rem", color: "var(--text-3)" }}>{order.riderPhone}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* ── ACTION BUTTONS ─────────────────── */}
                        {actions.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
                            {/* Primary action (accept / preparing / ready) */}
                            {actions.filter(s => s !== "cancelled").map((status: string) => {
                              const act = ACTION_LABEL[status] || { label: status.replace(/_/g, " "), icon: "arrow_forward" };
                              return (
                                <button
                                  key={status}
                                  disabled={isUpdating}
                                  onClick={() => updateStatus(order._id, status)}
                                  style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    borderRadius: 10,
                                    border: "none", cursor: "pointer",
                                    fontWeight: 700, fontSize: ".78rem",
                                    background: col.color,
                                    color: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    transition: "all var(--t1)",
                                    opacity: isUpdating ? 0.6 : 1,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                                  }}
                                >
                                  {isUpdating
                                    ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                    : <>
                                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{act.icon}</span>
                                        {act.label}
                                      </>
                                  }
                                </button>
                              );
                            })}

                            {/* Cancel button (separate, always at bottom) */}
                            {actions.includes("cancelled") && (
                              <button
                                disabled={isUpdating}
                                onClick={() => updateStatus(order._id, "cancelled")}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: 10,
                                  border: "1px solid rgba(186,26,26,0.2)",
                                  cursor: "pointer",
                                  fontWeight: 700, fontSize: ".75rem",
                                  background: "rgba(186,26,26,0.06)",
                                  color: "var(--error)",
                                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                  transition: "all var(--t1)",
                                  opacity: isUpdating ? 0.6 : 1,
                                }}
                              >
                                {isUpdating
                                  ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                  : <>
                                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                                      Cancel Order
                                    </>
                                }
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── COMPLETED ORDERS SECTION ────────────────── */}
      {completedOrders.length > 0 && (
        <div style={{
          background: "var(--surface)", borderRadius: 20,
          border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            style={{
              width: "100%", padding: "var(--sp-4) var(--sp-5)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "none", border: "none", cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--text-3)" }}>history</span>
              <span style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--text-1)" }}>
                Completed & Cancelled ({completedOrders.length})
              </span>
            </div>
            <span className="material-symbols-outlined" style={{
              fontSize: 20, color: "var(--text-3)",
              transition: "transform var(--t2)",
              transform: showCompleted ? "rotate(180deg)" : "rotate(0)",
            }}>expand_more</span>
          </button>

          {showCompleted && (
            <div style={{ padding: "0 var(--sp-5) var(--sp-5)" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "var(--sp-3)",
              }}>
                {completedOrders.map(order => {
                  const isDelivered = order.status === "delivered";
                  return (
                    <div key={order._id} style={{
                      padding: "var(--sp-4)",
                      borderRadius: 14,
                      border: "1px solid var(--border)",
                      background: "var(--surface-warm)",
                      opacity: 0.85,
                      display: "flex", flexDirection: "column", gap: "var(--sp-2)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 700, fontSize: ".82rem" }}>#{order._id.slice(-6).toUpperCase()}</span>
                        <span style={{
                          padding: "2px 8px", borderRadius: "var(--r-full)",
                          background: isDelivered ? "#D1FAE5" : "#FEE2E5",
                          color: isDelivered ? "#065F46" : "#E23744",
                          fontSize: ".7rem", fontWeight: 700,
                        }}>
                          {isDelivered ? "Delivered ✓" : "Cancelled ✗"}
                        </span>
                      </div>
                      <div style={{ fontSize: ".78rem", color: "var(--text-3)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 12, verticalAlign: "middle" }}>call</span>
                        {" "}{order.deliveryAddress?.mobile || "N/A"}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", color: "var(--text-3)" }}>
                        <span>{order.items.length} items</span>
                        <span style={{ fontWeight: 700, color: "var(--text-1)" }}>₹{order.totalAmount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;
