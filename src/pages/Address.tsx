import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../main";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Address { _id: string; formattedAddress: string; mobile: number; }

const LocationPicker = ({ setLocation }: { setLocation: (lat: number, lng: number) => void }) => {
  useMapEvents({ click(e) { setLocation(e.latlng.lat, e.latlng.lng); } });
  return null;
};

const LocateMeButton = ({ onLocate }: { onLocate: (lat: number, lng: number) => void }) => {
  const map = useMap();
  return (
    <button
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          pos => { map.flyTo([pos.coords.latitude, pos.coords.longitude], 16); onLocate(pos.coords.latitude, pos.coords.longitude); },
          () => toast.error("Location permission denied")
        );
      }}
      style={{ position: "absolute", right: 12, top: 12, zIndex: 1000, display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#fff", borderRadius: "var(--r-full)", boxShadow: "var(--shadow-md)", border: "1px solid var(--border)", fontSize: ".8rem", fontWeight: 600, cursor: "pointer" }}
    >
      📍 Locate me
    </button>
  );
};

const AddAddressPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mobile, setMobile] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const setLocation = async (lat: number, lng: number) => {
    setLatitude(lat); setLongitude(lng);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setFormattedAddress(data.display_name || "");
    } catch { toast.error("Failed to fetch address"); }
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/address/all`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setAddresses(data || []);
    } catch { toast.error("Failed to load addresses"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const addAddress = async () => {
    if (!mobile || !formattedAddress || latitude === null || longitude === null) { toast.error("Please select location on map"); return; }
    try {
      setAdding(true);
      await axios.post(`${BASE_URL}/api/address/new`, { formattedAddress, mobile, latitude, longitude }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      toast.success("Address saved!");
      setMobile(""); setFormattedAddress(""); setLatitude(null); setLongitude(null);
      fetchAddresses();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Failed"); }
    finally { setAdding(false); }
  };

  const deleteAddress = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      setDeletingId(id);
      await axios.delete(`${BASE_URL}/api/address/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      toast.success("Address deleted"); fetchAddresses();
    } catch { toast.error("Failed to delete"); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="page-pad">
      <div className="container" style={{ maxWidth: 680 }}>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-.03em", marginBottom: "var(--sp-6)" }}>Delivery Addresses</h1>

        {/* Map */}
        <div className="card" style={{ overflow: "hidden", marginBottom: "var(--sp-4)", position: "relative" }}>
          <div style={{ height: 340 }}>
            <MapContainer center={[latitude || 28.6139, longitude || 77.209]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
              <LocationPicker setLocation={setLocation} />
              <LocateMeButton onLocate={setLocation} />
              {latitude && longitude && <Marker position={[latitude, longitude]} />}
            </MapContainer>
          </div>
          <p style={{ padding: "var(--sp-3) var(--sp-4)", fontSize: ".78rem", color: "var(--text-3)", borderTop: "1px solid var(--border)" }}>
            Click on the map to select your delivery location
          </p>
        </div>

        {formattedAddress && (
          <div style={{ padding: "var(--sp-3) var(--sp-4)", background: "var(--success-bg)", borderRadius: "var(--r-md)", marginBottom: "var(--sp-4)", fontSize: ".85rem", color: "#065F46", display: "flex", gap: "var(--sp-2)", alignItems: "flex-start" }}>
            <span>📍</span><span>{formattedAddress}</span>
          </div>
        )}

        <div style={{ display: "flex", gap: "var(--sp-3)", marginBottom: "var(--sp-4)" }}>
          <input className="input" type="tel" placeholder="Mobile number" value={mobile} onChange={e => setMobile(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-primary" disabled={adding} onClick={addAddress} style={{ flexShrink: 0 }}>
            {adding ? <span className="spinner" /> : "+ Save"}
          </button>
        </div>

        {/* Saved addresses */}
        <h2 style={{ fontWeight: 700, marginBottom: "var(--sp-3)" }}>Saved Addresses</h2>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
            {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: "var(--r-md)" }} />)}
          </div>
        ) : addresses.length === 0 ? (
          <p style={{ color: "var(--text-3)", fontSize: ".875rem" }}>No addresses saved yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
            {addresses.map(addr => (
              <div key={addr._id} className="card" style={{ padding: "var(--sp-4)", display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
                <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>📍</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: ".875rem", color: "var(--text-1)" }}>{addr.formattedAddress}</p>
                  <p style={{ fontSize: ".75rem", color: "var(--text-3)" }}>📞 {addr.mobile}</p>
                </div>
                <button
                  onClick={() => deleteAddress(addr._id)}
                  disabled={deletingId === addr._id}
                  style={{ padding: "var(--sp-2)", borderRadius: "var(--r-sm)", background: "var(--error-bg)", border: "none", cursor: "pointer", color: "var(--crimson)", fontSize: ".85rem" }}
                >
                  {deletingId === addr._id ? "⏳" : "🗑️"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddAddressPage;
