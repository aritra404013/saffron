import type { IOrder } from "../types";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import axios from "axios";
import { BASE_URL } from "../main";

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
  html: `<div style="font-size:1.6rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))">📦</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  className: "",
});

interface Props { order: IOrder; }

// Auto-pans map when rider position updates
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => { map.panTo(center, { animate: true }); }, [center, map]);
  return null;
};

// Draws route between two points
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

const RiderOrderMap = ({ order }: Props) => {
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const deliveryLat = order.deliveryAddress.latitude;
  const deliveryLng = order.deliveryAddress.longitude;

  useEffect(() => {
    if (deliveryLat == null || deliveryLng == null) return;

    const emitLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setRiderLocation([latitude, longitude]);

          axios.post(
            `${BASE_URL}/api/internal/emit`,
            { event: "rider:location", room: `user:${order.userId}`, payload: { latitude, longitude } },
            { headers: { "x-internal-key": import.meta.env.VITE_INTERNAL_SERVICE_KEY } }
          ).catch(() => { /* silently ignore emit errors */ });
        },
        (err) => console.warn("Geolocation error:", err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    };

    emitLocation();
    intervalRef.current = setInterval(emitLocation, 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [order.userId, deliveryLat, deliveryLng]);

  if (deliveryLat == null || deliveryLng == null) return null;
  const deliveryLocation: [number, number] = [deliveryLat, deliveryLng];

  if (!riderLocation) return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", padding: "var(--sp-6)", textAlign: "center" }}>
      <div style={{ fontSize: "1.8rem", marginBottom: "var(--sp-2)", animation: "float 2s ease-in-out infinite" }}>📡</div>
      <p style={{ color: "var(--text-3)", fontSize: ".85rem" }}>Acquiring your location...</p>
      <p style={{ color: "var(--text-4)", fontSize: ".75rem", marginTop: 4 }}>Please allow location access</p>
    </div>
  );

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,.08)" }}>
      <div style={{ padding: "var(--sp-3) var(--sp-4)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
          <span style={{ fontSize: "1rem" }}>🗺️</span>
          <span style={{ fontWeight: 700, fontSize: ".85rem" }}>Live Navigation</span>
        </div>
        <span className="live-badge"><span className="live-dot" /> GPS</span>
      </div>
      <MapContainer
        center={riderLocation}
        zoom={14}
        style={{ height: 340, width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={riderLocation} />
        <Marker position={riderLocation} icon={riderIcon}>
          <Popup>You (Rider)</Popup>
        </Marker>
        <Marker position={deliveryLocation} icon={deliveryIcon}>
          <Popup>Delivery Location</Popup>
        </Marker>
        <Routing from={riderLocation} to={deliveryLocation} />
      </MapContainer>
    </div>
  );
};

export default RiderOrderMap;
