import { Link } from "react-router-dom";

const OrderSuccess = () => (
  <div style={{
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, var(--surface-warm) 0%, var(--surface-3) 100%)",
    padding: "var(--sp-8)",
  }}>
    <div className="anim-fade-up" style={{ textAlign: "center", maxWidth: 420 }}>
      <div style={{
        width: 100, height: 100, borderRadius: "50%", margin: "0 auto var(--sp-6)",
        background: "linear-gradient(135deg, var(--success), #047857)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "2.8rem", boxShadow: "0 12px 40px rgba(22,163,74,.3)",
        animation: "pop .5s var(--ease) both",
      }}>🎉</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "2.2rem", letterSpacing: ".01em", marginBottom: "var(--sp-3)" }}>
        Order Confirmed!
      </h1>
      <p style={{ color: "var(--text-3)", lineHeight: 1.7, marginBottom: "var(--sp-8)", fontSize: ".95rem" }}>
        Your order has been placed successfully. The restaurant will start preparing it soon.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
        <Link to="/orders" className="btn btn-primary" style={{ justifyContent: "center" }}>Track Order</Link>
        <Link to="/" className="btn btn-ghost" style={{ justifyContent: "center" }}>Back to Home</Link>
      </div>
    </div>
  </div>
);

export default OrderSuccess;
