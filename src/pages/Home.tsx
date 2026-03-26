import { useSearchParams, useNavigate } from "react-router-dom";
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
    <div className="skeleton skeleton-image" style={{ borderRadius: 0 }} />
    <div style={{ padding: "var(--sp-4)", display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
      <div className="skeleton skeleton-title" style={{ width: "70%" }} />
      <div className="skeleton skeleton-text" style={{ width: "50%" }} />
      <div className="skeleton skeleton-text" style={{ width: "40%" }} />
    </div>
  </div>
);

const Home = () => {
  const { location, city } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get("search") || "";

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);

  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return +(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
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
      {/* ── HERO ────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #E23744 0%, #9B1C28 60%, #121212 100%)",
        borderRadius: "var(--r-2xl)", marginBottom: "var(--sp-8)",
        padding: "var(--sp-12) var(--sp-8)", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
        <div style={{ position: "absolute", bottom: -40, left: "30%", width: 200, height: 200, borderRadius: "50%", background: "rgba(245,158,11,.15)" }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
            <span style={{ fontSize: ".75rem", fontWeight: 700, color: "rgba(255,255,255,.7)", letterSpacing: ".1em", textTransform: "uppercase" }}>📍 {city}</span>
          </div>
          <h1 className="anim-fade-up" style={{ color: "#fff", fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1.1, marginBottom: "var(--sp-3)" }}>
            What are you<br />craving today? 😋
          </h1>
          <p style={{ color: "rgba(255,255,255,.72)", fontSize: ".95rem", marginBottom: "var(--sp-6)", maxWidth: 460 }}>
            Order from 500+ restaurants near you. Fresh food, fast delivery.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch}>
            <div style={{ display: "flex", gap: "var(--sp-2)", maxWidth: 520 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span style={{ position: "absolute", left: "var(--sp-4)", top: "50%", transform: "translateY(-50%)", fontSize: "1rem" }}>🔍</span>
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search pizza, biryani, burgers..."
                  style={{
                    width: "100%", padding: "var(--sp-4) var(--sp-4) var(--sp-4) calc(var(--sp-4) + 24px)",
                    borderRadius: "var(--r-full)", border: "none",
                    background: "rgba(255,255,255,.95)", fontSize: ".9rem",
                    boxShadow: "0 4px 24px rgba(0,0,0,.2)", fontFamily: "inherit",
                  }}
                />
              </div>
              <button type="submit" className="btn btn-gold">Search</button>
            </div>
          </form>
        </div>
      </div>

      <div className="container">
        {/* ── CATEGORIES ──────────────────────────────────── */}
        <section style={{ marginBottom: "var(--sp-10)" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "var(--sp-4)", color: "var(--text-1)" }}>Browse by Category</h2>
          <div style={{ display: "flex", gap: "var(--sp-3)", overflowX: "auto", paddingBottom: "var(--sp-2)" }} className="scroll-hide">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                onClick={() => handleCategory(cat.label)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-2)",
                  padding: "var(--sp-4) var(--sp-5)", borderRadius: "var(--r-xl)",
                  background: search === cat.label ? "linear-gradient(135deg,var(--crimson),var(--crimson-dark))" : "var(--surface)",
                  border: `1.5px solid ${search === cat.label ? "transparent" : "var(--border)"}`,
                  boxShadow: search === cat.label ? "var(--shadow-red)" : "var(--shadow-sm)",
                  whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0,
                  transition: "all var(--t2)",
                  animation: `fadeUp .4s var(--ease-out) ${i * 40}ms both`,
                }}
                onMouseEnter={e => { if (search !== cat.label) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = search === cat.label ? "var(--shadow-red)" : "var(--shadow-sm)"; }}
              >
                <span style={{ fontSize: "1.6rem" }}>{cat.icon}</span>
                <span style={{ fontSize: ".75rem", fontWeight: 600, color: search === cat.label ? "#fff" : "var(--text-2)" }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── RESTAURANT GRID ──────────────────────────────── */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-4)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-1)" }}>
              {search ? `Results for "${search}"` : "Restaurants near you"}
              {!loading && <span style={{ marginLeft: "var(--sp-2)", fontSize: ".85rem", fontWeight: 400, color: "var(--text-3)" }}>({restaurants.length})</span>}
            </h2>
            {search && (
              <button onClick={() => { setSearchInput(""); setSearchParams({}); }} style={{ fontSize: ".8rem", color: "var(--crimson)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                Clear ×
              </button>
            )}
          </div>

          {loading || !location ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--sp-4)" }}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : restaurants.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--sp-4)" }}>
              {restaurants.map((res, i) => {
                const [resLng, resLat] = res.autoLocation.coordinates;
                const distance = getDistanceKm(location.latitude, location.longitude, resLat, resLng);
                return (
                  <div key={res._id} style={{ animation: `fadeUp .4s var(--ease-out) ${i * 50}ms both` }}>
                    <RestaurantCard id={res._id} name={res.name} image={res.image ?? ""} distance={`${distance}`} isOpen={res.isOpen} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "var(--sp-20) 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: "var(--sp-4)" }}>🍽️</div>
              <h3 style={{ fontWeight: 700, marginBottom: "var(--sp-2)" }}>No restaurants found</h3>
              <p style={{ color: "var(--text-3)", fontSize: ".875rem" }}>
                {search ? `No results for "${search}". Try a different search.` : "No restaurants are available near you right now."}
              </p>
              {search && (
                <button onClick={() => { setSearchInput(""); setSearchParams({}); }} className="btn btn-ghost" style={{ marginTop: "var(--sp-6)" }}>
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
