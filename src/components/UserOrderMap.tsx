import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { useEffect } from "react";

declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
    function osrmv1(options?: any): any;
  }
}

const riderIcon = new L.DivIcon({
  html: `<div style="font-size:1.6rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))">🛵</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  className: "",
});

const deliveryIcon = new L.DivIcon({
  html: `<div style="font-size:1.6rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  className: "",
});

// Auto-pans to keep rider visible
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => { map.panTo(center, { animate: true }); }, [center[0], center[1]]);
  return null;
};

const Routing = ({ from, to }: { from: [number, number]; to: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (!L.Routing?.control) return;
    const control = L.Routing.control({
      waypoints: [L.latLng(from), L.latLng(to)],
      lineOptions: { styles: [{ color: "#E23744", weight: 5, opacity: 0.8 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      createMarker: () => null,
      router: L.Routing.osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" }),
    }).addTo(map);
    return () => { try { map.removeControl(control); } catch { /* ignore */ } };
  }, [from[0], from[1], to[0], to[1]]);
  return null;
};

interface Props {
  riderLocation: [number, number];
  deliveryLocation: [number, number];
}

const UserOrderMap = ({ riderLocation, deliveryLocation }: Props) => {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,.08)" }}>
      {/* Header */}
      <div style={{ padding: "var(--sp-3) var(--sp-4)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
          <span style={{ fontSize: "1rem" }}>🗺️</span>
          <span style={{ fontWeight: 700, fontSize: ".85rem" }}>Rider Location</span>
        </div>
        <span className="live-badge"><span className="live-dot" /> LIVE</span>
      </div>

      {/* Legend */}
      <div style={{ padding: "var(--sp-2) var(--sp-4)", display: "flex", gap: "var(--sp-4)", background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: ".75rem", color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>🛵 Rider</span>
        <span style={{ fontSize: ".75rem", color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>📍 Your location</span>
        <span style={{ fontSize: ".75rem", color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ display: "inline-block", width: 20, height: 3, background: "#E23744", borderRadius: 4 }} /> Route
        </span>
      </div>

      {/* Map — explicit pixel height to fix zero-height bug */}
      <MapContainer
        center={riderLocation}
        zoom={14}
        style={{ height: 320, width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={riderLocation} />
        <Marker position={riderLocation} icon={riderIcon}>
          <Popup>Rider</Popup>
        </Marker>
        <Marker position={deliveryLocation} icon={deliveryIcon}>
          <Popup>Your delivery location</Popup>
        </Marker>
        <Routing from={riderLocation} to={deliveryLocation} />
      </MapContainer>
    </div>
  );
};

export default UserOrderMap;
