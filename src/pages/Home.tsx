import { useSearchParams, Link } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { BASE_URL } from "../config";
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
  <div style={{
    background: "var(--surface)", borderRadius: 12, overflow: "hidden",
    boxShadow: "0px 4px 12px rgba(45,52,70,0.05)", border: "1px solid var(--border)",
  }}>
    <div style={{ height: 180, background: "var(--surface-warm)", animation: "pulse 1.5s ease-in-out infinite" }} />
    <div style={{ padding: "var(--sp-4)", display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
      <div style={{ height: 16, borderRadius: 8, width: "70%", background: "var(--surface-warm)", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: 12, borderRadius: 8, width: "50%", background: "var(--surface-warm)", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: 12, borderRadius: 8, width: "40%", background: "var(--surface-warm)", animation: "pulse 1.5s ease-in-out infinite" }} />
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
    <main style={{ paddingBottom: 80 }}>
      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{
        position: "relative",
        background: "var(--surface-warm)",
        padding: "var(--sp-8) 20px var(--sp-12)",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.2, zIndex: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover", backgroundPosition: "center", pointerEvents: "none"
        }} />

        <div style={{
          position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-8)"
        }}>
          <div style={{ width: "100%", textAlign: "center" }}>
            {/* City indicator */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: "var(--sp-4)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--primary)" }}>location_on</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600, color: "var(--text-2)" }}>{city}</span>
            </div>

            <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "40px", color: "var(--charcoal)", marginBottom: "var(--sp-6)", lineHeight: 1.2, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Lightning fast delivery.<br />
              <span style={{ color: "var(--primary)" }}>Fresh to your door.</span>
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "18px", color: "var(--text-2)", marginBottom: "var(--sp-8)", maxWidth: 512, margin: "0 auto var(--sp-8)" }}>
              Discover the best food and drinks in your city, delivered in minutes.
            </p>

            {/* Search bar — connected to backend */}
            <form onSubmit={handleSearch}>
              <div style={{
                background: "var(--surface)", padding: "var(--sp-2)", borderRadius: "12px",
                boxShadow: "0px 8px 24px rgba(45,52,70,0.12)",
                display: "flex", flexDirection: "column", gap: "var(--sp-2)", maxWidth: 672, margin: "0 auto"
              }} className="md-flex-row">
                <div style={{ display: "flex", alignItems: "center", flex: 1, background: "var(--surface-warm)", padding: "0 16px", borderRadius: "8px", height: 48 }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--text-2)", marginRight: "var(--sp-2)" }}>search</span>
                  <input
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--text-1)", fontFamily: "'Inter', sans-serif", fontSize: "16px" }}
                    placeholder="Search pizza, biryani, burgers..." type="text"
                  />
                </div>
                <button type="submit" style={{
                  background: "var(--primary)", color: "var(--on-primary)", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "14px",
                  padding: "0 32px", height: 48, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "none", cursor: "pointer",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <span className="material-symbols-outlined">search</span>
                  Find Food
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────── */}
      <section style={{ padding: "var(--sp-8) 20px 0", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "var(--sp-3)", overflowX: "auto", paddingBottom: "var(--sp-4)" }} className="scroll-hide">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => handleCategory(cat.label)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-2)",
                padding: "var(--sp-3) var(--sp-5)", borderRadius: "12px",
                background: search === cat.label ? "var(--primary)" : "var(--surface)",
                border: `1.5px solid ${search === cat.label ? "transparent" : "var(--border)"}`,
                boxShadow: search === cat.label ? "0 4px 12px rgba(168,57,0,0.3)" : "0px 4px 12px rgba(45,52,70,0.05)",
                whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0,
                transition: "all 250ms",
                animation: `fadeUp .4s var(--ease-out) ${i * 40}ms both`,
              }}
              onMouseEnter={e => { if (search !== cat.label) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0px 8px 24px rgba(45,52,70,0.12)"; e.currentTarget.style.borderColor = "var(--primary)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = search === cat.label ? "0 4px 12px rgba(168,57,0,0.3)" : "0px 4px 12px rgba(45,52,70,0.05)"; e.currentTarget.style.borderColor = search === cat.label ? "transparent" : "var(--border)"; }}
            >
              <span style={{ fontSize: "1.6rem" }}>{cat.icon}</span>
              <span style={{ fontSize: ".7rem", fontWeight: 700, color: search === cat.label ? "var(--on-primary)" : "var(--text-2)", letterSpacing: ".04em", textTransform: "uppercase" }}>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── RESTAURANTS FROM BACKEND ──────────────────── */}
      <section style={{ padding: "var(--sp-8) 20px var(--sp-12)", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--sp-6)" }}>
          <div>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "32px", fontWeight: 700, color: "var(--charcoal)", lineHeight: 1.2 }}>
              {search ? `Results for "${search}"` : "Restaurants Near You"}
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "var(--text-2)", marginTop: "4px" }}>
              {loading ? "Finding restaurants..." : `${restaurants.length} restaurant${restaurants.length !== 1 ? "s" : ""} delivering to you`}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
            {search && (
              <button onClick={() => { setSearchInput(""); setSearchParams({}); }} style={{
                color: "var(--primary)", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "14px",
                background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span> Clear
              </button>
            )}
            <Link to="/explore" className="hide-mobile" style={{ color: "var(--primary)", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "14px", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
              See all
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
            </Link>
          </div>
        </div>

        {loading || !location ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--sp-6)" }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : restaurants.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--sp-6)" }}>
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
          <div style={{
            textAlign: "center", padding: "var(--sp-16) var(--sp-4)",
            background: "var(--surface)", borderRadius: 12,
            border: "1px dashed var(--border)"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 64, color: "var(--text-3)", marginBottom: "var(--sp-4)", display: "block" }}>search_off</span>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "20px", color: "var(--text-1)", marginBottom: "var(--sp-2)" }}>
              No restaurants found
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "var(--text-2)" }}>
              {search ? `No results for "${search}". Try a different search term.` : "No restaurants available in your area yet."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;
