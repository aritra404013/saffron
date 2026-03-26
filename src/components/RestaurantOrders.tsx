import { useEffect, useRef, useState } from "react";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import audio from "../assets/quack.mp3";
import axios from "axios";
import { BASE_URL } from "../main";
import OrderCard from "./OrderCard";

const ACTIVE_STATUSES = ["placed", "accepted", "preparing", "ready_for_rider", "rider_assigned", "picked_up"];

const RestaurantOrders = ({ restaurantId }: { restaurantId: string }) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
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

  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter(o => !ACTIVE_STATUSES.includes(o.status));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
      {/* Sound notification banner */}
      {!audioUnlocked && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--sp-4) var(--sp-5)", background: "var(--warning-bg)", borderRadius: "var(--r-lg)", border: "1px solid rgba(245,158,11,.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
            <span style={{ fontSize: "1.4rem" }}>🔔</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: ".875rem", color: "#92400E" }}>Enable Sound Notifications</p>
              <p style={{ fontSize: ".78rem", color: "#B45309" }}>Get alerted when new orders arrive</p>
            </div>
          </div>
          <button onClick={unlockAudio} className="btn btn-gold btn-sm">Enable</button>
        </div>
      )}

      {/* Live badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
        <h2 style={{ fontWeight: 800, fontSize: "1.1rem" }}>Live Orders</h2>
        <span className="live-badge"><span className="live-dot" /> LIVE</span>
        {loading && <span style={{ color: "var(--text-3)", fontSize: ".8rem" }}>Refreshing...</span>}
      </div>

      {/* Active orders */}
      <section>
        <h3 style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--text-2)", marginBottom: "var(--sp-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>
          Active ({activeOrders.length})
        </h3>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--sp-3)" }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: "var(--r-xl)" }} />)}
          </div>
        ) : activeOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--sp-10) 0", color: "var(--text-3)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "var(--sp-2)" }}>📭</div>
            <p>No active orders right now</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--sp-3)" }}>
            {activeOrders.map(order => <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />)}
          </div>
        )}
      </section>

      {/* Completed */}
      {completedOrders.length > 0 && (
        <section>
          <h3 style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--text-2)", marginBottom: "var(--sp-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Completed ({completedOrders.length})
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--sp-3)" }}>
            {completedOrders.map(order => <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default RestaurantOrders;
