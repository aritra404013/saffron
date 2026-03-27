import { Link } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useRef, useState } from "react";

/**
 * Swiggy-style floating cart bar.
 * • Only visible on mobile (hide-desktop hides it on large screens).
 * • Slides up from just above the bottom nav when the cart has items.
 * • Bounces briefly whenever the item count changes (item just added).
 * • Does NOT block navigation — it sits 56px above the bottom nav bar.
 */
const FloatingCartBar = () => {
  const { quauntity, subTotal, cart } = useAppData();
  const [bounce, setBounce] = useState(false);
  const prevQty = useRef(quauntity);

  // Trigger bounce animation whenever an item is added
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

  // Get restaurant name from first cart item
  const restaurantName = (cart?.[0] as any)?.restaurantId?.name || "your order";
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const grandTotal = subTotal + deliveryFee + 7; // platform fee

  return (
    <div
      className="hide-desktop"
      style={{
        position: "fixed",
        bottom: "calc(var(--bottom-nav-h) + 10px)",
        left: "var(--sp-3)",
        right: "var(--sp-3)",
        zIndex: 90,
        animation: bounce ? "cartBounce .5s var(--ease)" : "slideUp .35s var(--ease-out) both",
      }}
    >
      <Link
        to="/cart"
        style={{ textDecoration: "none" }}
      >
        <div style={{
          background: "linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 100%)",
          borderRadius: 18,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 8px 32px rgba(201,146,42,.45), 0 2px 8px rgba(0,0,0,.15)",
          gap: "var(--sp-3)",
        }}>
          {/* Left — item count badge + restaurant */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
            <div style={{
              minWidth: 36, height: 36, borderRadius: 12,
              background: "rgba(255,255,255,.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: ".9rem", color: "#fff",
              backdropFilter: "blur(4px)",
              padding: "0 var(--sp-2)",
            }}>
              {quauntity}
            </div>
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: ".875rem", lineHeight: 1.2 }}>
                {quauntity} item{quauntity > 1 ? "s" : ""} added
              </p>
              <p style={{ color: "rgba(255,255,255,.7)", fontSize: ".72rem" }}>
                from {restaurantName}
              </p>
            </div>
          </div>

          {/* Right — total + arrow */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", flexShrink: 0 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: ".95rem" }}>₹{grandTotal}</p>
              <p style={{ color: "rgba(255,255,255,.7)", fontSize: ".68rem" }}>View Cart</p>
            </div>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(255,255,255,.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".85rem",
            }}>
              →
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FloatingCartBar;
