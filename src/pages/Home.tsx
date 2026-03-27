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
        background: "linear-gradient(135deg, var(--ink) 0%, var(--charcoal) 50%, var(--ink-3) 100%)",
        borderRadius: "var(--r-2xl)", marginBottom: "var(--sp-10)",
        padding: "clamp(var(--sp-10), 6vw, var(--sp-16)) clamp(var(--sp-6), 4vw, var(--sp-12))",
        position: "relative", overflow: "hidden",
      }}>
        {/* Gold orb decorations */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,146,42,.16) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: "25%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,146,42,.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        {/* Top gold accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--gold-light), transparent)" }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} />
            <span style={{ fontSize: ".7rem", fontWeight: 700, color: "rgba(255,255,255,.45)", letterSpacing: ".12em", textTransform: "uppercase" }}>
              {city}
            </span>
          </div>
          <h1 className="anim-fade-up" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#fff", fontSize: "clamp(2rem, 5vw, 3.4rem)", fontWeight: 600, letterSpacing: ".01em", lineHeight: 1.15, marginBottom: "var(--sp-4)" }}>
            What are you<br />
            <span className="gold-shimmer">craving today?</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".95rem", marginBottom: "var(--sp-8)", maxWidth: 440, lineHeight: 1.7 }}>
            Discover curated restaurants near you. Premium food, swift delivery.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch}>
            <div style={{ display: "flex", gap: "var(--sp-2)", maxWidth: 540 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span style={{ position: "absolute", left: "var(--sp-5)", top: "50%", transform: "translateY(-50%)", fontSize: ".9rem", color: "rgba(255,255,255,.4)" }}>🔍</span>
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search pizza, biryani, burgers..."
                  style={{
                    width: "100%", padding: "var(--sp-4) var(--sp-5) var(--sp-4) calc(var(--sp-5) + 26px)",
                    borderRadius: "var(--r-full)", border: "1.5px solid rgba(255,255,255,.1)",
                    background: "rgba(255,255,255,.07)", backdropFilter: "blur(12px)",
                    color: "#fff", fontSize: ".9rem", fontFamily: "inherit",
                    transition: "all var(--t2)",
                  }}
                  onFocus={e => { e.target.style.background = "rgba(255,255,255,.12)"; e.target.style.borderColor = "var(--gold)"; }}
                  onBlur={e => { e.target.style.background = "rgba(255,255,255,.07)"; e.target.style.borderColor = "rgba(255,255,255,.1)"; }}
                />
              </div>
              <button type="submit" className="btn btn-gold" style={{ flexShrink: 0 }}>Search</button>
            </div>
          </form>

          {/* Stats */}
          <div style={{ display: "flex", gap: "var(--sp-8)", marginTop: "var(--sp-8)", flexWrap: "wrap" }}>
            {[{ value: "500+", label: "Restaurants" }, { value: "30 min", label: "Avg Delivery" }, { value: "4.8★", label: "Avg Rating" }].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--gold-light)", fontWeight: 600, fontSize: "1.3rem" }}>{s.value}</p>
                <p style={{ color: "rgba(255,255,255,.35)", fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        {/* ── CATEGORIES ──────────────────────────────────── */}
        <section style={{ marginBottom: "var(--sp-10)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-5)" }}>
            <p className="section-eyebrow">Browse by Category</p>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>
          <div style={{ display: "flex", gap: "var(--sp-3)", overflowX: "auto", paddingBottom: "var(--sp-2)" }} className="scroll-hide">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                onClick={() => handleCategory(cat.label)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-2)",
                  padding: "var(--sp-4) var(--sp-5)", borderRadius: "var(--r-xl)",
                  background: search === cat.label ? "linear-gradient(135deg, var(--gold-light), var(--gold))" : "var(--surface)",
                  border: `1.5px solid ${search === cat.label ? "transparent" : "var(--border)"}`,
                  boxShadow: search === cat.label ? "var(--shadow-gold)" : "0 2px 8px rgba(15,14,12,.05)",
                  whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0,
                  transition: "all var(--t2)",
                  animation: `fadeUp .4s var(--ease-out) ${i * 40}ms both`,
                }}
                onMouseEnter={e => { if (search !== cat.label) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.borderColor = "var(--gold)"; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = search === cat.label ? "var(--shadow-gold)" : "0 2px 8px rgba(15,14,12,.05)"; e.currentTarget.style.borderColor = search === cat.label ? "transparent" : "var(--border)"; }}
              >
                <span style={{ fontSize: "1.6rem" }}>{cat.icon}</span>
                <span style={{ fontSize: ".7rem", fontWeight: 700, color: search === cat.label ? "#fff" : "var(--text-2)", letterSpacing: ".04em", textTransform: "uppercase" }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── RESTAURANT GRID ──────────────────────────────── */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
              <p className="section-eyebrow">{search ? `Results for "${search}"` : "Restaurants Near You"}</p>
              {!loading && <span style={{ fontSize: ".72rem", fontWeight: 600, color: "var(--text-3)", background: "var(--surface-3)", padding: "2px 10px", borderRadius: "var(--r-full)" }}>({restaurants.length})</span>}
            </div>
            {search && (
              <button onClick={() => { setSearchInput(""); setSearchParams({}); }} style={{ fontSize: ".8rem", color: "var(--gold)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
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
