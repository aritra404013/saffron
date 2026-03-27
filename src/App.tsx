import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/protectedRote";
import PublicRoute from "./components/publicRoute";
import SelectRole from "./pages/SelectRole";
import Navbar from "./components/navbar";
import Account from "./pages/Account";
import { useAppData } from "./context/AppContext";
import Restaurant from "./pages/Restaurant";
import RestaurantPage from "./pages/RestaurantPage";
import Cart from "./pages/Cart";
import AddAddressPage from "./pages/Address";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderPage from "./pages/OrderPage";
import RiderDashboard from "./pages/RiderDashboard";
import Admin from "./pages/Admin";

const App = () => {
  const { user, loading } = useAppData();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, var(--surface-warm) 0%, var(--surface-3) 100%)",
        gap: "var(--sp-5)",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "var(--r-xl)",
          background: "linear-gradient(135deg, var(--gold-light), var(--gold))",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "var(--shadow-gold)",
          animation: "float 2s ease-in-out infinite",
        }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", color: "#fff", fontWeight: 700, fontSize: "1.6rem" }}>S</span>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "1.1rem", color: "var(--text-2)", letterSpacing: ".06em" }}>
            SAFFRON SKY
          </p>
          <p style={{ color: "var(--text-4)", fontSize: ".78rem", marginTop: 4, letterSpacing: ".04em" }}>
            Finding restaurants near you...
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--gold)", opacity: .4,
              animation: `livePulse 1.2s ease-in-out ${i * .2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  if (user && user.role === "seller") return <Restaurant />;
  if (user && user.role === "rider") return <RiderDashboard />;
  if (user && user.role === "admin") return <Admin />;

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/paymentsuccess/:paymentId" element={<PaymentSuccess />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/ordersuccess" element={<OrderSuccess />} />
          <Route path="/address" element={<AddAddressPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
