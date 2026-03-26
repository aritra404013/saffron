import { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { BASE_URL } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

interface Props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const { setIsAuth, setUser } = useAppData();

  const toggleOpen = async () => {
    try {
      setToggling(true);
      const { data } = await axios.put(
        `${BASE_URL}/api/restaurant/status`,
        { status: !isOpen },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally { setToggling(false); }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${BASE_URL}/api/restaurant/edit`,
        { name, description },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(data.message);
      onUpdate(data.restaurant);
      setEditMode(false);
    } catch {
      toast.error("Failed to update");
    } finally { setLoading(false); }
  };

  const logout = async () => {
    await axios.put(
      `${BASE_URL}/api/restaurant/status`,
      { status: false },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    localStorage.setItem("token", "");
    setIsAuth(false);
    setUser(null);
    toast.success("Logged out");
  };

  return (
    <div style={{ maxWidth: 560, animation: "fadeUp .35s var(--ease-out) both" }}>

      {/* Cover image */}
      <div style={{ position: "relative", borderRadius: "var(--r-xl)", overflow: "hidden", marginBottom: "var(--sp-5)", boxShadow: "var(--shadow-md)" }}>
        {restaurant.image ? (
          <img src={restaurant.image} alt={restaurant.name} style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: 200, background: "linear-gradient(135deg, var(--charcoal), #374151)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
            🍽️
          </div>
        )}
        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 60%)" }} />
        {/* Status badge on image */}
        <div style={{ position: "absolute", top: "var(--sp-3)", right: "var(--sp-3)" }}>
          <span style={{
            padding: "5px 14px", borderRadius: "var(--r-full)",
            background: isOpen ? "rgba(16,185,129,.9)" : "rgba(226,55,68,.9)",
            color: "#fff", fontWeight: 700, fontSize: ".75rem",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block", animation: isOpen ? "livePulse 1.5s infinite" : "none" }} />
            {isOpen ? "OPEN" : "CLOSED"}
          </span>
        </div>
        {/* Name on image */}
        <div style={{ position: "absolute", bottom: "var(--sp-4)", left: "var(--sp-5)", right: "var(--sp-5)" }}>
          <p style={{ color: "#fff", fontWeight: 800, fontSize: "1.3rem", textShadow: "0 2px 8px rgba(0,0,0,.4)" }}>
            {restaurant.name}
          </p>
        </div>
      </div>

      {/* Details card */}
      <div className="card" style={{ padding: "var(--sp-5)" }}>
        {/* Edit / View fields */}
        {editMode ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)", marginBottom: "var(--sp-5)" }}>
            <div className="form-group">
              <label className="label">Restaurant Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Restaurant name" />
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your restaurant..." style={{ resize: "vertical", fontFamily: "inherit" }} />
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "var(--sp-5)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--sp-3)", marginBottom: "var(--sp-3)" }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "var(--sp-1)" }}>{restaurant.name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: ".8rem", color: "var(--text-3)" }}>
                  <span>📍</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 340 }}>
                    {restaurant.autoLocation?.formattedAddress || "Location unavailable"}
                  </span>
                </div>
              </div>
              {isSeller && (
                <button onClick={() => setEditMode(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: "var(--r-md)", background: "var(--surface-2)", border: "1px solid var(--border)", fontWeight: 600, fontSize: ".78rem", cursor: "pointer", color: "var(--text-2)", flexShrink: 0 }}>
                  ✏️ Edit
                </button>
              )}
            </div>

            <p style={{ fontSize: ".875rem", color: "var(--text-2)", lineHeight: 1.6 }}>
              {restaurant.description || <span style={{ color: "var(--text-4)", fontStyle: "italic" }}>No description added yet.</span>}
            </p>
          </div>
        )}

        {/* Info row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)", marginBottom: "var(--sp-5)" }}>
          {[
            { icon: restaurant.isVerified ? "✅" : "⏳", label: "Verification", value: restaurant.isVerified ? "Verified" : "Pending", color: restaurant.isVerified ? "var(--success)" : "#B45309" },
            { icon: "📅", label: "Member since", value: new Date(restaurant.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }), color: "var(--text-1)" },
          ].map(item => (
            <div key={item.label} style={{ padding: "var(--sp-3) var(--sp-4)", background: "var(--surface-2)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "1.1rem", marginBottom: 4 }}>{item.icon}</p>
              <p style={{ fontSize: ".72rem", color: "var(--text-3)", marginBottom: 2 }}>{item.label}</p>
              <p style={{ fontWeight: 700, fontSize: ".85rem", color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "var(--sp-3)", flexWrap: "wrap" }}>
          {editMode ? (
            <>
              <button className="btn btn-ghost" onClick={() => setEditMode(false)} disabled={loading}>Cancel</button>
              <button className="btn btn-primary" onClick={saveChanges} disabled={loading} style={{ flex: 1, justifyContent: "center" }}>
                {loading ? <><span className="spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,.3)" }} /> Saving...</> : "💾 Save Changes"}
              </button>
            </>
          ) : isSeller && (
            <>
              {/* Open / Close toggle */}
              <button
                onClick={toggleOpen}
                disabled={toggling}
                style={{
                  flex: 1, padding: "var(--sp-3)", borderRadius: "var(--r-md)", border: "none", cursor: "pointer",
                  fontWeight: 700, fontSize: ".85rem", transition: "all var(--t2)",
                  background: isOpen ? "linear-gradient(135deg,#E23744,#b91c1c)" : "linear-gradient(135deg,#10B981,#047857)",
                  color: "#fff",
                  boxShadow: isOpen ? "0 4px 16px rgba(226,55,68,.3)" : "0 4px 16px rgba(16,185,129,.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--sp-2)",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
              >
                {toggling
                  ? <span className="spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,.3)" }} />
                  : <>{isOpen ? "🔴 Close Restaurant" : "🟢 Open Restaurant"}</>
                }
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="btn btn-ghost"
                style={{ padding: "var(--sp-3) var(--sp-4)" }}
              >
                🚪
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;
