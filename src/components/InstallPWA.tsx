import { useState, useEffect } from "react";

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (evt: any) => {
    evt.preventDefault();
    if (!promptInstall) return;
    promptInstall.prompt();
  };

  if (!supportsPWA) return null;

  return (
    <button
      id="setup_button"
      aria-label="Install App"
      title="Install Foodify"
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: "var(--sp-6)",
        right: "var(--sp-6)",
        zIndex: 1000,
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: "var(--gold)",
        color: "#fff",
        border: "none",
        boxShadow: "var(--shadow-gold)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
        animation: "pop .5s var(--ease) both, float 3s ease-in-out infinite",
        transition: "transform var(--t2)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      📲
    </button>
  );
};

export default InstallPWA;
