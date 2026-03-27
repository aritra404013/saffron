import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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

// Navbar is only shown on these paths
const NavbarWrapper = () => {
  const location = useLocation();
  const noNavPaths = ["/login", "/select-role"];
  if (noNavPaths.includes(location.pathname)) return null;
  return <Navbar />;
};

const App = () => {
  const { user, loading } = useAppData();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#FAFAF9", gap: 16,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "linear-gradient(135deg, #F5A623, #D4891A)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.4rem",
          boxShadow: "0 8px 24px rgba(245,166,35,.35)",
          animation: "float 2s ease-in-out infinite",
        }}>✦</div>
        <p style={{ color: "#7A7A8C", fontSize: ".875rem", fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>
          Saffron Sky
        </p>
        <div style={{ display: "flex", gap: 5 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#F5A623",
              animation: `livePulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  // Role-based full-page apps (no router needed)
  if (user && user.role === "seller") return <Restaurant />;
  if (user && user.role === "rider") return <RiderDashboard />;
  if (user && user.role === "admin") return <Admin />;

  return (
    <BrowserRouter>
      <NavbarWrapper />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/paymentsuccess/:paymentId" element={<PaymentSuccess />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/ordersuccess" element={<OrderSuccess />} />
          <Route path="/address" element={<AddAddressPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
