import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAppData } from "../context/AppContext";

const PaymentSuccess = () => {
  const { paymentId } = useParams();
  const { fetchCart } = useAppData();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    const t = setTimeout(() => navigate("/orders"), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, var(--surface-warm) 0%, var(--surface-3) 100%)",
      padding: "var(--sp-8)",
    }}>
      <div className="anim-fade-up" style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%", margin: "0 auto var(--sp-6)",
          background: "linear-gradient(135deg, var(--gold-light), var(--gold))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2.8rem", boxShadow: "var(--shadow-gold)",
          animation: "pop .5s var(--ease) both",
        }}>💳</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "2.2rem", letterSpacing: ".01em", marginBottom: "var(--sp-3)" }}>
          Payment Successful!
        </h1>
        <p style={{ color: "var(--text-3)", lineHeight: 1.6, marginBottom: "var(--sp-4)", fontSize: ".95rem" }}>
          Your payment was processed successfully. Your order is being confirmed.
        </p>
        {paymentId && (
          <p style={{ fontSize: ".75rem", color: "var(--text-4)", background: "var(--surface-3)", padding: "var(--sp-2) var(--sp-3)", borderRadius: "var(--r-sm)", marginBottom: "var(--sp-8)", fontFamily: "monospace" }}>
            Ref: {paymentId}
          </p>
        )}
        <p style={{ fontSize: ".82rem", color: "var(--text-3)", marginBottom: "var(--sp-6)" }}>
          Redirecting to your orders in 6s...
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          <Link to="/orders" className="btn btn-primary" style={{ justifyContent: "center" }}>View Orders</Link>
          <Link to="/" className="btn btn-ghost" style={{ justifyContent: "center" }}>Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
