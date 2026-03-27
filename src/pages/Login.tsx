import axios from "axios";
import { useAppData } from "../context/AppContext";
import { BASE_URL } from "../main";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const { setUser, setIsAuth } = useAppData();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/login`, { code: codeResponse.code });
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
      minHeight: "100vh",
      display: "flex",
      background: "#FAFAF9",
      // No top padding — this page has no navbar
    }}>

      {/* ── LEFT PANEL (desktop only) ─────────────────── */}
      <div className="hide-mobile" style={{
        flex: "0 0 46%",
        background: "#111118",
        display: "flex",
        flexDirection: "column",
        padding: "40px 52px",
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
      }}>
        {/* Ambient glows */}
        <div style={{ position:"absolute", top:"-10%", right:"-10%", width:420, height:420, borderRadius:"50%", background:"radial-gradient(circle, rgba(245,166,35,.14) 0%, transparent 65%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-8%", left:"-8%", width:340, height:340, borderRadius:"50%", background:"radial-gradient(circle, rgba(14,165,233,.09) 0%, transparent 65%)", pointerEvents:"none" }} />

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, zIndex:1 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#F5A623,#D4891A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", boxShadow:"0 4px 16px rgba(245,166,35,.4)", flexShrink:0 }}>✦</div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.2rem", color:"#fff", letterSpacing:"-.02em" }}>
            Saffron<span style={{ color:"#F5A623" }}>Sky</span>
          </span>
        </div>

        {/* Main copy */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", zIndex:1, paddingTop:20 }}>
          <div style={{ fontSize:"3rem", marginBottom:28 }}>🍜</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", color:"#fff", fontSize:"clamp(2rem,3.5vw,2.8rem)", fontWeight:800, letterSpacing:"-.04em", lineHeight:1.1, marginBottom:18 }}>
            Food that<br /><span style={{ color:"#F5A623" }}>moves you.</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,.48)", fontSize:".9rem", lineHeight:1.75, maxWidth:340, marginBottom:36 }}>
            Order from the best restaurants near you. Fresh, fast, and delivered with care.
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { icon:"⚡", text:"Delivery in under 30 minutes" },
              { icon:"🍽️", text:"500+ restaurants to choose from" },
              { icon:"📍", text:"Real-time order tracking" },
            ].map(f => (
              <div key={f.text} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:"rgba(245,166,35,.1)", border:"1px solid rgba(245,166,35,.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".85rem", flexShrink:0 }}>{f.icon}</div>
                <span style={{ color:"rgba(255,255,255,.6)", fontSize:".85rem", fontWeight:500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color:"rgba(255,255,255,.16)", fontSize:".68rem", zIndex:1, letterSpacing:".06em", textTransform:"uppercase" }}>
          © 2025 Saffron Sky · Premium Food Delivery
        </p>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────── */}
      <div style={{
        flex:1,
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        padding:"40px 24px",
        background:"#FAFAF9",
        minHeight:"100vh",
      }}>
        <div style={{ width:"100%", maxWidth:400 }}>

          {/* Mobile logo */}
          <div className="hide-desktop" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:40 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#F5A623,#D4891A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", boxShadow:"0 3px 12px rgba(245,166,35,.35)" }}>✦</div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.15rem", color:"#111118" }}>
              Saffron<span style={{ color:"#F5A623" }}>Sky</span>
            </span>
          </div>

          {/* Eyebrow */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:999, background:"rgba(245,166,35,.1)", border:"1px solid rgba(245,166,35,.22)", marginBottom:18 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#F5A623", display:"inline-block" }} />
            <span style={{ fontSize:".7rem", fontWeight:700, color:"#D4891A", letterSpacing:".08em", textTransform:"uppercase" }}>Welcome back</span>
          </div>

          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.7rem,4vw,2.1rem)", fontWeight:800, letterSpacing:"-.04em", color:"#111118", lineHeight:1.15, marginBottom:10 }}>
            Sign in to your<br />account
          </h2>
          <p style={{ color:"#7A7A8C", fontSize:".875rem", marginBottom:36, lineHeight:1.6 }}>
            Use your Google account to continue. No password needed.
          </p>

          {/* Google button */}
          <button
            onClick={() => googleLogin()}
            style={{
              width:"100%",
              display:"flex", alignItems:"center", justifyContent:"center", gap:12,
              padding:"14px 20px",
              border:"1.5px solid #E8E5DF",
              borderRadius:14,
              background:"#fff",
              fontWeight:600, fontSize:".9rem", color:"#111118",
              cursor:"pointer",
              transition:"all 200ms ease",
              boxShadow:"0 1px 4px rgba(0,0,0,.06)",
              fontFamily:"inherit",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="#F5A623"; e.currentTarget.style.boxShadow="0 4px 20px rgba(245,166,35,.2)"; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#E8E5DF"; e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.06)"; e.currentTarget.style.transform=""; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"24px 0" }}>
            <div style={{ flex:1, height:1, background:"#E8E5DF" }} />
            <span style={{ fontSize:".72rem", color:"#B0B0BE", fontWeight:500 }}>secure sign-in</span>
            <div style={{ flex:1, height:1, background:"#E8E5DF" }} />
          </div>

          <div style={{ display:"flex", justifyContent:"center", gap:24 }}>
            {["🔒 Secure","⚡ Instant","🎯 Personalised"].map(b => (
              <span key={b} style={{ fontSize:".72rem", color:"#B0B0BE", fontWeight:500 }}>{b}</span>
            ))}
          </div>

          <p style={{ textAlign:"center", marginTop:28, fontSize:".72rem", color:"#B0B0BE", lineHeight:1.7 }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
