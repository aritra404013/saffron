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
    <div style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* Fullscreen food video — vertical clip, object-fit cover fills the screen */}
      <video
        autoPlay muted loop playsInline
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", zIndex: 0 }}
      >
        <source src="https://videos.pexels.com/video-files/7613581/7613581-hd_1080_1920_24fps.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15,14,12,.9) 0%, rgba(26,24,20,.75) 50%, rgba(15,14,12,.88) 100%)", zIndex: 1 }} />

      {/* Gold orb accents */}
      <div style={{ position: "absolute", top: "8%", right: "12%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,146,42,.12) 0%, transparent 70%)", zIndex: 1, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "12%", left: "8%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,146,42,.08) 0%, transparent 70%)", zIndex: 1, pointerEvents: "none" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 460, padding: "var(--sp-6)" }}>
        {/* Brand */}
        <div className="anim-fade-up" style={{ textAlign: "center", marginBottom: "var(--sp-10)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-5)" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "var(--r-lg)",
              background: "linear-gradient(135deg, var(--gold-light), var(--gold))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--shadow-gold)",
            }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", color: "#fff", fontWeight: 700, fontSize: "1.6rem" }}>S</span>
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "1.8rem", color: "#fff", letterSpacing: ".04em" }}>
              Saffron Sky
            </span>
          </div>
          <div style={{ width: 40, height: 1, background: "linear-gradient(90deg, transparent, var(--gold-light), transparent)", margin: "0 auto var(--sp-6)" }} />
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", color: "#fff", fontSize: "clamp(1.9rem, 4vw, 2.6rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: "var(--sp-3)" }}>
            A Culinary Journey<br />Awaits You
          </h1>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem", lineHeight: 1.7, letterSpacing: ".01em" }}>
            Discover the finest restaurants, curated for your taste
          </p>
        </div>

        {/* Auth card */}
        <div className="anim-fade-up" style={{
          animationDelay: ".15s",
          background: "rgba(255,255,255,.05)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: "var(--r-2xl)",
          padding: "var(--sp-8)",
        }}>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", textAlign: "center", marginBottom: "var(--sp-6)" }}>
            Sign in to continue
          </p>

          <button
            onClick={() => googleLogin()}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--sp-3)",
              padding: "var(--sp-4) var(--sp-6)",
              background: "rgba(255,255,255,.96)",
              border: "none", borderRadius: "var(--r-full)",
              fontWeight: 700, fontSize: ".9rem", color: "var(--ink)",
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(0,0,0,.35)",
              transition: "all var(--t2)",
              letterSpacing: ".02em",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,.35)"; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ textAlign: "center", marginTop: "var(--sp-5)", color: "rgba(255,255,255,.25)", fontSize: ".7rem", lineHeight: 1.6 }}>
            By signing in you agree to our Terms of Service<br />and Privacy Policy
          </p>
        </div>

        <p className="anim-fade-up" style={{ animationDelay: ".3s", textAlign: "center", marginTop: "var(--sp-6)", color: "rgba(255,255,255,.25)", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase" }}>
          Premium Food Delivery · Est. 2024
        </p>
      </div>
    </div>
  );
};

export default Login;
