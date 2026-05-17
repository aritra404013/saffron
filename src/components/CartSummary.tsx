import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { BASE_URL } from "../config";
import toast from "react-hot-toast";

const CartSummary = ({ isSidebar = false }: { isSidebar?: boolean }) => {
  const { cart, subTotal, fetchCart } = useAppData();
  const navigate = useNavigate();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "var(--sp-6)",
        ...(isSidebar ? { height: "100%", minHeight: 400 } : { minHeight: "60vh" })
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, color: "var(--text-4)", marginBottom: "var(--sp-4)" }}>shopping_cart</span>
        <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 24, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Your cart is empty</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "var(--text-2)", marginBottom: "var(--sp-6)", textAlign: "center" }}>Add items from a restaurant to get started</p>
        {!isSidebar && (
          <button
            onClick={() => navigate("/")}
            className="btn btn-primary btn-lg"
          >Browse Restaurants</button>
        )}
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
    <div style={{
      background: "var(--surface)", borderRadius: 12,
      boxShadow: "var(--shadow-md)", border: "1px solid var(--border)",
      padding: "var(--sp-4)", display: "flex", flexDirection: "column",
      ...(isSidebar ? { height: "calc(100vh - 140px)", position: "sticky" as const, top: 100 } : {})
    }}>
      {/* Cart Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingBottom: "var(--sp-4)", borderBottom: "1px solid var(--border)",
        marginBottom: "var(--sp-4)", flexShrink: 0
      }}>
        <h2 style={{
          fontFamily: "'Montserrat', sans-serif", fontSize: 20, fontWeight: 600,
          color: "var(--text-1)", display: "flex", alignItems: "center", gap: "var(--sp-2)"
        }}>
          <span className="material-symbols-outlined">shopping_cart</span>
          Your Order
        </h2>
        <span style={{
          background: "var(--primary)", color: "var(--on-primary)",
          fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
          borderRadius: 9999, height: 24, width: 24,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {cart.reduce((acc, curr) => acc + curr.quauntity, 0)}
        </span>
      </div>

      {!isSidebar && (
        <div style={{
          display: "flex", alignItems: "center", gap: "var(--sp-2)",
          marginBottom: "var(--sp-4)", paddingBottom: "var(--sp-4)",
          borderBottom: "1px solid var(--border)", flexShrink: 0
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 6,
            background: "var(--surface-container-high)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0
          }}>🍽️</div>
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: "var(--text-1)" }}>{restaurant.name}</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 250 }}>
              {(restaurant as any).autoLocation?.formattedAddress || "Restaurant"}
            </p>
          </div>
        </div>
      )}

      {/* Cart Items (Scrollable) */}
      <div className="scroll-hide" style={{ flex: 1, overflowY: "auto", paddingRight: "var(--sp-2)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          {cart.map((cartItem: ICart) => {
            const item = cartItem.itemId as IMenuItem;
            const isLoading = loadingItemId === item._id;
            return (
              <div key={item._id} style={{ display: "flex", gap: "var(--sp-2)" }}>
                {/* Quantity controls */}
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  border: "1px solid var(--border)", borderRadius: 8, padding: 4, height: "fit-content"
                }}>
                  <button
                    disabled={isLoading}
                    onClick={() => changeQty(item._id, "inc")}
                    style={{
                      color: "var(--text-2)", background: "none", border: "none", cursor: "pointer",
                      transition: "color 200ms", opacity: isLoading ? 0.5 : 1, padding: 0
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-2)"}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                  </button>
                  <span style={{
                    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
                    color: "var(--text-1)", display: "flex", alignItems: "center", justifyContent: "center",
                    height: 16, width: 16
                  }}>
                    {isLoading ? (
                      <span style={{ width: 12, height: 12, border: "2px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
                    ) : cartItem.quauntity}
                  </span>
                  <button
                    disabled={isLoading}
                    onClick={() => changeQty(item._id, "dec")}
                    style={{
                      color: "var(--text-2)", background: "none", border: "none", cursor: "pointer",
                      transition: "color 200ms", opacity: isLoading ? 0.5 : 1, padding: 0
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--error)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-2)"}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>remove</span>
                  </button>
                </div>

                {/* Item info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h4 style={{
                      fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
                      color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap", paddingRight: 8
                    }}>{item.name}</h4>
                    <span style={{
                      fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
                      color: "var(--text-1)", flexShrink: 0
                    }}>₹{item.price * cartItem.quauntity}</span>
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "var(--text-2)" }}>₹{item.price} each</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Footer / Totals */}
      <div style={{ paddingTop: "var(--sp-4)", borderTop: "1px solid var(--border)", marginTop: "var(--sp-4)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "var(--text-2)" }}>Subtotal</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "var(--text-1)" }}>₹{subTotal}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-4)" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "var(--text-2)" }}>Taxes & Fees (₹{platformFee}) + Delivery</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "var(--text-1)" }}>₹{deliveryFee + platformFee}</span>
        </div>

        {subTotal < 250 && deliveryFee > 0 && (
          <div style={{
            padding: "4px var(--sp-2)", background: "rgba(206,167,0,0.15)",
            border: "1px solid rgba(206,167,0,0.3)", borderRadius: 6,
            marginBottom: "var(--sp-4)", fontFamily: "'Inter', sans-serif", fontSize: 13,
            fontWeight: 500, color: "var(--warning)"
          }}>
            ✨ Add ₹{250 - subTotal} more for FREE delivery!
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-6)" }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 24, fontWeight: 600, color: "var(--text-1)" }}>Total</span>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 24, fontWeight: 600, color: "var(--primary)" }}>₹{grandTotal}</span>
        </div>

        <button
          disabled={!restaurant.isOpen}
          onClick={() => navigate("/checkout")}
          style={{
            width: "100%", background: "var(--primary)", color: "var(--on-primary)",
            fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
            padding: "var(--sp-4)", borderRadius: 12,
            boxShadow: "var(--shadow-gold)", transition: "all 250ms",
            display: "flex", justifyContent: "center", alignItems: "center", gap: "var(--sp-2)",
            border: "none", cursor: restaurant.isOpen ? "pointer" : "not-allowed",
            opacity: restaurant.isOpen ? 1 : 0.5
          }}
          onMouseEnter={e => { if (restaurant.isOpen) e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => e.currentTarget.style.transform = ""}
        >
          {restaurant.isOpen ? (
            <>
              Checkout
              <span className="material-symbols-outlined">arrow_forward</span>
            </>
          ) : "Closed"}
        </button>

        <button
          disabled={clearingCart}
          onClick={clearCart}
          style={{
            width: "100%", marginTop: "var(--sp-2)",
            background: "transparent", color: "var(--error)",
            fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
            padding: "var(--sp-2)", borderRadius: 12,
            transition: "all 250ms", display: "flex", justifyContent: "center",
            alignItems: "center", gap: 4, border: "none", cursor: "pointer",
            opacity: clearingCart ? 0.5 : 1
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(186,26,26,0.08)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {clearingCart ? (
            <span style={{ width: 16, height: 16, border: "2px solid var(--error)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
              Clear Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
