import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { BASE_URL } from "../config";
import MenuItems from "../components/MenuItems";
import CartSummary from "../components/CartSummary";

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
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "var(--sp-6) 20px", minHeight: "100vh" }}>
      <div style={{ height: 200, background: "var(--surface-container-high)", borderRadius: 12, marginBottom: "var(--sp-6)", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--sp-4)" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            background: "var(--surface)", borderRadius: 12, boxShadow: "var(--shadow-md)", padding: "var(--sp-2)",
            display: "flex", gap: "var(--sp-4)", alignItems: "center"
          }}>
            <div style={{ width: 96, height: 96, borderRadius: 8, background: "var(--surface-container-high)", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
              <div style={{ height: 16, background: "var(--surface-container-high)", borderRadius: 8, width: "75%", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ height: 12, background: "var(--surface-container-high)", borderRadius: 8, width: "100%", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ height: 12, background: "var(--surface-container-high)", borderRadius: 8, width: "50%", animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!restaurant) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "0 20px" }}>
      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 24, fontWeight: 600, color: "var(--text-2)", marginBottom: "var(--sp-4)" }}>Restaurant not found.</p>
      <button onClick={() => navigate("/")} style={{ color: "var(--primary)", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, background: "none", border: "none", cursor: "pointer" }}>← Back to Home</button>
    </div>
  );

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "var(--sp-6) 20px var(--sp-20)", minHeight: "100vh" }}>
      <style>{`
        .restaurant-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--sp-6);
        }
        @media (min-width: 1024px) {
          .restaurant-grid {
            grid-template-columns: 1fr 380px;
          }
        }
      `}</style>

      <div className="restaurant-grid">
        {/* Left Content Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
          {/* Restaurant Header Card */}
          <section style={{ background: "var(--surface)", borderRadius: 12, boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
            {/* Hero Image */}
            <div style={{
              height: 200, width: "100%", backgroundSize: "cover", backgroundPosition: "center", position: "relative",
              backgroundImage: restaurant.image ? `url('${restaurant.image}')` : "none",
              backgroundColor: "var(--surface-container-high)"
            }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(39,24,18,0.8) 0%, transparent 60%)" }} />
              <button onClick={() => navigate(-1)} style={{
                position: "absolute", top: "var(--sp-4)", left: "var(--sp-4)",
                background: "rgba(255,248,246,0.9)", backdropFilter: "blur(8px)",
                color: "var(--text-1)", borderRadius: 9999, padding: "var(--sp-2) var(--sp-4)",
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12,
                boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: 4,
                border: "none", cursor: "pointer", transition: "color 200ms"
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span> Back
              </button>
            </div>

            {/* Restaurant Info */}
            <div style={{ padding: "var(--sp-6)", display: "flex", flexDirection: "column", gap: "var(--sp-4)", position: "relative", marginTop: -48 }}>
              <div style={{ display: "flex", gap: "var(--sp-4)", alignItems: "flex-end" }}>
                {restaurant.image ? (
                  <img src={restaurant.image} alt="Restaurant Logo" style={{
                    width: 96, height: 96, borderRadius: 12, boxShadow: "var(--shadow-lg)",
                    border: "4px solid var(--surface)", objectFit: "cover", background: "var(--surface)"
                  }} />
                ) : (
                  <div style={{
                    width: 96, height: 96, borderRadius: 12, boxShadow: "var(--shadow-lg)",
                    border: "4px solid var(--surface)", background: "var(--surface-container-high)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40
                  }}>🍽️</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-1)", flexWrap: "wrap" }}>
                    <span style={{
                      fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
                      padding: "4px var(--sp-2)", borderRadius: 9999,
                      display: "inline-flex", alignItems: "center", gap: 4,
                      background: restaurant.isOpen ? "rgba(0,109,55,0.1)" : "var(--surface-container-high)",
                      color: restaurant.isOpen ? "var(--secondary)" : "var(--text-2)"
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>storefront</span>
                      {restaurant.isOpen ? "Open Now" : "Closed"}
                    </span>
                    <span style={{
                      fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
                      padding: "4px var(--sp-2)", borderRadius: 9999,
                      display: "inline-flex", alignItems: "center", gap: 4,
                      background: "rgba(206,167,0,0.15)", color: "var(--warning)"
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>star</span>
                      4.8 (2.4k)
                    </span>
                  </div>
                  <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 32, fontWeight: 700, color: "var(--charcoal)", marginBottom: 4 }}>{restaurant.name}</h1>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "var(--text-2)", lineHeight: 1.5 }}>
                    {restaurant.description || restaurant.autoLocation?.formattedAddress || "A great place to eat!"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Menu Section */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-4)" }}>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 24, fontWeight: 600, color: "var(--charcoal)" }}>Menu</h2>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "var(--text-2)" }}>{menuItems.length} items</span>
            </div>

            {menuItems.length > 0 ? (
              <MenuItems isSeller={false} items={menuItems} onItemDeleted={fetchMenuItems} />
            ) : (
              <div style={{
                textAlign: "center", padding: "var(--sp-16) var(--sp-4)",
                color: "var(--text-2)", background: "var(--surface)", borderRadius: 12,
                border: "1px dashed var(--border)"
              }}>
                <div style={{ fontSize: 40, marginBottom: "var(--sp-3)" }}>🍽️</div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16 }}>No menu items available yet.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Sidebar / Cart (Desktop only) */}
        <div className="hide-mobile">
          <CartSummary isSidebar={true} />
        </div>
      </div>
    </main>
  );
};

export default RestaurantPage;
