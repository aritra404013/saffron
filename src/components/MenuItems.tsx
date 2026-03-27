import { useState } from "react";
import type { IMenuItem } from "../types";
import axios from "axios";
import { BASE_URL } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

interface MenuItemsProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItems = ({ items, onItemDeleted, isSeller }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const { fetchCart } = useAppData();

  const handleDelete = async (itemId: string) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/item/${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Item deleted");
      onItemDeleted();
    } catch { toast.error("Failed to delete item"); }
  };

  const toggleAvailability = async (itemId: string) => {
    try {
      const { data } = await axios.put(`${BASE_URL}/api/item/status/${itemId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success(data.message);
      onItemDeleted();
    } catch { toast.error("Failed to update status"); }
  };

  const addToCart = async (restaurantId: string, itemId: string) => {
    try {
      setLoadingItemId(itemId);
      const { data } = await axios.post(`${BASE_URL}/api/cart/add`, { restaurantId, itemId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success(data.message);
      fetchCart();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add to cart");
    } finally { setLoadingItemId(null); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--sp-3)" }}>
      {items.map((item, i) => {
        const isLoading = loadingItemId === item._id;
        return (
          <div
            key={item._id}
            className="card"
            style={{
              display: "flex", gap: "var(--sp-3)", padding: "var(--sp-4)",
              opacity: !item.isAvailable ? .6 : 1,
              animation: `fadeUp .35s var(--ease-out) ${i * 30}ms both`,
            }}
          >
            {/* Image */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              {item.image ? (
                <img src={item.image} alt={item.name} style={{
                  width: 80, height: 80, borderRadius: "var(--r-md)",
                  objectFit: "cover", filter: !item.isAvailable ? "grayscale(1)" : "none",
                }} />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: "var(--r-md)", background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>🍴</div>
              )}
              {!item.isAvailable && (
                <div style={{ position: "absolute", inset: 0, borderRadius: "var(--r-md)", background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: ".6rem", fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>Not Available</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</h3>
                {item.description && (
                  <p style={{ fontSize: ".78rem", color: "var(--text-3)", marginTop: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.description}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--sp-2)" }}>
                <span style={{ fontWeight: 800, color: "var(--text-1)", fontSize: ".95rem" }}>
                  ₹{item.price}
                </span>
                {isSeller ? (
                  <div style={{ display: "flex", gap: "var(--sp-1)" }}>
                    <button
                      onClick={() => toggleAvailability(item._id)}
                      title={item.isAvailable ? "Hide item" : "Show item"}
                      style={{ padding: "var(--sp-2)", borderRadius: "var(--r-sm)", background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer", fontSize: ".85rem", transition: "background var(--t1)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--surface-3)"}
                      onMouseLeave={e => e.currentTarget.style.background = "var(--surface-2)"}
                    >
                      {item.isAvailable ? "👁️" : "🙈"}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      title="Delete item"
                      style={{ padding: "var(--sp-2)", borderRadius: "var(--r-sm)", background: "var(--error-bg)", border: "1px solid rgba(226,55,68,.2)", cursor: "pointer", fontSize: ".85rem", transition: "background var(--t1)" }}
                    >
                      🗑️
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={!item.isAvailable || isLoading}
                    onClick={() => addToCart(item.restaurantId, item._id)}
                    style={{
                      padding: "var(--sp-2) var(--sp-3)",
                      borderRadius: "var(--r-full)",
                      background: !item.isAvailable ? "var(--surface-3)" : "linear-gradient(135deg,#F5A623,#D4891A)",
                      color: !item.isAvailable ? "var(--text-4)" : "#fff",
                      border: "none", fontWeight: 700, fontSize: ".8rem",
                      cursor: !item.isAvailable ? "not-allowed" : "pointer",
                      boxShadow: item.isAvailable ? "0 4px 14px rgba(245,166,35,.35)" : "none",
                      display: "flex", alignItems: "center", gap: "var(--sp-1)",
                      transition: "all var(--t2)",
                      minWidth: 64, justifyContent: "center",
                    }}
                    onMouseEnter={e => { if (item.isAvailable && !isLoading) e.currentTarget.style.transform = "scale(1.05)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
                  >
                    {isLoading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "+ Add"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuItems;
