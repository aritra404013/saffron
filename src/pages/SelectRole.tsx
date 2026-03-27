import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { BASE_URL } from "../main";
import toast from "react-hot-toast";

const ROLES = [
  {
    role: "customer",
    icon: "🛒",
    title: "Customer",
    desc: "Order food from your favorite restaurants, track deliveries in real-time.",
    accent: "var(--crimson)",
    bg: "var(--error-bg)",
  },
  {
    role: "seller",
    icon: "🍽️",
    title: "Restaurant",
    desc: "Manage your restaurant, menu, and incoming orders from a powerful dashboard.",
    accent: "#7C3AED",
    bg: "#EDE9FE",
  },
  {
    role: "rider",
    icon: "🛵",
    title: "Rider",
    desc: "Deliver orders, track earnings, and manage your schedule on the go.",
    accent: "var(--success)",
    bg: "var(--success-bg)",
  },
];

const SelectRole = () => {
  const { setUser } = useAppData();
  const navigate = useNavigate();

  const handleSelect = async (role: string) => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/api/auth/add/role`,
        { role },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      // Save fresh token so backend sees the updated role immediately
      if (data.token) localStorage.setItem("token", data.token);
      setUser(data.user);
      toast.success(`Welcome as ${role}!`);
      navigate("/");
    } catch {
      toast.error("Failed to set role");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, var(--surface-warm) 0%, var(--surface-3) 100%)",
      padding: "var(--sp-8) var(--sp-4)",
    }}>
      <div className="anim-fade-up" style={{ textAlign: "center", marginBottom: "var(--sp-10)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-6)" }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--r-lg)", background: "linear-gradient(135deg, var(--gold-light), var(--gold))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-gold)" }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", color: "#fff", fontWeight: 700, fontSize: "1.3rem" }}>S</span>
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "1.4rem", color: "var(--text-1)", letterSpacing: ".02em" }}>Saffron Sky</span>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 600, letterSpacing: ".01em", marginBottom: "var(--sp-3)", color: "var(--text-1)" }}>
          How will you use Saffron Sky?
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: ".9rem" }}>Choose your role to get the best experience</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--sp-5)", width: "100%", maxWidth: 820 }}>
        {ROLES.map((r, i) => (
          <button
            key={r.role}
            onClick={() => handleSelect(r.role)}
            style={{
              background: "var(--surface)", border: `1.5px solid var(--border)`,
              borderRadius: "var(--r-2xl)", padding: "var(--sp-8) var(--sp-6)",
              cursor: "pointer", textAlign: "left",
              transition: "all var(--t2)",
              animation: `fadeUp .5s var(--ease-out) ${i * 100}ms both`,
              boxShadow: "0 2px 12px rgba(15,14,12,.06)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = r.accent; e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = `0 16px 48px rgba(15,14,12,.12)`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(15,14,12,.06)"; }}
          >
            <div style={{ width: 56, height: 56, borderRadius: "var(--r-lg)", background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", marginBottom: "var(--sp-5)" }}>{r.icon}</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "1.3rem", marginBottom: "var(--sp-2)", color: "var(--text-1)" }}>{r.title}</h3>
            <p style={{ fontSize: ".85rem", color: "var(--text-3)", lineHeight: 1.6 }}>{r.desc}</p>
            <div style={{ marginTop: "var(--sp-5)", display: "flex", alignItems: "center", gap: "var(--sp-1)", color: r.accent, fontWeight: 700, fontSize: ".82rem", letterSpacing: ".04em", textTransform: "uppercase" }}>
              Get started →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectRole;
