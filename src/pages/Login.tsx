import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppData } from "../context/AppContext";
import { BASE_URL } from "../main";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

const Login = () => {
  const { setUser, setIsAuth } = useAppData();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/login`, {
          code: codeResponse.code,
        });
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setIsAuth(true);
        toast.success("Welcome!");
        navigate("/");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Google login failed");
      }
    },
    onError: () => toast.error("Google login failed"),
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: "var(--surface)",
    }}>
      {/* Left visual panel */}
      <div className="hide-mobile" style={{
        flex: 1,
        background: "linear-gradient(145deg, var(--crimson-dark) 0%, #7C1D25 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "var(--sp-16)", gap: "var(--sp-8)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background blobs */}
        <div style={{ position: "absolute", top: -80, left: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
        <div style={{ position: "absolute", bottom: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />

        <div className="anim-fade-up" style={{ textAlign: "center", zIndex: 1 }}>
          <div style={{ fontSize: "4rem", marginBottom: "var(--sp-4)", animation: "float 3s ease-in-out infinite" }}>🍅</div>
          <h1 style={{ color: "#fff", fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1.1, marginBottom: "var(--sp-4)" }}>
            Food that makes<br />you smile
          </h1>
          <p style={{ color: "rgba(255,255,255,.72)", fontSize: "1rem", lineHeight: 1.6, maxWidth: 340 }}>
            Order from the best restaurants near you. Fast, fresh, and delivered with love.
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--sp-4)", zIndex: 1 }}>
          {["🍕 Pizza", "🍔 Burgers", "🍜 Noodles", "🌮 Tacos"].map(item => (
            <span key={item} style={{
              padding: "var(--sp-2) var(--sp-3)",
              background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)",
              borderRadius: "var(--r-full)", color: "#fff",
              fontSize: ".8rem", fontWeight: 600, border: "1px solid rgba(255,255,255,.2)",
            }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Right auth panel */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "var(--sp-8) var(--sp-6)",
      }}>
        <div className="anim-fade-up" style={{ width: "100%", maxWidth: 400 }}>
          {/* Logo mobile */}
          <div className="hide-desktop" style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-8)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "var(--r-md)", background: "linear-gradient(135deg,var(--crimson),var(--crimson-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🍅</div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>tomato</span>
          </div>

          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-.03em", marginBottom: "var(--sp-1)" }}>
            Welcome back
          </h2>
          <p style={{ color: "var(--text-3)", fontSize: ".875rem", marginBottom: "var(--sp-8)" }}>
            Sign in to continue ordering.
          </p>

          {/* Google button */}
          <button
            onClick={() => googleLogin()}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--sp-3)",
              padding: "var(--sp-3)", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)",
              background: "var(--surface)", fontWeight: 600, fontSize: ".875rem", color: "var(--text-1)",
              cursor: "pointer",
              transition: "border-color var(--t1), box-shadow var(--t1)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-3)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <img src="https://www.google.com/favicon.ico" alt="" width={18} />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
