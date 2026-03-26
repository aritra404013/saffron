import axios from "axios";
import { useState } from "react";
import { BASE_URL } from "../main";
import toast from "react-hot-toast";

const RiderAdmin = ({ rider, onVerify }: { rider: any; onVerify: () => void }) => {
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    try {
      setLoading(true);
      await axios.patch(`${BASE_URL}/api/admin/verify/rider/${rider._id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Rider verified!");
      onVerify();
    } catch { toast.error("Verification failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="card anim-fade-up" style={{ padding: "var(--sp-5)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)", marginBottom: "var(--sp-4)" }}>
        {rider.picture ? (
          <img src={rider.picture} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,var(--success),#047857)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>🛵</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rider.userId?.name || "Rider"}</p>
          <p style={{ fontSize: ".75rem", color: "var(--text-3)" }}>{rider.userId?.email || ""}</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)", marginBottom: "var(--sp-4)" }}>
        {[
          { label: "📞 Phone", value: rider.phoneNumber },
          { label: "🪪 Aadhar", value: rider.aadharNumber ? `****${String(rider.aadharNumber).slice(-4)}` : "—" },
          { label: "🚗 License", value: rider.drivingLicenseNumber },
        ].map(f => (
          <div key={f.label} style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem" }}>
            <span style={{ color: "var(--text-3)" }}>{f.label}</span>
            <span style={{ color: "var(--text-1)", fontWeight: 500 }}>{f.value || "—"}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="badge badge-gold">⏳ Pending</span>
        <button className="btn btn-primary btn-sm" disabled={loading} onClick={verify} style={{ background: "linear-gradient(135deg,var(--success),#047857)", boxShadow: "0 4px 12px rgba(16,185,129,.3)" }}>
          {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "✓ Verify Rider"}
        </button>
      </div>
    </div>
  );
};

export default RiderAdmin;
