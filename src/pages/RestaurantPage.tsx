import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { BASE_URL } from "../main";
import MenuItems from "../components/MenuItems";

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/restaurant/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRestaurant(data || null);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/item/all/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMenuItems(data);
    } catch { /* ignore */ }
  };

  useEffect(() => { if (id) { fetchRestaurant(); fetchMenuItems(); } }, [id]);

  if (loading) return (
    <div className="page-pad">
      <div className="container">
        <div className="skeleton" style={{ height: 280, borderRadius: "var(--r-xl)", marginBottom: "var(--sp-6)" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--sp-4)" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: "var(--sp-4)", display: "flex", gap: "var(--sp-3)" }}>
              <div className="skeleton" style={{ width: 80, height: 80, borderRadius: "var(--r-md)", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
                <div className="skeleton skeleton-title" style={{ width: "60%" }} />
                <div className="skeleton skeleton-text" style={{ width: "80%" }} />
                <div className="skeleton skeleton-text" style={{ width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!restaurant) return (
    <div className="page-pad" style={{ textAlign: "center" }}>
      <p style={{ color: "var(--text-3)" }}>Restaurant not found.</p>
      <button className="btn btn-ghost" style={{ marginTop: "var(--sp-4)" }} onClick={() => navigate("/")}>← Back to Home</button>
    </div>
  );

  return (
    <div className="page-pad">
      {/* Hero Banner */}
      <div style={{
        position: "relative", height: 260, borderRadius: "var(--r-xl)", overflow: "hidden",
        marginBottom: "var(--sp-6)", background: "#26262F",
      }}>
        {restaurant.image ? (
          <img src={restaurant.image} alt={restaurant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>🍽️</div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 60%)" }} />

        <button onClick={() => navigate(-1)} style={{
          position: "absolute", top: "var(--sp-4)", left: "var(--sp-4)",
          background: "rgba(255,255,255,.9)", backdropFilter: "blur(8px)",
          border: "none", borderRadius: "var(--r-full)",
          padding: "var(--sp-2) var(--sp-4)", fontSize: ".85rem", fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: "var(--sp-1)",
        }}>← Back</button>

        <div style={{ position: "absolute", bottom: "var(--sp-5)", left: "var(--sp-5)", right: "var(--sp-5)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-.03em", textShadow: "0 2px 8px rgba(0,0,0,.4)" }}>
                {restaurant.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginTop: "var(--sp-1)" }}>
                <span className={`badge ${restaurant.isOpen ? "badge-green" : "badge-gray"}`}>
                  {restaurant.isOpen ? "● Open Now" : "● Closed"}
                </span>
                <span style={{ color: "rgba(255,255,255,.8)", fontSize: ".8rem" }}>
                  ★ 4.2 · 25–35 min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Address */}
        {restaurant.autoLocation?.formattedAddress && (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-6)", color: "var(--text-3)", fontSize: ".85rem" }}>
            <span>📍</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {restaurant.autoLocation.formattedAddress}
            </span>
          </div>
        )}

        {/* Menu */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-5)" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.25rem" }}>Menu</h2>
          <span style={{ color: "var(--text-3)", fontSize: ".85rem" }}>{menuItems.length} items</span>
        </div>

        {menuItems.length > 0 ? (
          <MenuItems isSeller={false} items={menuItems} onItemDeleted={fetchMenuItems} />
        ) : (
          <div style={{ textAlign: "center", padding: "var(--sp-16) 0", color: "var(--text-3)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "var(--sp-3)" }}>🍽️</div>
            <p>No menu items available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantPage;
