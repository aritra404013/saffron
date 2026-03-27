import { Link } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useRef, useState } from "react";

const FloatingCartBar = () => {
  const { quauntity, subTotal, cart } = useAppData();
  const [bounce, setBounce] = useState(false);
  const prevQty = useRef(quauntity);

  useEffect(() => {
    if (quauntity > prevQty.current) {
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 600);
      prevQty.current = quauntity;
      return () => clearTimeout(t);
    }
    prevQty.current = quauntity;
  }, [quauntity]);

  if (!quauntity || quauntity === 0) return null;

  const restaurantName = (cart?.[0] as any)?.restaurantId?.name || "your order";
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const grandTotal = subTotal + deliveryFee + 7;

  return (
    <div
      className="hide-desktop"
      style={{
        position: "fixed",
        bottom: "calc(var(--bottom-nav-h) + 10px)",
        left: 12, right: 12,
        zIndex: 90,
        animation: bounce ? "cartBounce .5s ease" : "slideUp .3s ease-out both",
      }}
    >
      <Link to="/cart" style={{ textDecoration: "none" }}>
        <div style={{
          background: "#111118",
          borderRadius: 18,
          padding: "13px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 8px 28px rgba(0,0,0,.3)",
          border: "1px solid rgba(245,166,35,.18)",
          gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              minWidth: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, #F5A623, #D4891A)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: ".82rem", color: "#fff",
              padding: "0 8px",
              boxShadow: "0 2px 8px rgba(245,166,35,.4)",
            }}>
              {quauntity}
            </div>
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: ".85rem", lineHeight: 1.2 }}>
                {quauntity} item{quauntity > 1 ? "s" : ""} in cart
              </p>
              <p style={{ color: "rgba(255,255,255,.4)", fontSize: ".68rem", marginTop: 1 }}>
                from {restaurantName}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "#F5A623", fontWeight: 800, fontSize: ".9rem" }}>₹{grandTotal}</p>
              <p style={{ color: "rgba(255,255,255,.35)", fontSize: ".62rem" }}>View Cart</p>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "rgba(245,166,35,.15)",
              border: "1px solid rgba(245,166,35,.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FloatingCartBar;
