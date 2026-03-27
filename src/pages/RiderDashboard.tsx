import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { BASE_URL } from "../main";
import toast from "react-hot-toast";
import type { IOrder } from "../types";
import audio from "../assets/faaah.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";

interface IRider {
  _id: string; phoneNumber: string; aadharNumber: string;
  drivingLicenseNumber: string; picture: string;
  isVerified: boolean; isAvailble: boolean;
}

const RiderDashboard = () => {
  const { user, setUser, setIsAuth, location, loadingLocation, city } = useAppData();
  const { socket } = useSocket();
  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [refreshingLocation, setRefreshingLocation] = useState(false);
  // Registration form state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { audioRef.current = new Audio(audio); audioRef.current.preload = "auto"; }, []);

  const unlockAudio = async () => {
    try {
      if (!audioRef.current) return;
      await audioRef.current.play();
      audioRef.current.pause(); audioRef.current.currentTime = 0;
      setAudioUnlocked(true); toast.success("Sound enabled");
    } catch { toast.error("Tap again to enable sound"); }
  };

  const socketRef = useRef(socket);
  useEffect(() => { socketRef.current = socket; }, [socket]);

  useEffect(() => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return;
    
    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      console.log("📬 order:available received!", orderId);
      toast.success("New order available! 🎉");
      setIncomingOrders(prev => prev.includes(orderId) ? prev : [...prev, orderId]);
      if (audioUnlocked && audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => { }); }
      setTimeout(() => setIncomingOrders(prev => prev.filter(id => id !== orderId)), 10000);
    };
    
    currentSocket.on("order:available", onOrderAvailable);
    console.log("✅ Socket listener registered for order:available");
    
    return () => { 
      currentSocket.off("order:available", onOrderAvailable);
      console.log("🔌 Socket listener removed");
    };
  }, [audioUnlocked]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/rider/myprofile`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setProfile(data || null);
    } catch { setProfile(null); }
    finally { setLoading(false); }
  };

  const fetchCurrentOrder = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/rider/order/current`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setCurrentOrder(data.order);
    } catch { setCurrentOrder(null); }
  };

  useEffect(() => { if (user?.role === "rider") fetchProfile(); else setLoading(false); }, [user]);
  useEffect(() => { fetchCurrentOrder(); }, []);

  const toggleAvailability = async () => {
    if (!navigator.geolocation) { toast.error("Location access required"); return; }
    setToggling(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        await axios.patch(`${BASE_URL}/api/rider/toggle`, { isAvailble: !profile?.isAvailble, latitude: pos.coords.latitude, longitude: pos.coords.longitude }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        toast.success(profile?.isAvailble ? "You are offline" : "You are online! 🛵");
        fetchProfile();
      } catch (err: any) { toast.error(err?.response?.data?.message || "Failed"); }
      finally { setToggling(false); }
    });
  };

  const refreshLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location not supported");
      return;
    }
    setRefreshingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          if (profile?.isAvailble) {
            await axios.patch(`${BASE_URL}/api/rider/toggle`, { isAvailble: true, latitude, longitude }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
          }
          await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "Accept-Language": "en" } }
          );
          toast.success("Location updated");
        } catch {
          toast.error("Failed to update location");
        } finally {
          setRefreshingLocation(false);
        }
      },
      () => {
        toast.error("Failed to get location");
        setRefreshingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    if (!phoneNumber || !aadharNumber || !drivingLicenseNumber) {
      toast.error("Please fill all fields"); return;
    }
    if (!image) {
      toast.error("Please upload a profile photo"); return;
    }
    setSubmitting(true);

    const submit = async (latitude: number, longitude: number) => {
      const fd = new FormData();
      fd.append("phoneNumber", phoneNumber);
      fd.append("aadharNumber", aadharNumber);
      fd.append("drivingLicenseNumber", drivingLicenseNumber);
      fd.append("latitude", latitude.toString());
      fd.append("longitude", longitude.toString());
      fd.append("file", image);
      try {
        const { data } = await axios.post(`${BASE_URL}/api/rider/new`, fd, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        toast.success(data.message);
        fetchProfile();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed");
      } finally {
        setSubmitting(false);
      }
    };

    if (!navigator.geolocation) {
      await submit(0, 0);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => { await submit(pos.coords.latitude, pos.coords.longitude); },
      async () => { await submit(0, 0); }
    );
  };

  const logout = () => { localStorage.removeItem("token"); setUser(null); setIsAuth(false); };

  if (user?.role !== "rider") return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)" }}>Not registered as a rider.</div>;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "var(--sp-3)" }}>
      <div style={{ fontSize: "2.5rem", animation: "float 2s ease-in-out infinite" }}>🛵</div>
      <p style={{ color: "var(--text-3)" }}>Loading rider dashboard...</p>
    </div>
  );

  // ── REGISTRATION FORM ──────────────────────────────────
  if (!profile) return (
    <div style={{ minHeight: "100vh", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--sp-6)" }}>
      <div className="card anim-fade-up" style={{ padding: "var(--sp-8)", width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: "var(--sp-6)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "var(--sp-3)" }}>🛵</div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-.03em" }}>Register as Rider</h1>
          <p style={{ color: "var(--text-3)", marginTop: "var(--sp-1)", fontSize: ".875rem" }}>Complete your profile to start delivering</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          <div className="form-group"><label className="label">Aadhar Number</label><input className="input" type="number" placeholder="1234 5678 9012" value={aadharNumber} onChange={e => setAadharNumber(e.target.value)} /></div>
          <div className="form-group"><label className="label">Contact Number</label><input className="input" type="tel" placeholder="+91 XXXXX XXXXX" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} /></div>
          <div className="form-group"><label className="label">Driving License</label><input className="input" type="text" placeholder="DL-XXXXXXXXX" value={drivingLicenseNumber} onChange={e => setDrivingLicenseNumber(e.target.value)} /></div>
          <div className="form-group">
            <label className="label">Profile Photo</label>
            <label style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "var(--sp-4)", border: "2px dashed var(--border)", borderRadius: "var(--r-md)", cursor: "pointer", transition: "border-color var(--t1)" }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--crimson)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
              <span style={{ fontSize: "1.5rem" }}>{image ? "✅" : "📷"}</span>
              <span style={{ fontSize: ".85rem", color: "var(--text-2)" }}>{image ? image.name : "Upload profile photo"}</span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setImage(e.target.files?.[0] || null)} />
            </label>
          </div>
          <button className="btn btn-primary" disabled={submitting} onClick={handleSubmit} style={{ justifyContent: "center" }}>
            {submitting ? <span className="spinner" /> : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── MAIN DASHBOARD ─────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-2)", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: "var(--charcoal)", padding: "var(--sp-5) var(--sp-5) var(--sp-8)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,var(--crimson),var(--crimson-dark))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ color: "#fff", fontWeight: 700 }}>{user?.name}</p>
              <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".75rem" }}>Delivery Partner</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
            {!audioUnlocked && (
              <button onClick={unlockAudio} style={{ padding: "var(--sp-2)", background: "rgba(255,255,255,.1)", borderRadius: "var(--r-md)", border: "none", cursor: "pointer", fontSize: "1.1rem" }} title="Enable sound">🔔</button>
            )}
            <button onClick={logout} style={{ padding: "var(--sp-2)", background: "rgba(255,255,255,.1)", borderRadius: "var(--r-md)", border: "none", cursor: "pointer", color: "rgba(255,255,255,.6)", fontSize: ".8rem", fontWeight: 600 }}>
              Logout
            </button>
          </div>
        </div>

        {/* Online toggle */}
        <div style={{ background: profile.isAvailble ? "rgba(16,185,129,.2)" : "rgba(255,255,255,.06)", borderRadius: "var(--r-xl)", padding: "var(--sp-4) var(--sp-5)", display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${profile.isAvailble ? "rgba(16,185,129,.3)" : "rgba(255,255,255,.1)"}` }}>
          <div>
            <p style={{ color: profile.isAvailble ? "var(--success)" : "rgba(255,255,255,.5)", fontWeight: 700, fontSize: ".9rem" }}>
              {profile.isAvailble ? "🟢 You're Online" : "⚫ You're Offline"}
            </p>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: ".75rem", marginTop: 2 }}>
              {profile.isAvailble ? "Ready to receive orders" : "Go online to receive orders"}
            </p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={profile.isAvailble} onChange={toggleAvailability} disabled={toggling} />
            <span className="switch-slider" />
          </label>
        </div>

        {/* Location display */}
        <div style={{ marginTop: "var(--sp-3)", display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "var(--sp-3) var(--sp-4)", background: "rgba(255,255,255,.06)", borderRadius: "var(--r-md)", border: "1px solid rgba(255,255,255,.08)" }}>
          <span style={{ fontSize: ".85rem" }}>📍</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            {loadingLocation || refreshingLocation ? (
              <span style={{ color: "rgba(255,255,255,.5)", fontSize: ".75rem" }}>Fetching location...</span>
            ) : location?.formattedAddress ? (
              <span style={{ color: "rgba(255,255,255,.8)", fontSize: ".78rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {city || location.formattedAddress}
              </span>
            ) : (
              <span style={{ color: "rgba(255,255,255,.5)", fontSize: ".78rem" }}>Location unavailable</span>
            )}
          </div>
          <button
            onClick={refreshLocation}
            disabled={refreshingLocation || loadingLocation}
            style={{ padding: "var(--sp-1) var(--sp-2)", background: "rgba(255,255,255,.1)", border: "none", borderRadius: "var(--r-sm)", cursor: "pointer", color: "#fff", fontSize: ".7rem", opacity: refreshingLocation || loadingLocation ? 0.5 : 1 }}
          >
            {refreshingLocation ? "..." : "🔄"}
          </button>
        </div>

        {/* Verification warning */}
        {!profile.isVerified && (
          <div style={{ marginTop: "var(--sp-3)", padding: "var(--sp-3) var(--sp-4)", background: "rgba(245,158,11,.2)", borderRadius: "var(--r-md)", fontSize: ".78rem", color: "#FDE68A", border: "1px solid rgba(245,158,11,.3)" }}>
            ⏳ Your profile is pending admin verification. You won't receive orders until verified.
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "var(--sp-4)" }}>
        {/* Incoming orders */}
        {incomingOrders.length > 0 && (
          <div style={{ marginBottom: "var(--sp-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
              <h2 style={{ fontWeight: 800 }}>Incoming Order</h2>
              <span className="live-badge"><span className="live-dot" />NEW</span>
            </div>
            {incomingOrders.map(orderId => (
              <RiderOrderRequest
                key={orderId}
                orderId={orderId}
                onAccepted={() => { setIncomingOrders(prev => prev.filter(id => id !== orderId)); fetchCurrentOrder(); }}
              />
            ))}
          </div>
        )}

        {/* Current delivery */}
        {currentOrder ? (
          <div>
            <h2 style={{ fontWeight: 800, marginBottom: "var(--sp-3)" }}>Active Delivery</h2>
            <RiderCurrentOrder order={currentOrder} onStatusUpdate={fetchCurrentOrder} />
            <div style={{ marginTop: "var(--sp-4)" }}>
              <RiderOrderMap order={currentOrder} />
            </div>
          </div>
        ) : incomingOrders.length === 0 && (
          <div style={{ textAlign: "center", padding: "var(--sp-20) 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "var(--sp-4)", animation: "float 3s ease-in-out infinite" }}>🛵</div>
            <h3 style={{ fontWeight: 700, marginBottom: "var(--sp-2)" }}>
              {profile.isAvailble ? "Waiting for orders..." : "You're offline"}
            </h3>
            <p style={{ color: "var(--text-3)", fontSize: ".875rem" }}>
              {profile.isAvailble ? "Incoming orders will appear here" : "Toggle online to start receiving orders"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderDashboard;
