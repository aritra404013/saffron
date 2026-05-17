import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import type { IRestaurant } from "../types";
import axios from "axios";
import { BASE_URL } from "../config";
import RestaurantCard from "../components/RestaurantCard";

const CUISINES = ["Burgers", "Pizza", "Sushi", "Healthy", "Chinese", "Indian", "Mexican", "Italian"];
const PRICE_LABELS = ["$", "$$", "$$$", "$$$$"];

const Discovery = () => {
  const { location } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

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

  const toggleCuisine = (c: string) => {
    setSelectedCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const clearFilters = () => {
    setSelectedCuisines([]);
    setSelectedPrice(null);
    setSearchInput("");
    setSearchParams({});
  };

  // Client-side filtering (since the backend doesn't support cuisine/price filters natively)
  const filteredRestaurants = restaurants.filter(r => {
    if (selectedCuisines.length > 0) {
      const nameMatch = selectedCuisines.some(c => r.name.toLowerCase().includes(c.toLowerCase()));
      const descMatch = r.description && selectedCuisines.some(c => r.description!.toLowerCase().includes(c.toLowerCase()));
      if (!nameMatch && !descMatch) return false;
    }
    return true;
  });

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px 80px", display: "grid", gap: "var(--sp-8)" }} className="discovery-grid">
      <style>{`
        .discovery-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .discovery-grid {
            grid-template-columns: 280px 1fr;
          }
        }
        .filter-checkbox {
          appearance: none;
          width: 16px; height: 16px; border: 1px solid var(--outline); border-radius: 4px;
          display: grid; place-content: center; cursor: pointer; transition: all 0.2s;
        }
        .filter-checkbox:checked {
          background-color: var(--primary); border-color: var(--primary);
        }
        .filter-checkbox:checked::before {
          content: ""; width: 10px; height: 10px; background-color: white; clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
        }
      `}</style>

      {/* Filter Sidebar (Hidden on mobile) */}
      <aside className="hide-mobile" style={{ position: "sticky", top: 100, height: "fit-content", display: "flex", flexDirection: "column", gap: "var(--sp-8)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-4)" }}>
          <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "24px", fontWeight: 700, color: "var(--charcoal)" }}>Filters</h2>
          <button onClick={clearFilters} style={{ background: "none", border: "none", color: "var(--primary)", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Clear all</button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 700, color: "var(--text-2)", marginBottom: "var(--sp-1)" }}>Search</h3>
          <div style={{ display: "flex", gap: "var(--sp-2)" }}>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search restaurants..."
              style={{
                flex: 1, padding: "var(--sp-2) var(--sp-3)", borderRadius: "8px",
                border: "1px solid var(--outline-variant)", background: "var(--surface)",
                color: "var(--text-1)", fontFamily: "'Inter', sans-serif", fontSize: "14px",
                outline: "none"
              }}
            />
            <button type="submit" style={{
              background: "var(--primary)", color: "var(--on-primary)",
              border: "none", borderRadius: "8px", padding: "var(--sp-2) var(--sp-3)",
              cursor: "pointer", display: "flex", alignItems: "center"
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>search</span>
            </button>
          </div>
        </form>

        {/* Cuisine */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 700, color: "var(--text-2)", marginBottom: "var(--sp-1)" }}>Cuisines</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
            {CUISINES.map(item => (
              <label key={item} style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={selectedCuisines.includes(item)}
                  onChange={() => toggleCuisine(item)}
                />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "var(--text-1)" }}>{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 700, color: "var(--text-2)", marginBottom: "var(--sp-1)" }}>Price Range</h3>
          <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--outline-variant)" }}>
            {PRICE_LABELS.map((p, idx) => (
              <button
                key={p}
                onClick={() => setSelectedPrice(selectedPrice === idx ? null : idx)}
                style={{
                  flex: 1, padding: "var(--sp-1) 0", fontFamily: "'Inter', sans-serif", fontSize: "12px",
                  fontWeight: selectedPrice === idx ? 700 : 500, textAlign: "center",
                  background: selectedPrice === idx ? "var(--primary)" : "var(--surface)",
                  color: selectedPrice === idx ? "var(--on-primary)" : "var(--text-1)",
                  border: "none",
                  borderRight: idx !== 3 ? "1px solid var(--outline-variant)" : "none",
                  cursor: "pointer"
                }}
              >{p}</button>
            ))}
          </div>
        </div>

        <button onClick={handleSearch} style={{
          width: "100%", background: "var(--primary)", color: "var(--on-primary)",
          fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "14px",
          padding: "var(--sp-3) 0", borderRadius: "8px", border: "none", cursor: "pointer",
          boxShadow: "var(--shadow-sm)", transition: "box-shadow 250ms"
        }}>Apply Filters</button>
      </aside>

      {/* Restaurant Grid Canvas */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--sp-8)" }}>
          <div>
            <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "32px", fontWeight: 700, color: "var(--charcoal)", marginBottom: "var(--sp-1)" }}>
              {search ? `Results for "${search}"` : "Popular Near You"}
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "var(--text-2)" }}>
              {loading ? "Finding restaurants..." : `${filteredRestaurants.length} restaurant${filteredRestaurants.length !== 1 ? "s" : ""} delivering to your location`}
            </p>
          </div>
          <button className="hide-desktop" style={{ display: "flex", alignItems: "center", gap: "var(--sp-1)", color: "var(--primary)", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "14px", padding: "var(--sp-1) var(--sp-3)", border: "1px solid var(--outline-variant)", borderRadius: "8px", background: "none", cursor: "pointer" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 0" }}>tune</span> Filters
          </button>
        </div>

        {/* Mobile search bar */}
        <form onSubmit={handleSearch} className="hide-desktop" style={{ marginBottom: "var(--sp-6)" }}>
          <div style={{ display: "flex", gap: "var(--sp-2)" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--surface-warm)", padding: "0 16px", borderRadius: "8px", height: 44 }}>
              <span className="material-symbols-outlined" style={{ color: "var(--text-2)", marginRight: "var(--sp-2)", fontSize: 20 }}>search</span>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--text-1)", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}
                placeholder="Search restaurants..."
              />
            </div>
            <button type="submit" style={{
              background: "var(--primary)", color: "var(--on-primary)", border: "none",
              borderRadius: "8px", padding: "0 16px", cursor: "pointer",
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "14px"
            }}>Go</button>
          </div>
        </form>

        {loading || !location ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--sp-6)" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                background: "var(--surface)", borderRadius: 12, overflow: "hidden",
                boxShadow: "0px 4px 12px rgba(45,52,70,0.05)", border: "1px solid var(--border)",
              }}>
                <div style={{ height: 180, background: "var(--surface-warm)", animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ padding: "var(--sp-4)", display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
                  <div style={{ height: 16, borderRadius: 8, width: "70%", background: "var(--surface-warm)", animation: "pulse 1.5s ease-in-out infinite" }} />
                  <div style={{ height: 12, borderRadius: 8, width: "50%", background: "var(--surface-warm)", animation: "pulse 1.5s ease-in-out infinite" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--sp-6)" }}>
            {filteredRestaurants.map((res, i) => {
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
              {search ? `No results for "${search}". Try a different search.` : "No restaurants available in your area yet."}
            </p>
            {search && (
              <button onClick={clearFilters} style={{
                marginTop: "var(--sp-4)", background: "var(--primary)", color: "var(--on-primary)",
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "14px",
                padding: "var(--sp-2) var(--sp-6)", borderRadius: "8px", border: "none", cursor: "pointer"
              }}>Clear Search</button>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default Discovery;
