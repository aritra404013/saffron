import { useState } from "react";
import type { IMenuItem } from "../types";
import axios from "axios";
import { BASE_URL } from "../config";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

interface MenuItemsProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItems = ({ items, onItemDeleted, isSeller }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableCount = items.filter(it => it.isAvailable).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)", animation: "fadeUp .4s var(--ease-out) both" }}>

      {/* ── HEADER & SEARCH ────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--sp-3)" }}>
        <div>
          <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>
            Menu Management
          </h2>
          <p style={{ color: "var(--text-3)", fontSize: ".82rem", marginTop: 2 }}>
            Organize your offerings, adjust pricing, and manage availability.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
          {/* Stats */}
          <div style={{ display: "flex", gap: "var(--sp-2)" }}>
            <span style={{
              padding: "4px 12px", borderRadius: "var(--r-full)",
              background: "rgba(0,109,55,0.1)", color: "var(--success)",
              fontSize: ".75rem", fontWeight: 700,
            }}>{availableCount} Active</span>
            <span style={{
              padding: "4px 12px", borderRadius: "var(--r-full)",
              background: "var(--surface-container-high)", color: "var(--text-3)",
              fontSize: ".75rem", fontWeight: 700,
            }}>{items.length - availableCount} Hidden</span>
          </div>

          {/* View toggle */}
          <div style={{
            display: "flex", gap: 2,
            background: "var(--surface-container-high)", borderRadius: 8,
            padding: 2,
          }}>
            {(["grid", "list"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "6px 8px", borderRadius: 6,
                  border: "none", cursor: "pointer",
                  background: viewMode === mode ? "var(--surface)" : "transparent",
                  boxShadow: viewMode === mode ? "var(--shadow-sm)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all var(--t1)",
                }}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: 18, color: viewMode === mode ? "var(--text-1)" : "var(--text-3)",
                }}>
                  {mode === "grid" ? "grid_view" : "view_list"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative" }}>
        <span className="material-symbols-outlined" style={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          fontSize: 20, color: "var(--text-4)", pointerEvents: "none",
        }}>search</span>
        <input
          className="input"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            paddingLeft: 44, borderRadius: 12,
            background: "var(--surface)", fontSize: ".875rem",
          }}
        />
      </div>

      {/* ── ITEMS GRID / LIST ──────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--sp-16) 0", color: "var(--text-3)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: "var(--text-4)", display: "block", marginBottom: "var(--sp-3)" }}>
            restaurant_menu
          </span>
          <p style={{ fontWeight: 600 }}>{searchQuery ? "No items match your search" : "No menu items yet"}</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: viewMode === "grid"
            ? "repeat(auto-fill, minmax(280px, 1fr))"
            : "1fr",
          gap: "var(--sp-4)",
        }}>
          {filtered.map((item, i) => {
            const isLoading = loadingItemId === item._id;
            return viewMode === "grid" ? (
              /* ── GRID CARD ──────────────────────────── */
              <div
                key={item._id}
                style={{
                  background: "var(--surface)", borderRadius: 16,
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                  overflow: "hidden",
                  opacity: item.isAvailable ? 1 : 0.7,
                  animation: `fadeUp .35s var(--ease-out) ${i * 30}ms both`,
                  transition: "box-shadow var(--t2), transform var(--t2)",
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = ""; }}
              >
                {/* Image — takes top 55% */}
                <div style={{ position: "relative", height: 160 }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      filter: item.isAvailable ? "none" : "grayscale(80%) brightness(0.8)",
                    }} />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%",
                      background: "linear-gradient(135deg, var(--surface-container-high), var(--surface-warm))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--text-4)" }}>restaurant</span>
                    </div>
                  )}

                  {/* Unavailable overlay */}
                  {!item.isAvailable && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "rgba(255,248,246,0.6)",
                      backdropFilter: "blur(2px)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{
                        padding: "6px 16px", borderRadius: "var(--r-full)",
                        background: "var(--surface)", fontWeight: 700,
                        fontSize: ".78rem", color: "var(--text-2)",
                        boxShadow: "var(--shadow-sm)",
                      }}>Unavailable</span>
                    </div>
                  )}

                  {/* Price badge */}
                  <div style={{
                    position: "absolute", bottom: 10, right: 10,
                    padding: "4px 12px", borderRadius: "var(--r-full)",
                    background: "var(--primary)", color: "#fff",
                    fontWeight: 800, fontSize: ".82rem",
                    boxShadow: "var(--shadow-gold)",
                  }}>₹{item.price}</div>
                </div>

                {/* Content */}
                <div style={{ padding: "var(--sp-4)" }}>
                  <h3 style={{
                    fontWeight: 700, fontSize: ".95rem",
                    marginBottom: 4, overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{item.name}</h3>

                  {item.description && (
                    <p style={{
                      fontSize: ".82rem", color: "var(--text-3)",
                      lineHeight: 1.4, marginBottom: "var(--sp-3)",
                      overflow: "hidden", textOverflow: "ellipsis",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>{item.description}</p>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {isSeller ? (
                      <div style={{ display: "flex", gap: "var(--sp-2)", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                        {/* Toggle */}
                        <label style={{
                          display: "flex", alignItems: "center", gap: 8,
                          cursor: "pointer", fontSize: ".78rem",
                          color: item.isAvailable ? "var(--success)" : "var(--text-3)",
                          fontWeight: 600,
                        }}>
                          <div style={{ position: "relative", width: 36, height: 20 }}>
                            <input
                              type="checkbox"
                              checked={item.isAvailable}
                              onChange={() => toggleAvailability(item._id)}
                              style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
                            />
                            <div style={{
                              position: "absolute", inset: 0,
                              background: item.isAvailable ? "var(--success)" : "var(--border-dark)",
                              borderRadius: 10, transition: "background var(--t2)",
                              cursor: "pointer",
                            }} onClick={() => toggleAvailability(item._id)}>
                              <div style={{
                                position: "absolute", top: 2, left: item.isAvailable ? 18 : 2,
                                width: 16, height: 16, borderRadius: "50%",
                                background: "#fff", boxShadow: "var(--shadow-sm)",
                                transition: "left var(--t2)",
                              }} />
                            </div>
                          </div>
                          {item.isAvailable ? "Active" : "Hidden"}
                        </label>

                        <button
                          onClick={() => handleDelete(item._id)}
                          title="Delete item"
                          style={{
                            padding: 6, borderRadius: 8, color: "var(--error)",
                            background: "none", border: "none", cursor: "pointer",
                            transition: "all 200ms",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(186,26,26,0.08)"}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={!item.isAvailable || isLoading}
                        onClick={() => addToCart(item.restaurantId, item._id)}
                        style={{
                          width: "100%",
                          padding: "8px 16px", borderRadius: 10,
                          background: item.isAvailable ? "var(--primary)" : "var(--surface-container-high)",
                          color: item.isAvailable ? "#fff" : "var(--text-3)",
                          fontWeight: 700, fontSize: ".82rem",
                          border: "none", cursor: item.isAvailable ? "pointer" : "not-allowed",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          transition: "all var(--t2)",
                          boxShadow: item.isAvailable ? "var(--shadow-md)" : "none",
                        }}
                        onMouseEnter={e => { if (item.isAvailable) e.currentTarget.style.boxShadow = "var(--shadow-gold)"; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = item.isAvailable ? "var(--shadow-md)" : "none"; }}
                      >
                        {isLoading ? (
                          <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: "#fff", borderColor: "rgba(255,255,255,.3)" }} />
                        ) : (
                          <>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add_shopping_cart</span>
                            Add to Cart
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ── LIST CARD ──────────────────────────── */
              <div
                key={item._id}
                style={{
                  background: "var(--surface)", borderRadius: 14,
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                  padding: "var(--sp-3)",
                  display: "flex", gap: "var(--sp-4)", alignItems: "center",
                  opacity: item.isAvailable ? 1 : 0.65,
                  animation: `fadeUp .35s var(--ease-out) ${i * 30}ms both`,
                  transition: "box-shadow 250ms",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-lg)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "var(--shadow-sm)"}
              >
                {/* Image */}
                <div style={{ position: "relative", flexShrink: 0, width: 88, height: 88, borderRadius: 12, overflow: "hidden" }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      filter: item.isAvailable ? "none" : "grayscale(100%)",
                    }} />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%",
                      background: "var(--surface-container-high)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 36, color: "var(--text-4)" }}>restaurant</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontWeight: 700, fontSize: ".9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name}
                    </h3>
                    <span style={{ fontWeight: 800, fontSize: ".9rem", color: "var(--primary)", flexShrink: 0 }}>₹{item.price}</span>
                  </div>

                  {item.description && (
                    <p style={{
                      fontSize: ".8rem", color: "var(--text-3)", lineHeight: 1.4,
                      marginBottom: "var(--sp-2)",
                      overflow: "hidden", textOverflow: "ellipsis",
                      display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
                    }}>{item.description}</p>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {isSeller ? (
                      <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center" }}>
                        <button
                          onClick={() => toggleAvailability(item._id)}
                          title={item.isAvailable ? "Hide item" : "Show item"}
                          style={{
                            padding: 4, borderRadius: 6, color: "var(--text-2)",
                            background: "none", border: "none", cursor: "pointer",
                            transition: "all 200ms",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-container-high)"; e.currentTarget.style.color = "var(--primary)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-2)"; }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.isAvailable ? 'visibility' : 'visibility_off'}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          title="Delete item"
                          style={{
                            padding: 4, borderRadius: 6, color: "var(--error)",
                            background: "none", border: "none", cursor: "pointer",
                            transition: "all 200ms",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(186,26,26,0.08)"}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={!item.isAvailable || isLoading}
                        onClick={() => addToCart(item.restaurantId, item._id)}
                        style={{
                          background: "rgba(168,57,0,0.1)", color: "var(--primary)",
                          fontWeight: 600, fontSize: ".82rem",
                          padding: "4px 12px", borderRadius: 8,
                          display: "inline-flex", alignItems: "center", gap: 4,
                          border: "none", cursor: item.isAvailable ? "pointer" : "not-allowed",
                          transition: "all 200ms",
                          opacity: item.isAvailable ? 1 : 0.5,
                        }}
                        onMouseEnter={e => { if (item.isAvailable) { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "var(--on-primary)"; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,57,0,0.1)"; e.currentTarget.style.color = "var(--primary)"; }}
                      >
                        {isLoading ? (
                          <span style={{ width: 16, height: 16, border: "2px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
                        ) : (
                          <>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                            Add
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MenuItems;
