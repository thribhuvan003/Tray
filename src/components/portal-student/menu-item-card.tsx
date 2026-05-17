"use client";

import type { MenuItem } from "@/lib/db/types";
import { formatRupees } from "@/lib/utils";
import { useCart } from "@/lib/cart/store";
import { Heart } from "lucide-react";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const line = useCart((s) => s.lines.find((l) => l.menuItemId === item.id));
  const add = useCart((s) => s.add);
  const inc = useCart((s) => s.increment);
  const dec = useCart((s) => s.decrement);
  const oos = !item.in_stock || item.status !== "live";
  const nonVeg = item.diet !== "veg";

  const flyToCart = (target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent("tray:cart-fly", {
        detail: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          label: item.name.charAt(0),
        },
      })
    );
  };

  return (
    <article className="dish" data-id={item.id} data-disabled={oos ? "true" : "false"}>
      <div className="thumb">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
        ) : (
          <span className="thumb-letter">{item.name.charAt(0)}</span>
        )}
        <div className="badge-row">
          <span className={`veg-mark ${nonVeg ? "nv" : ""}`} />
          <button className="fav" type="button" aria-label="Favorite">
            <Heart size={14} strokeWidth={1.8} />
          </button>
        </div>
      </div>
      <div className="body">
        <h3 className="name">{item.name}</h3>
        <p className="desc">{item.description}</p>
        <div className="meta-mini">
          <span>{Math.max(2, Math.round(item.prep_target_seconds / 60))} min</span>
          <span>-</span>
          <span>{item.diet === "veg" ? "Veg" : item.diet === "egg" ? "Egg" : "Non-veg"}</span>
        </div>
        <div className="row">
          <div className="price">
            <span className="cur">{formatRupees(0).replace("0", "")}</span>
            {Math.round(item.price_paise / 100)}
          </div>
          {line ? (
            <div className="qty">
              <button type="button" onClick={() => dec(item.id)}>-</button>
              <span className="n">{line.qty}</span>
              <button type="button" onClick={() => inc(item.id)}>+</button>
            </div>
          ) : (
            <button
              className="add-btn"
              type="button"
              aria-label="Add to cart"
              disabled={oos}
              onClick={(event) => {
                add({ menuItemId: item.id, name: item.name, pricePaise: item.price_paise, diet: item.diet });
                flyToCart(event.currentTarget);
              }}
            >
              +
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
