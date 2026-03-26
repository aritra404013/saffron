import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { BASE_URL } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem } from "../types";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";

interface Address { _id: string; formattedAddress: string; mobile: number; }

const Checkout = () => {
  const { cart, subTotal, quauntity, fetchCart } = useAppData();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) { setLoadingAddress(false); return; }
      try {
        const { data } = await axios.get(`${BASE_URL}/api/address/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAddresses(data || []);
      } catch { /* ignore */ }
      finally { setLoadingAddress(false); }
    };
    fetchAddresses();
  }, [cart]);

  if (!cart || cart.length === 0) return (
    <div className="page-pad" style={{ textAlign: "center" }}>
      <p style={{ color: "var(--text-3)" }}>Your cart is empty.</p>
    </div>
  );

  // restaurant info available via cart[0].restaurantId if needed
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: "razorpay" | "stripe" | "cod") => {
    if (!selectedAddressId) { toast.error("Please select a delivery address"); return null; }
    setCreatingOrder(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/api/order/new`, { paymentMethod, addressId: selectedAddressId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return data;
    } catch { toast.error("Failed to create order"); return null; }
    finally { setCreatingOrder(false); }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);
      const order = await createOrder("razorpay");
      if (!order) return;
      const { data } = await axios.post(`${BASE_URL}/api/payment/create`, { orderId: order.orderId });
      const { razorpayOrderId, key } = data;
      const options = {
        key, amount: order.amount * 100, currency: "INR",
        name: "Tomato", description: "Food Order Payment",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await axios.post(`${BASE_URL}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.orderId,
            });
            toast.success("Payment successful 🎉");
            navigate("/paymentsuccess/" + response.razorpay_payment_id);
          } catch { toast.error("Payment verification failed"); }
        },
        theme: { color: "#E23744" },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch { toast.error("Payment failed"); }
    finally { setLoadingRazorpay(false); }
  };

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");
      if (!order) return;
      await stripePromise;
      const { data } = await axios.post(`${BASE_URL}/api/payment/stripe/create`, { orderId: order.orderId });
      if (data.url) window.location.href = data.url;
      else toast.error("Failed to create payment session");
    } catch { toast.error("Payment failed"); }
    finally { setLoadingStripe(false); }
  };

  const payWithCOD = async () => {
    const order = await createOrder("cod");
    if (!order) return;
    await fetchCart();
    toast.success("Order placed! Cash on Delivery 🎉");
    navigate("/ordersuccess");
  };

  const PAYMENT_METHODS = [
    { id: "razorpay", label: "Razorpay", icon: "💳", color: "#2D7FF9", loading: loadingRazorpay, action: payWithRazorpay },
    { id: "stripe", label: "Stripe", icon: "⚡", color: "#635BFF", loading: loadingStripe, action: payWithStripe },
    { id: "cod", label: "Cash on Delivery", icon: "💵", color: "var(--success)", loading: creatingOrder, action: payWithCOD },
  ];

  return (
    <div className="page-pad">
      <div className="container" style={{ maxWidth: 700 }}>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-.03em", marginBottom: "var(--sp-6)" }}>Checkout</h1>

        <div style={{ display: "grid", gap: "var(--sp-4)" }}>
          {/* Order summary */}
          <div className="card" style={{ padding: "var(--sp-5)" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "var(--sp-4)" }}>Order Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
              {cart.map((cartItem: ICart) => {
                const item = cartItem.itemId as IMenuItem;
                return (
                  <div key={cartItem._id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".875rem", color: "var(--text-2)" }}>
                    <span>{item.name} × {cartItem.quauntity}</span>
                    <span style={{ fontWeight: 600 }}>₹{item.price * cartItem.quauntity}</span>
                  </div>
                );
              })}
            </div>
            <hr className="divider" />
            {[
              { label: `Items (${quauntity})`, value: `₹${subTotal}` },
              { label: "Delivery Fee", value: deliveryFee === 0 ? "Free" : `₹${deliveryFee}`, highlight: deliveryFee === 0 },
              { label: "Platform Fee", value: `₹${platformFee}` },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", color: "var(--text-2)", marginBottom: "var(--sp-2)" }}>
                <span>{r.label}</span>
                <span style={{ fontWeight: 500, color: r.highlight ? "var(--success)" : "var(--text-1)" }}>{r.value}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.05rem", borderTop: "1px solid var(--border)", paddingTop: "var(--sp-3)", marginTop: "var(--sp-2)" }}>
              <span>Total</span>
              <span style={{ color: "var(--crimson)" }}>₹{grandTotal}</span>
            </div>
          </div>

          {/* Address selection */}
          <div className="card" style={{ padding: "var(--sp-5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-4)" }}>
              <h3 style={{ fontWeight: 700 }}>Delivery Address</h3>
              <button onClick={() => navigate("/address")} style={{ fontSize: ".8rem", color: "var(--crimson)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                + Add New
              </button>
            </div>
            {loadingAddress ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
                {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: "var(--r-md)" }} />)}
              </div>
            ) : addresses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "var(--sp-6) 0", color: "var(--text-3)" }}>
                <p>No saved addresses.</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: "var(--sp-3)" }} onClick={() => navigate("/address")}>Add Address</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
                {addresses.map(addr => (
                  <label key={addr._id} style={{
                    display: "flex", gap: "var(--sp-3)", padding: "var(--sp-3) var(--sp-4)",
                    borderRadius: "var(--r-md)", cursor: "pointer",
                    border: `1.5px solid ${selectedAddressId === addr._id ? "var(--crimson)" : "var(--border)"}`,
                    background: selectedAddressId === addr._id ? "var(--error-bg)" : "var(--surface)",
                    transition: "all var(--t1)",
                  }}>
                    <input type="radio" checked={selectedAddressId === addr._id} onChange={() => setSelectedAddressId(addr._id)} style={{ accentColor: "var(--crimson)", marginTop: 2 }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: ".85rem" }}>{addr.formattedAddress}</p>
                      <p style={{ fontSize: ".75rem", color: "var(--text-3)" }}>📞 {addr.mobile}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="card" style={{ padding: "var(--sp-5)" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "var(--sp-4)" }}>Payment Method</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
              {PAYMENT_METHODS.map(pm => (
                <button
                  key={pm.id}
                  disabled={!selectedAddressId || pm.loading || creatingOrder}
                  onClick={pm.action}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--sp-2)",
                    padding: "var(--sp-4)", borderRadius: "var(--r-md)",
                    background: pm.color, color: "#fff",
                    fontWeight: 700, fontSize: ".9rem", border: "none", cursor: "pointer",
                    opacity: !selectedAddressId || pm.loading || creatingOrder ? .5 : 1,
                    transition: "all var(--t2)",
                    boxShadow: `0 4px 16px ${pm.color}40`,
                  }}
                  onMouseEnter={e => { if (selectedAddressId) e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
                >
                  {pm.loading ? <span className="spinner" /> : <span style={{ fontSize: "1.1rem" }}>{pm.icon}</span>}
                  {pm.label}
                </button>
              ))}
            </div>
            {!selectedAddressId && (
              <p style={{ marginTop: "var(--sp-3)", textAlign: "center", fontSize: ".8rem", color: "var(--text-3)" }}>
                Select a delivery address to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
