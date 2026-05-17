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
      <article
        className="group"
        style={{
          background: "var(--surface)", borderRadius: 12, overflow: "hidden",
          boxShadow: "0px 4px 12px rgba(45,52,70,0.05)", transition: "box-shadow 250ms",
          cursor: "pointer", display: "flex", flexDirection: "column", height: "100%",
          position: "relative", border: "1px solid var(--border)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = "0px 8px 24px rgba(45,52,70,0.12)";
          const img = e.currentTarget.querySelector("img") as HTMLImageElement;
          if (img) img.style.transform = "scale(1.05)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = "0px 4px 12px rgba(45,52,70,0.05)";
          const img = e.currentTarget.querySelector("img") as HTMLImageElement;
          if (img) img.style.transform = "scale(1)";
        }}
      >
        {/* Badges */}
        <div style={{ position: "absolute", top: "var(--sp-3)", left: "var(--sp-3)", zIndex: 10, display: "flex", gap: "var(--sp-1)" }}>
          <span style={{
            background: isOpen ? "var(--success)" : "rgba(80,80,80,.85)",
            color: "#fff", fontSize: "10px", fontWeight: 700, padding: "4px 10px",
            borderRadius: "9999px", display: "flex", alignItems: "center", gap: 5,
            boxShadow: "var(--shadow-sm)", backdropFilter: "blur(8px)",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "inline-block", animation: isOpen ? "livePulse 1.5s infinite" : "none" }} />
            {isOpen ? "Open" : "Closed"}
          </span>
        </div>

        {/* Favorite button */}
        <div style={{ position: "absolute", top: "var(--sp-3)", right: "var(--sp-3)", zIndex: 10 }}>
          <button style={{
            width: 32, height: 32, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-1)", border: "none", cursor: "pointer", transition: "color 250ms"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 0" }}>favorite</span>
          </button>
        </div>

        {/* Image */}
        <div style={{ height: 180, width: "100%", overflow: "hidden" }}>
          {image ? (
            <img
              src={image} alt={name}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 500ms",
                filter: isOpen ? "none" : "grayscale(40%)",
              }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              background: "linear-gradient(135deg, var(--surface-warm), var(--border))",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem"
            }}>🍽️</div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "var(--sp-4)", flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 style={{
            fontFamily: "'Montserrat', sans-serif", fontSize: "18px", fontWeight: 700,
            color: "var(--text-1)", marginBottom: "var(--sp-1)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>{name}</h3>

          <div style={{
            marginTop: "auto", paddingTop: "var(--sp-3)",
            borderTop: "1px solid rgba(226, 232, 240, 0.5)",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-1)", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "var(--text-1)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--primary)", fontVariationSettings: "'FILL' 0" }}>schedule</span>
              {deliveryTime}–{deliveryTime + 10} min
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-1)", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "var(--text-1)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--primary)", fontVariationSettings: "'FILL' 0" }}>location_on</span>
              {parseFloat(distance) < 50 ? `${distance} km` : "Nearby"}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default RestaurantCard;
