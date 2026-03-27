import { useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../main";

interface Props {
  fetchMyRestaurant: () => Promise<void>;
}

const AddRestaurant = ({ fetchMyRestaurant }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loadingLocation, location } = useAppData();

  const handleSubmit = async () => {
    if (!name || !image || !location) {
      toast.error("Name, image and location are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
    formData.append("formattedAddress", location.formattedAddress);
    formData.append("file", image);
    formData.append("phone", phone);

    try {
      setSubmitting(true);
      await axios.post(`${BASE_URL}/api/restaurant/new`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Restaurant added! Pending admin verification.");
      fetchMyRestaurant();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #E8E5DF", borderRadius: 12,
    background: "#FAFAF9", color: "#111118",
    fontSize: ".875rem", fontFamily: "inherit",
    outline: "none", transition: "border-color 150ms, box-shadow 150ms",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#FAFAF9",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 16px",
    }}>
      <div style={{
        width: "100%", maxWidth: 520,
        background: "#fff", borderRadius: 24,
        border: "1px solid #E8E5DF",
        boxShadow: "0 4px 24px rgba(0,0,0,.07)",
        padding: "36px 32px",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #F5A623, #D4891A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem", boxShadow: "0 3px 10px rgba(245,166,35,.35)" }}>✦</div>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#111118", letterSpacing: "-.02em" }}>Add Your Restaurant</h1>
            <p style={{ fontSize: ".75rem", color: "#7A7A8C", marginTop: 2 }}>Fill in the details below to get started</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: ".75rem", fontWeight: 600, color: "#3D3D4A", marginBottom: 6, letterSpacing: ".01em" }}>Restaurant Name *</label>
            <input
              type="text"
              placeholder="e.g. The Spice Garden"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "#F5A623"; e.target.style.boxShadow = "0 0 0 3px rgba(245,166,35,.12)"; }}
              onBlur={e => { e.target.style.borderColor = "#E8E5DF"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: "block", fontSize: ".75rem", fontWeight: 600, color: "#3D3D4A", marginBottom: 6 }}>Contact Number</label>
            <input
              type="number"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "#F5A623"; e.target.style.boxShadow = "0 0 0 3px rgba(245,166,35,.12)"; }}
              onBlur={e => { e.target.style.borderColor = "#E8E5DF"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: ".75rem", fontWeight: 600, color: "#3D3D4A", marginBottom: 6 }}>Description</label>
            <textarea
              placeholder="Tell customers what makes your restaurant special..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
              onFocus={e => { e.target.style.borderColor = "#F5A623"; e.target.style.boxShadow = "0 0 0 3px rgba(245,166,35,.12)"; }}
              onBlur={e => { e.target.style.borderColor = "#E8E5DF"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Image upload */}
          <div>
            <label style={{ display: "block", fontSize: ".75rem", fontWeight: 600, color: "#3D3D4A", marginBottom: 6 }}>Restaurant Image *</label>
            <label style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 12,
              border: "1.5px dashed #D4D0C8",
              background: "#FAFAF9", cursor: "pointer",
              transition: "border-color 150ms, background 150ms",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#F5A623"; e.currentTarget.style.background = "rgba(245,166,35,.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#D4D0C8"; e.currentTarget.style.background = "#FAFAF9"; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>📷</div>
              <div>
                <p style={{ fontSize: ".83rem", fontWeight: 600, color: "#3D3D4A" }}>
                  {image ? image.name : "Click to upload image"}
                </p>
                <p style={{ fontSize: ".72rem", color: "#B0B0BE", marginTop: 2 }}>PNG, JPG up to 10MB</p>
              </div>
              <input type="file" accept="image/*" hidden onChange={e => setImage(e.target.files?.[0] || null)} />
            </label>
          </div>

          {/* Location */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            padding: "12px 16px", borderRadius: 12,
            background: "#F7F6F3", border: "1px solid #E8E5DF",
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(245,166,35,.1)", border: "1px solid rgba(245,166,35,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem", flexShrink: 0 }}>📍</div>
            <div>
              <p style={{ fontSize: ".75rem", fontWeight: 600, color: "#3D3D4A", marginBottom: 2 }}>Location</p>
              <p style={{ fontSize: ".78rem", color: "#7A7A8C", lineHeight: 1.5 }}>
                {loadingLocation
                  ? "Fetching your location..."
                  : location?.formattedAddress || "Location not available — please allow location access"}
              </p>
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={submitting || loadingLocation}
            onClick={handleSubmit}
            style={{
              width: "100%", padding: "13px",
              borderRadius: 12,
              background: submitting ? "#D4D0C8" : "linear-gradient(135deg, #F5A623, #D4891A)",
              color: "#fff", fontWeight: 700, fontSize: ".9rem",
              border: "none", cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: submitting ? "none" : "0 4px 16px rgba(245,166,35,.35)",
              transition: "all 200ms",
              fontFamily: "inherit",
              marginTop: 4,
            }}
            onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(245,166,35,.4)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = submitting ? "none" : "0 4px 16px rgba(245,166,35,.35)"; }}
          >
            {submitting ? "Submitting..." : "Add Restaurant"}
          </button>

          <p style={{ textAlign: "center", fontSize: ".72rem", color: "#B0B0BE", lineHeight: 1.6 }}>
            Your restaurant will be reviewed by our team before going live.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurant;
