import { Link } from "react-router-dom";

interface Props {
  id: string;
  name: string;
  image: string;
  distance: string;
  isOpen: boolean;
}

const RestaurantCard = ({ id, name, image, distance, isOpen }: Props) => {
  const deliveryTime = Math.max(20, Math.round(parseFloat(distance) * 8 + 10));

  return (
    <Link to={`/restaurant/${id}`} style={{ display: "block", textDecoration: "none" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          border: "1px solid #E8E5DF",
          overflow: "hidden",
          cursor: "pointer",
          transition: "transform 250ms ease, box-shadow 250ms ease",
          boxShadow: "0 2px 8px rgba(0,0,0,.05)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,.1)";
          const img = e.currentTarget.querySelector("img") as HTMLImageElement;
          if (img) img.style.transform = "scale(1.06)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.05)";
          const img = e.currentTarget.querySelector("img") as HTMLImageElement;
          if (img) img.style.transform = "scale(1)";
        }}
      >
        {/* Image */}
        <div style={{ position: "relative", overflow: "hidden", aspectRatio: "4/3" }}>
          {image ? (
            <img
              src={image}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s ease", display: "block" }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              background: "linear-gradient(135deg, #F7F6F3, #EFEDE8)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem",
            }}>🍽️</div>
          )}

          {/* Gradient overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.4) 0%, transparent 50%)" }} />

          {/* Open/Closed */}
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 9px", borderRadius: 999,
              background: isOpen ? "rgba(16,185,129,.88)" : "rgba(0,0,0,.5)",
              backdropFilter: "blur(6px)",
              color: "#fff", fontSize: ".65rem", fontWeight: 700, letterSpacing: ".04em",
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
              {isOpen ? "Open" : "Closed"}
            </span>
          </div>

          {/* Delivery time */}
          <div style={{ position: "absolute", bottom: 10, right: 10 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 9px", borderRadius: 999,
              background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)",
              color: "#fff", fontSize: ".65rem", fontWeight: 600,
            }}>
              ⏱ {deliveryTime}–{deliveryTime + 10} min
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "14px 16px" }}>
          <h3 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700, fontSize: ".92rem", color: "#111118",
            marginBottom: 8,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{name}</h3>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#7A7A8C", fontSize: ".73rem" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {parseFloat(distance) < 50 ? `${distance} km` : "Nearby"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ color: "#F5A623", fontSize: ".73rem" }}>★</span>
              <span style={{ fontSize: ".73rem", fontWeight: 700, color: "#3D3D4A" }}>4.1</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
