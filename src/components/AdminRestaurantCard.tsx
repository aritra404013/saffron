import axios from "axios";
import { useState } from "react";
import { BASE_URL } from "../main";
import toast from "react-hot-toast";

const AdminRestaurantCard = ({ restaurant, onVerify }: { restaurant: any; onVerify: () => void }) => {
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    try {
      setLoading(true);
      await axios.patch(`${BASE_URL}/api/admin/verify/restaurant/${restaurant._id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Restaurant verified!");
      onVerify();
    } catch { toast.error("Verification failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="card anim-fade-up" style={{ overflow: "hidden" }}>
      {restaurant.image && (
        <img src={restaurant.image} alt={restaurant.name} style={{ width: "100%", height: 140, objectFit: "cover" }} />
      )}
      <div style={{ padding: "var(--sp-4)" }}>
        <h3 style={{ fontWeight: 700, marginBottom: "var(--sp-1)" }}>{restaurant.name}</h3>
        {restaurant.description && (
          <p style={{ fontSize: ".8rem", color: "var(--text-3)", marginBottom: "var(--sp-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{restaurant.description}</p>
        )}
        {restaurant.autoLocation?.formattedAddress && (
          <p style={{ fontSize: ".75rem", color: "var(--text-3)", marginBottom: "var(--sp-3)", display: "flex", alignItems: "center", gap: 4 }}>
            📍 <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{restaurant.autoLocation.formattedAddress}</span>
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="badge badge-gold">⏳ Pending</span>
          <button className="btn btn-primary btn-sm" disabled={loading} onClick={verify}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "✓ Verify"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurantCard;
