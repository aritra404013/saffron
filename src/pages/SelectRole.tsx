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
    desc: "Order food from your favourite restaurants and track deliveries in real-time.",
    accent: "#F5A623",
    borderHover: "rgba(245,166,35,.4)",
    glowHover: "rgba(245,166,35,.08)",
  },
  {
    role: "seller",
    icon: "🍽️",
    title: "Restaurant",
    desc: "Manage your restaurant, menu, and incoming orders from a powerful dashboard.",
    accent: "#8B5CF6",
    borderHover: "rgba(139,92,246,.4)",
    glowHover: "rgba(139,92,246,.06)",
  },
  {
    role: "rider",
    icon: "🛵",
    title: "Rider",
    desc: "Deliver orders, track earnings, and manage your schedule on the go.",
    accent: "#10B981",
    borderHover: "rgba(16,185,129,.4)",
    glowHover: "rgba(16,185,129,.06)",
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
      background: "#FAFAF9",
      padding: "40px 16px",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #F5A623, #D4891A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", boxShadow: "0 4px 14px rgba(245,166,35,.35)" }}>✦</div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#111118", letterSpacing: "-.03em" }}>
          Saffron<span style={{ color: "#F5A623" }}>Sky</span>
        </span>
      </div>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 12px", borderRadius: 999,
          background: "rgba(245,166,35,.1)", border: "1px solid rgba(245,166,35,.2)",
          marginBottom: 16,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F5A623", display: "inline-block" }} />
          <span style={{ fontSize: ".7rem", fontWeight: 700, color: "#D4891A", letterSpacing: ".08em", textTransform: "uppercase" }}>One last step</span>
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.7rem, 4vw, 2.3rem)", fontWeight: 800, letterSpacing: "-.04em", marginBottom: 10, color: "#111118" }}>
          How will you use Saffron Sky?
        </h1>
        <p style={{ color: "#7A7A8C", fontSize: ".875rem", maxWidth: 380, margin: "0 auto" }}>
          Choose your role to get the best experience tailored for you.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: 16, width: "100%", maxWidth: 780,
      }}>
        {ROLES.map((r, i) => (
          <button
            key={r.role}
            onClick={() => handleSelect(r.role)}
            style={{
              background: "#fff",
              border: "1.5px solid #E8E5DF",
              borderRadius: 20,
              padding: "28px 24px",
              cursor: "pointer", textAlign: "left",
              transition: "all 220ms ease",
              animation: `fadeUp .45s ease-out ${i * 80}ms both`,
              boxShadow: "0 2px 8px rgba(0,0,0,.05)",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = r.borderHover;
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = `0 12px 36px ${r.glowHover}, 0 4px 12px rgba(0,0,0,.06)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#E8E5DF";
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.05)";
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "#F7F6F3",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", marginBottom: 18,
            }}>{r.icon}</div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.05rem", marginBottom: 8, color: "#111118" }}>{r.title}</h3>
            <p style={{ fontSize: ".82rem", color: "#7A7A8C", lineHeight: 1.65, marginBottom: 20 }}>{r.desc}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: r.accent, fontWeight: 700, fontSize: ".8rem" }}>
              Get started
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectRole;
