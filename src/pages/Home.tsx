import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { BASE_URL } from "../main";
import RestaurantCard from "../components/RestaurantCard";

const CATEGORIES = [
  { icon: "🍕", label: "Pizza" },
  { icon: "🍔", label: "Burgers" },
  { icon: "🌮", label: "Tacos" },
  { icon: "🍜", label: "Noodles" },
  { icon: "🍱", label: "Chinese" },
  { icon: "🥗", label: "Salads" },
  { icon: "🍛", label: "Biryani" },
  { icon: "🍰", label: "Desserts" },
];

const SkeletonCard = () => (
  <div className="card" style={{ overflow: "hidden" }}>
    <div className="skeleton" style={{ aspectRatio: "4/3", borderRadius: 0 }} />
    <div style={{ padding: "var(--sp-4)", display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
      <div className="skeleton skeleton-title" style={{ width: "65%" }} />
      <div className="skeleton skeleton-text" style={{ width: "45%" }} />
      <div className="skeleton skeleton-text" style={{ width: "35%" }} />
    </div>
  </div>
);

const Home = () => {
  const { location, city } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);

  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  };

  const fetchRestaurants = async () => {
    if (!location?.latitude || !location?.longitude) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/api/restaurant/all`, {
        params: { latitude: location.latitude, longitude: location.longitude, search },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRestaurants(data.restaurants ?? []);
    } catch { setRestaurants([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRestaurants(); }, [location, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search: searchInput });
  };

  const handleCategory = (label: string) => {
    setSearchInput(label);
    setSearchParams({ search: label });
  };

  return (
    <div className="page-pad">

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{
        background: "#111118",
        borderRadius: 28,
        marginBottom: 48,
        padding: "56px 48px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Glow accents */}
        <div style={{ position: "absolute", top: -80, right: -60, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,.16) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: "25%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,.1) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          {/* Location chip */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginBottom: 24, padding: "5px 14px",
            borderRadius: 999, background: "rgba(245,166,35,.1)",
            border: "1px solid rgba(245,166,35,.2)",
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span style={{ fontSize: ".72rem", fontWeight: 700, color: "#F5A623", letterSpacing: ".07em", textTransform: "uppercase" }}>{city}</span>
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            color: "#fff",
            fontSize: "clamp(1.9rem, 5vw, 3.2rem)",
            fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1.1,
            marginBottom: 16,
          }}>
            Great food,<br />
            <span style={{ color: "#F5A623" }}>delivered fast.</span>
          </h1>

          <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem", marginBottom: 36, maxWidth: 400, lineHeight: 1.7 }}>
            Discover top restaurants near you and get your favourites delivered in minutes.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch}>
            <div style={{ display: "flex", gap: 8, maxWidth: 520 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search pizza, biryani, burgers..."
                  style={{
                    width: "100%",
                    padding: "14px 16px 14px 44px",
                    borderRadius: 14,
                    border: "1.5px solid rgba(255,255,255,.1)",
                    background: "rgba(255,255,255,.07)",
                    color: "#fff", fontSize: ".875rem",
                    fontFamily: "inherit",
                    transition: "border-color 200ms, background 200ms",
                  }}
                  onFocus={e => { e.target.style.borderColor = "#F5A623"; e.target.style.background = "rgba(255,255,255,.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.1)"; e.target.style.background = "rgba(255,255,255,.07)"; }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: "14px 24px", borderRadius: 14,
                  background: "linear-gradient(135deg, #F5A623, #D4891A)",
                  color: "#fff", fontWeight: 700, fontSize: ".875rem",
                  border: "none", cursor: "pointer", flexShrink: 0,
                  boxShadow: "0 4px 16px rgba(245,166,35,.4)",
                  transition: "transform 200ms, box-shadow 200ms",
                  fontFamily: "inherit",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(245,166,35,.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(245,166,35,.4)"; }}
              >
                Search
              </button>
            </div>
          </form>

          {/* Stats */}
          <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
            {[
              { value: "500+", label: "Restaurants" },
              { value: "30 min", label: "Avg. Delivery" },
              { value: "4.8 ★", label: "Avg. Rating" },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#fff", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: ".7rem", color: "rgba(255,255,255,.38)", fontWeight: 500, letterSpacing: ".05em", textTransform: "uppercase", marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">

        {/* ── CATEGORIES ──────────────────────────────────── */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 18, borderRadius: 99, background: "linear-gradient(180deg, #F5A623, #D4891A)" }} />
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: ".95rem", fontWeight: 700, color: "#111118", letterSpacing: "-.01em" }}>Browse by Category</h2>
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }} className="scroll-hide">
            {CATEGORIES.map((cat, i) => {
              const active = search === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => handleCategory(cat.label)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    padding: "16px 20px",
                    borderRadius: 16,
                    background: active ? "#111118" : "#fff",
                    border: `1.5px solid ${active ? "#F5A623" : "#E8E5DF"}`,
                    boxShadow: active ? "0 4px 20px rgba(245,166,35,.25)" : "0 1px 4px rgba(0,0,0,.05)",
                    whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0,
                    transition: "all 220ms ease",
                    animation: `fadeUp .4s ease-out ${i * 35}ms both`,
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#F5A623"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(245,166,35,.15)"; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "#E8E5DF"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.05)"; } }}
                >
                  <span style={{ fontSize: "1.4rem" }}>{cat.icon}</span>
                  <span style={{ fontSize: ".7rem", fontWeight: 700, color: active ? "#F5A623" : "#3D3D4A", letterSpacing: ".02em" }}>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── RESTAURANT GRID ──────────────────────────────── */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 3, height: 18, borderRadius: 99, background: "linear-gradient(180deg, #F5A623, #D4891A)" }} />
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: ".95rem", fontWeight: 700, color: "#111118" }}>
                {search ? `Results for "${search}"` : "Restaurants near you"}
                {!loading && (
                  <span style={{ marginLeft: 8, fontSize: ".8rem", fontWeight: 500, color: "#B0B0BE", fontFamily: "Inter, sans-serif" }}>
                    ({restaurants.length})
                  </span>
                )}
              </h2>
            </div>
            {search && (
              <button
                onClick={() => { setSearchInput(""); setSearchParams({}); }}
                style={{ fontSize: ".78rem", color: "#F5A623", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
              >
                Clear ×
              </button>
            )}
          </div>

          {loading || !location ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 20 }}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : restaurants.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 20 }}>
              {restaurants.map((res, i) => {
                const [resLng, resLat] = res.autoLocation.coordinates;
                const distance = getDistanceKm(location.latitude, location.longitude, resLat, resLng);
                return (
                  <div key={res._id} style={{ animation: `fadeUp .4s ease-out ${i * 45}ms both` }}>
                    <RestaurantCard id={res._id} name={res.name} image={res.image ?? ""} distance={`${distance}`} isOpen={res.isOpen} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🍽️</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 8, color: "#111118" }}>No restaurants found</h3>
              <p style={{ color: "#7A7A8C", fontSize: ".875rem" }}>
                {search ? `No results for "${search}". Try something else.` : "No restaurants available near you right now."}
              </p>
              {search && (
                <button
                  onClick={() => { setSearchInput(""); setSearchParams({}); }}
                  style={{
                    marginTop: 24, padding: "10px 24px", borderRadius: 999,
                    border: "1.5px solid #D4D0C8", background: "transparent",
                    color: "#3D3D4A", fontWeight: 600, fontSize: ".875rem",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Show all restaurants
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
