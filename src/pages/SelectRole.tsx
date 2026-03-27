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
      background: "linear-gradient(135deg, #fff 0%, #FFF5F5 100%)",
      padding: "var(--sp-8) var(--sp-4)",
    }}>
      <div className="anim-fade-up" style={{ textAlign: "center", marginBottom: "var(--sp-10)" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "var(--sp-4)" }}>👋</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-.04em", marginBottom: "var(--sp-2)" }}>
          How will you use Saffron Sky?
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: ".95rem" }}>
          Choose your role to get the best experience
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "var(--sp-4)", width: "100%", maxWidth: 780,
      }}>
        {ROLES.map((r, i) => (
          <button
            key={r.role}
            onClick={() => handleSelect(r.role)}
            style={{
              background: "var(--surface)", border: `2px solid var(--border)`,
              borderRadius: "var(--r-xl)", padding: "var(--sp-8) var(--sp-6)",
              cursor: "pointer", textAlign: "left",
              transition: "all var(--t2)",
              animation: `fadeUp .5s var(--ease-out) ${i * 100}ms both`,
              boxShadow: "var(--shadow-sm)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = r.accent;
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,.1)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: "var(--r-lg)",
              background: r.bg, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "1.8rem", marginBottom: "var(--sp-4)",
            }}>{r.icon}</div>
            <h3 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "var(--sp-2)", color: "var(--text-1)" }}>{r.title}</h3>
            <p style={{ fontSize: ".85rem", color: "var(--text-3)", lineHeight: 1.5 }}>{r.desc}</p>
            <div style={{ marginTop: "var(--sp-4)", display: "flex", alignItems: "center", gap: "var(--sp-1)", color: r.accent, fontWeight: 700, fontSize: ".85rem" }}>
              Get started <span>→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectRole;
