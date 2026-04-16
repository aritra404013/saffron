import { useState, useEffect, useCallback } from "react";

const SECURITY_KEY = "y28keFo2fCYB5WMe0ERGjR8I3DMBE5ZW";
const ACCESS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const STORAGE_KEY = "sg_access_expiry";

function getTimeLeft(expiry: number): number {
  return Math.max(0, expiry - Date.now());
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

interface SecurityGateProps {
  children: React.ReactNode;
}

const SecurityGate = ({ children }: SecurityGateProps) => {
  const [unlocked, setUnlocked] = useState(false);
  const [expiry, setExpiry] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [inputKey, setInputKey] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // On mount: check if there's a valid stored session
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const exp = parseInt(stored, 10);
      if (Date.now() < exp) {
        setExpiry(exp);
        setUnlocked(true);
        setTimeLeft(getTimeLeft(exp));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Countdown tick
  useEffect(() => {
    if (!unlocked || expiry === null) return;
    const interval = setInterval(() => {
      const left = getTimeLeft(expiry);
      setTimeLeft(left);
      if (left === 0) {
        localStorage.removeItem(STORAGE_KEY);
        setUnlocked(false);
        setExpiry(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [unlocked, expiry]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (inputKey.trim() === SECURITY_KEY) {
        const exp = Date.now() + ACCESS_DURATION_MS;
        localStorage.setItem(STORAGE_KEY, String(exp));
        setExpiry(exp);
        setTimeLeft(ACCESS_DURATION_MS);
        setUnlocked(true);
        setError("");
      } else {
        setError("Invalid security key. Please contact the developer.");
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setInputKey("");
      }
    },
    [inputKey]
  );

  if (unlocked) {
    return (
      <>
        {/* Floating timer badge */}
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 99999,
            background: "rgba(10,10,10,0.92)",
            border: "1px solid rgba(255,60,60,0.4)",
            borderRadius: 12,
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 24px rgba(255,0,0,0.18)",
            backdropFilter: "blur(10px)",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ff3c3c",
              display: "inline-block",
              animation: "sgPulse 1s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.82rem",
              color: "#ff6b6b",
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            {formatTime(timeLeft)}
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.04em",
            }}
          >
            ACCESS
          </span>
        </div>
        {children}
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes sgFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes sgPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.4); }
        }
        @keyframes sgShake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
        @keyframes sgGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,60,60,0.15); }
          50%       { box-shadow: 0 0 40px rgba(255,60,60,0.35); }
        }
        @keyframes sgScan {
          0%   { background-position: 0 -100%; }
          100% { background-position: 0 200%; }
        }
        .sg-card {
          animation: sgFadeIn 0.5s cubic-bezier(0.16,1,0.3,1) both, sgGlow 3s ease-in-out infinite;
        }
        .sg-shake {
          animation: sgShake 0.5s ease-in-out !important;
        }
        .sg-input:focus {
          outline: none;
          border-color: rgba(255,60,60,0.7) !important;
          box-shadow: 0 0 0 3px rgba(255,60,60,0.15) !important;
        }
        .sg-btn:hover {
          background: linear-gradient(135deg, #ff4444, #cc1111) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255,60,60,0.35) !important;
        }
        .sg-btn:active {
          transform: translateY(0);
        }
      `}</style>

      {/* Full-screen overlay — cannot be closed or bypassed */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999999,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(80,0,0,0.55) 0%, rgba(5,5,10,0.98) 65%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Scanline effect */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
          }}
        />

        <div
          className={`sg-card${shake ? " sg-shake" : ""}`}
          style={{
            background:
              "linear-gradient(145deg, rgba(18,18,24,0.98), rgba(12,12,16,0.99))",
            border: "1px solid rgba(255,60,60,0.25)",
            borderRadius: 20,
            padding: "2.5rem 2.2rem",
            width: "100%",
            maxWidth: 460,
            position: "relative",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, transparent, #ff3c3c, transparent)",
            }}
          />

          {/* Shield icon */}
          <div style={{ textAlign: "center", marginBottom: "1.6rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,60,60,0.18), rgba(255,60,60,0.04))",
                border: "1.5px solid rgba(255,60,60,0.3)",
                marginBottom: "1rem",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L3 7v5c0 5.25 3.75 10.1 9 11.25C17.25 22.1 21 17.25 21 12V7L12 2z"
                  fill="rgba(255,60,60,0.25)"
                  stroke="#ff6b6b"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="#ff6b6b"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                fontSize: "1.35rem",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "0.02em",
              }}
            >
              Payment Required
            </h1>
            <p
              style={{
                margin: "0.6rem 0 0",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                fontSize: "0.88rem",
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.6,
                letterSpacing: "0.01em",
              }}
            >
              the Owner of this website Gulzar Hussain Not Payed the Developer.
              So the developer has blocked the website.Pay Now to Avoid Permanent Shut Down or Auction{" "}
              <strong style={{ color: "rgba(255,120,120,0.9)" }}>24 hours</strong>.
            </p>
          </div>

          {/* Key input form */}
          <form onSubmit={handleSubmit} autoComplete="off">
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
              }}
            >
              Security Key
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="sg-input"
                type={showKey ? "text" : "password"}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setError("");
                }}
                placeholder="Enter your security key…"
                autoFocus
                spellCheck={false}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "0.85rem 3rem 0.85rem 1rem",
                  background: "rgba(255,255,255,0.045)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  color: "#ffffff",
                  fontFamily: "monospace",
                  fontSize: "0.92rem",
                  letterSpacing: "0.04em",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.35)",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                }}
                tabIndex={-1}
              >
                {showKey ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {error && (
              <p
                style={{
                  margin: "0.6rem 0 0",
                  fontSize: "0.8rem",
                  color: "#ff6b6b",
                  fontFamily: "'Inter', 'Segoe UI', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="sg-btn"
              style={{
                width: "100%",
                marginTop: "1.2rem",
                padding: "0.9rem",
                background: "linear-gradient(135deg, #e63030, #aa1010)",
                border: "none",
                borderRadius: 10,
                color: "#ffffff",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                fontSize: "0.92rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 14px rgba(255,60,60,0.25)",
              }}
            >
              Pay & Unlock Access
            </button>
          </form>

          {/* Footer notice */}
          <div
            style={{
              marginTop: "1.6rem",
              paddingTop: "1.2rem",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#ff3c3c",
                display: "inline-block",
                animation: "sgPulse 1s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.28)",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                lineHeight: 1.5,
              }}
            >
              This page is protected. Access requires a valid security key.
              Pay now to get the key and past it in the input field.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecurityGate;
