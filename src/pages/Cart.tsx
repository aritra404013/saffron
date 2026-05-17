import CartSummary from "../components/CartSummary";

const Cart = () => {
  return (
    <div className="page-pad" style={{ maxWidth: 600, margin: "0 auto", padding: "var(--sp-6) 20px", paddingBottom: 120, minHeight: "100vh" }}>
      <CartSummary isSidebar={false} />
    </div>
  );
};

export default Cart;
