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
        className="card card-hover"
        style={{ cursor: "pointer", overflow: "hidden" }}
        onMouseEnter={e => {
          const img = e.currentTarget.querySelector("img") as HTMLImageElement;
          if (img) img.style.transform = "scale(1.05)";
        }}
        onMouseLeave={e => {
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
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s var(--ease)" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--surface-3), var(--border))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>
              🍽️
            </div>
          )}
          {/* Open / Closed badge */}
          <div style={{ position: "absolute", top: "var(--sp-2)", left: "var(--sp-2)" }}>
            <span className={`badge ${isOpen ? "badge-green" : "badge-gray"}`}>
              {isOpen ? "● Open" : "● Closed"}
            </span>
          </div>
          {/* Gradient overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.3) 0%, transparent 60%)" }} />
        </div>

        {/* Info */}
        <div style={{ padding: "var(--sp-4)" }}>
          <h3 style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--text-1)", marginBottom: "var(--sp-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--sp-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-1)", color: "var(--text-3)", fontSize: ".78rem" }}>
              <span>📍</span>
              <span>{parseFloat(distance) < 50 ? `${distance} km` : "Nearby"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-1)", color: "var(--text-3)", fontSize: ".78rem" }}>
              <span>⏱</span>
              <span>{deliveryTime}–{deliveryTime + 10} min</span>
            </div>
          </div>
          {/* Rating mock */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-1)", marginTop: "var(--sp-2)" }}>
            <span style={{ color: "var(--gold)", fontSize: ".8rem" }}>★★★★</span>
            <span style={{ color: "var(--text-4)", fontSize: ".75rem" }}>★</span>
            <span style={{ color: "var(--text-3)", fontSize: ".75rem" }}>4.1</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
