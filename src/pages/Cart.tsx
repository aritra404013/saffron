import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { BASE_URL } from "../main";
import toast from "react-hot-toast";

const Cart = () => {
  const { cart, subTotal, quauntity, fetchCart } = useAppData();
  const navigate = useNavigate();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <div className="page-pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ fontSize: "3rem", marginBottom: "var(--sp-4)" }}>🛒</div>
        <h2 style={{ fontWeight: 700, marginBottom: "var(--sp-2)" }}>Your cart is empty</h2>
        <p style={{ color: "var(--text-3)", marginBottom: "var(--sp-6)" }}>Add items from a restaurant to get started</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>Browse Restaurants</button>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const changeQty = async (itemId: string, action: "inc" | "dec") => {
    try {
      setLoadingItemId(itemId);
      await axios.put(`${BASE_URL}/api/cart/${action}`, { itemId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchCart();
    } catch { toast.error("Something went wrong"); }
    finally { setLoadingItemId(null); }
  };

  const clearCart = async () => {
    if (!window.confirm("Clear your cart?")) return;
    try {
      setClearingCart(true);
      await axios.delete(`${BASE_URL}/api/cart/clear`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchCart();
    } catch { toast.error("Something went wrong"); }
    finally { setClearingCart(false); }
  };

  return (
    <div className="page-pad">
      <div className="container" style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-8)" }}>
          <span className="accent-line" />
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-.03em" }}>Your Cart</h1>
        </div>

        {/* Restaurant info */}
        <div className="card" style={{ padding: "var(--sp-4)", marginBottom: "var(--sp-4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
            <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: "var(--error-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>🍽️</div>
            <div>
              <p style={{ fontWeight: 700 }}>{restaurant.name}</p>
              <p style={{ fontSize: ".78rem", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>
                {(restaurant as any).autoLocation?.formattedAddress || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)", marginBottom: "var(--sp-4)" }}>
          {cart.map((cartItem: ICart) => {
            const item = cartItem.itemId as IMenuItem;
            const isLoading = loadingItemId === item._id;
            return (
              <div key={item._id} className="card" style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)", padding: "var(--sp-4)" }}>
                {item.image && <img src={item.image} alt="" style={{ width: 64, height: 64, borderRadius: "var(--r-md)", objectFit: "cover", flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: ".9rem" }}>{item.name}</p>
                  <p style={{ color: "var(--text-3)", fontSize: ".8rem" }}>₹{item.price} each</p>
                </div>
                {/* Qty controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
                  <button
                    disabled={isLoading}
                    onClick={() => changeQty(item._id, "dec")}
                    style={{ width: 30, height: 30, borderRadius: "50%", border: "1.5px solid var(--border)", background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-2)", transition: "border-color var(--t1)" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#F5A623"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                  >−</button>
                  <span style={{ fontWeight: 700, minWidth: 16, textAlign: "center" }}>
                    {isLoading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: "#F5A623", borderColor: "rgba(226,55,68,.2)" }} /> : cartItem.quauntity}
                  </span>
                  <button
                    disabled={isLoading}
                    onClick={() => changeQty(item._id, "inc")}
                    style={{ width: 30, height: 30, borderRadius: "50%", background: "#F5A623", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", color: "#fff" }}
                  >+</button>
                </div>
                <p style={{ fontWeight: 700, minWidth: 64, textAlign: "right" }}>₹{item.price * cartItem.quauntity}</p>
              </div>
            );
          })}
        </div>

        {/* Price summary */}
        <div className="card" style={{ padding: "var(--sp-5)" }}>
          <h3 style={{ fontWeight: 700, marginBottom: "var(--sp-4)" }}>Bill Summary</h3>
          {[
            { label: "Subtotal", value: `₹${subTotal}` },
            { label: "Delivery Fee", value: deliveryFee === 0 ? "🎉 Free" : `₹${deliveryFee}` },
            { label: "Platform Fee", value: `₹${platformFee}` },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-3)", fontSize: ".875rem", color: "var(--text-2)" }}>
              <span>{row.label}</span>
              <span style={{ fontWeight: 500, color: row.label === "Delivery Fee" && deliveryFee === 0 ? "var(--success)" : "var(--text-1)" }}>{row.value}</span>
            </div>
          ))}

          {subTotal < 250 && (
            <div style={{ padding: "var(--sp-2) var(--sp-3)", background: "var(--warning-bg)", borderRadius: "var(--r-sm)", marginBottom: "var(--sp-4)", fontSize: ".78rem", color: "#92400E" }}>
              ✨ Add ₹{250 - subTotal} more for FREE delivery!
            </div>
          )}

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--sp-3)", display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-5)", fontWeight: 800, fontSize: "1rem" }}>
            <span>Grand Total</span>
            <span style={{ color: "#F5A623" }}>₹{grandTotal}</span>
          </div>

          <button
            className="btn btn-primary"
            disabled={!restaurant.isOpen}
            onClick={() => navigate("/checkout")}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {restaurant.isOpen ? "Proceed to Checkout →" : "Restaurant is Closed"}
          </button>

          <button
            className="btn btn-ghost"
            disabled={clearingCart}
            onClick={clearCart}
            style={{ width: "100%", justifyContent: "center", marginTop: "var(--sp-2)" }}
          >
            {clearingCart ? <span className="spinner" style={{ borderTopColor: "var(--text-2)", borderColor: "var(--border)" }} /> : "🗑️ Clear Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
