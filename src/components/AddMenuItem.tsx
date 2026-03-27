import axios from "axios";
import { useState } from "react";
import { BASE_URL } from "../main";
import toast from "react-hot-toast";

const AddMenuItem = ({ onItemAdded }: { onItemAdded: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImage = (file: File | undefined) => {
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setName(""); setDescription(""); setPrice("");
    setImage(null); setPreview(null);
  };

  const handleSubmit = async () => {
    if (!name || !price || !image) {
      toast.error("Name, price and image are required");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("file", image);

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/api/item/new`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Item added! 🎉");
      resetForm();
      onItemAdded();
    } catch {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", animation: "fadeUp .35s var(--ease-out) both" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--sp-6)" }}>
        <h2 style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-.02em", marginBottom: 4 }}>Add Menu Item</h2>
        <p style={{ color: "var(--text-3)", fontSize: ".85rem" }}>Fill in the details below to add a new dish to your menu</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
        {/* Image upload */}
        <div>
          <label style={{ display: "block", fontWeight: 600, fontSize: ".82rem", color: "var(--text-2)", marginBottom: "var(--sp-2)" }}>
            Item Photo <span style={{ color: "#F5A623" }}>*</span>
          </label>
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            border: `2px dashed ${preview ? "var(--success)" : "var(--border)"}`,
            borderRadius: "var(--r-xl)", cursor: "pointer", overflow: "hidden",
            background: preview ? "var(--success-bg)" : "var(--surface-2)",
            transition: "all var(--t2)", height: preview ? "auto" : 160,
          }}
          onMouseEnter={e => { if (!preview) e.currentTarget.style.borderColor = "#F5A623"; }}
          onMouseLeave={e => { if (!preview) e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            {preview ? (
              <div style={{ position: "relative", width: "100%" }}>
                <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity var(--t1)" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0"}
                >
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: ".85rem" }}>Click to change</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "var(--sp-6)" }}>
                <div style={{ fontSize: "2.2rem", marginBottom: "var(--sp-2)" }}>📸</div>
                <p style={{ fontWeight: 600, fontSize: ".85rem", color: "var(--text-2)", marginBottom: 4 }}>Click to upload photo</p>
                <p style={{ fontSize: ".75rem", color: "var(--text-4)" }}>PNG, JPG, WEBP up to 5MB</p>
              </div>
            )}
            <input type="file" accept="image/*" hidden onChange={(e) => handleImage(e.target.files?.[0])} />
          </label>
        </div>

        {/* Name */}
        <div className="form-group">
          <label className="label">
            Item Name <span style={{ color: "#F5A623" }}>*</span>
          </label>
          <input
            className="input"
            type="text"
            placeholder="e.g. Margherita Pizza"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="label">Description</label>
          <textarea
            className="input"
            placeholder="Describe the dish — ingredients, taste, portion size..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ resize: "vertical", minHeight: 80, fontFamily: "inherit" }}
          />
        </div>

        {/* Price */}
        <div className="form-group">
          <label className="label">
            Price (₹) <span style={{ color: "#F5A623" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: "var(--sp-4)", top: "50%", transform: "translateY(-50%)",
              color: "var(--text-3)", fontWeight: 700, fontSize: "1rem", pointerEvents: "none",
            }}>₹</span>
            <input
              className="input"
              type="number"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ paddingLeft: "var(--sp-8)" }}
              min="0"
            />
          </div>
        </div>

        {/* Preview strip */}
        {(name || price) && (
          <div style={{ padding: "var(--sp-4)", background: "var(--surface-2)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
            {preview && <img src={preview} alt="" style={{ width: 52, height: 52, borderRadius: "var(--r-md)", objectFit: "cover", flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: ".9rem" }}>{name || "Item name"}</p>
              <p style={{ fontSize: ".75rem", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{description || "No description"}</p>
            </div>
            {price && <span style={{ fontWeight: 800, color: "#F5A623", fontSize: ".95rem", flexShrink: 0 }}>₹{price}</span>}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: "flex", gap: "var(--sp-3)" }}>
          <button
            className="btn btn-ghost"
            onClick={resetForm}
            disabled={loading}
            style={{ flex: "0 0 auto" }}
          >
            Reset
          </button>
          <button
            className="btn btn-primary"
            disabled={loading}
            onClick={handleSubmit}
            style={{ flex: 1, justifyContent: "center" }}
          >
            {loading
              ? <><span className="spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,.3)" }} /> Adding...</>
              : <><span>✅</span> Add to Menu</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMenuItem;
