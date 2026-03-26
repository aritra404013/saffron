import { useEffect, useState } from "react";
import { BASE_URL } from "../main";
import axios from "axios";
import toast from "react-hot-toast";

interface Props {
  orderId: string;
  onAccepted: () => void;
}

const TIMEOUT = 10;

const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAccepted(); // auto-dismiss
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onAccepted]);

  const acceptOrder = async () => {
    try {
      setAccepting(true);
      await axios.post(
        `${BASE_URL}/api/rider/accept/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Order Accepted! 🛵");
      onAccepted();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to accept order");
      onAccepted();
    } finally {
      setAccepting(false);
    }
  };

  // countdown progress: 0–1
  const progress = secondsLeft / TIMEOUT;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * progress;
  const urgency = secondsLeft <= 3 ? "#E23744" : secondsLeft <= 6 ? "#F59E0B" : "#10B981";

  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      border: `2px solid ${urgency}40`,
      boxShadow: `0 8px 32px ${urgency}25, 0 2px 8px rgba(0,0,0,.08)`,
      padding: "var(--sp-5)",
      animation: "fadeUp .3s var(--ease-out) both",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Pulsing top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${urgency}, ${urgency}88)`,
        borderRadius: "20px 20px 0 0",
      }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-4)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: 4 }}>
            <span style={{ fontSize: "1.2rem" }}>📦</span>
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#111" }}>New Delivery Request</span>
          </div>
          <p style={{ fontSize: ".78rem", color: "#6B7280" }}>
            Order <span style={{ fontWeight: 700, color: "#111", fontFamily: "monospace" }}>#{orderId.slice(-6).toUpperCase()}</span>
          </p>
        </div>

        {/* Countdown SVG ring */}
        <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
          <svg width="56" height="56" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="28" cy="28" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="4" />
            <circle
              cx="28" cy="28" r={radius} fill="none"
              stroke={urgency}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference}`}
              style={{ transition: "stroke-dasharray .9s linear, stroke .3s" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: "1.1rem", color: urgency,
          }}>
            {secondsLeft}
          </div>
        </div>
      </div>

      {/* Urgency nudge */}
      <div style={{
        display: "flex", alignItems: "center", gap: "var(--sp-2)",
        padding: "var(--sp-2) var(--sp-3)",
        borderRadius: 10,
        background: `${urgency}15`,
        marginBottom: "var(--sp-4)",
        fontSize: ".8rem",
        color: urgency,
        fontWeight: 600,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: urgency, flexShrink: 0, animation: "livePulse 1s infinite" }} />
        {secondsLeft <= 3 ? "⚠️ Last chance!" : secondsLeft <= 6 ? "Expiring soon..." : "Accept to earn your delivery fee"}
      </div>

      {/* Accept button */}
      <button
        disabled={accepting}
        onClick={acceptOrder}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 14,
          background: accepting ? "#9CA3AF" : `linear-gradient(135deg, #10B981, #047857)`,
          color: "#fff",
          fontWeight: 800,
          fontSize: "1rem",
          border: "none",
          cursor: accepting ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--sp-2)",
          boxShadow: accepting ? "none" : "0 6px 20px rgba(16,185,129,.4)",
          transition: "all .2s",
          transform: accepting ? "none" : "translateY(0)",
        }}
        onMouseEnter={e => { if (!accepting) e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
      >
        {accepting
          ? <><span className="spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,.3)" }} /> Accepting...</>
          : <><span style={{ fontSize: "1.2rem" }}>✅</span> Accept Order</>
        }
      </button>

      <p style={{ textAlign: "center", fontSize: ".72rem", color: "#9CA3AF", marginTop: "var(--sp-2)" }}>
        Auto-dismisses in {secondsLeft}s
      </p>
    </div>
  );
};

export default RiderOrderRequest;
