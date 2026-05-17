import type { MenuCategory, MenuItem } from "@/lib/db/types";

const nowIso = () => new Date().toISOString();
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const cats = [
  ["signature", "Signature"],
  ["rice", "Rice & Bowls"],
  ["south", "South Indian"],
  ["snacks", "Snacks"],
  ["drinks", "Drinks"],
  ["sweets", "Sweets"],
] as const;

const dishes = [
  ["d1", "signature", "House Biryani", "Slow-cooked basmati, saffron, fried onions, mint raita.", 18000, "nonveg", 1080],
  ["d2", "signature", "Paneer Butter Masala", "Velvet tomato gravy with house-made paneer cubes.", 16000, "veg", 840],
  ["d3", "rice", "Veg Fried Rice", "Wok-tossed jasmine rice, scallions, soy glaze.", 11000, "veg", 600],
  ["d4", "rice", "Curd Rice Bowl", "Chilled basmati, tempered curd, pomegranate, ginger.", 8000, "veg", 360],
  ["d5", "rice", "Chicken Fried Rice", "Marinated chicken, charred peppers, garlic oil.", 14000, "nonveg", 720],
  ["d6", "south", "Masala Dosa", "Crisp rice crepe, spiced potato, two chutneys.", 9000, "veg", 540],
  ["d7", "south", "Idli Sambar (4 pcs)", "Steamed lentil cakes, tamarind sambar, coconut chutney.", 7000, "veg", 360],
  ["d8", "south", "Pongal", "Rice and moong dal, ghee, peppercorn, ginger.", 8000, "veg", 480],
  ["d9", "snacks", "Samosa (2 pcs)", "Flaky pastry, spiced potato pea filling, mint.", 4000, "veg", 300],
  ["d10", "snacks", "Veg Puff", "Buttery puff, spiced vegetable filling.", 3000, "veg", 240],
  ["d11", "snacks", "Pav Bhaji", "Buttered pav, spiced vegetable mash, onion lime.", 10000, "veg", 660],
  ["d12", "drinks", "Filter Coffee", "South-Indian filter brew, frothy and strong.", 3000, "veg", 180],
  ["d13", "drinks", "Cold Coffee", "Slow-brewed espresso, milk, cane sugar, ice.", 6000, "veg", 240],
  ["d14", "drinks", "Masala Chai", "Cardamom, ginger, fresh milk, jaggery.", 2500, "veg", 180],
  ["d15", "drinks", "Buttermilk", "Spiced curd cooler, curry leaf, ginger, salt.", 3000, "veg", 120],
  ["d16", "sweets", "Gulab Jamun (2 pcs)", "Saffron sugar syrup, soft milk dumplings.", 5000, "veg", 180],
  ["d17", "sweets", "Rasmalai", "Cottage cheese discs in cardamom-saffron milk.", 7000, "veg", 240],
] as const;

export function demoCategories(tenantId: string): MenuCategory[] {
  return cats.map(([id, name], index) => ({
    id: `demo-cat-${id}`,
    tenant_id: tenantId,
    name,
    sort_order: index + 1,
    created_at: nowIso(),
  }));
}

export function demoMenuItems(tenantId: string): MenuItem[] {
  return dishes.map(([id, cat, name, description, price_paise, diet, prep], index) => ({
    id: `demo-${id}`,
    tenant_id: tenantId,
    category_id: `demo-cat-${cat}`,
    name,
    description,
    price_paise,
    diet,
    prep_target_seconds: prep,
    image_url: null,
    in_stock: true,
    status: "live",
    sort_order: index + 1,
    stock_qty: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  }));
}

export type DemoOrder = {
  id: string;
  short_code: string;
  status: "placed" | "preparing" | "ready" | "collected" | "pending_payment" | "rejected" | "expired";
  total_paise: number;
  placed_at: string;
  ready_at: string | null;
  collected_at: string | null;
  customer_name: string | null;
  order_type: "takeaway" | "dine_in";
  table_label: string | null;
};

export type DemoLine = {
  id: string;
  order_id: string;
  name_snapshot: string;
  qty: number;
  diet_snapshot: "veg" | "nonveg" | "egg";
  price_paise_snapshot: number;
};

export function demoOrders(): DemoOrder[] {
  return [
    { id: "demo-o-2421", short_code: "T-2421", status: "placed", total_paise: 21000, placed_at: minutesAgo(1), ready_at: null, collected_at: null, customer_name: "Ananya R.", order_type: "takeaway", table_label: null },
    { id: "demo-o-2420", short_code: "T-2420", status: "preparing", total_paise: 22000, placed_at: minutesAgo(3), ready_at: null, collected_at: null, customer_name: "Karthik M.", order_type: "dine_in", table_label: "A3" },
    { id: "demo-o-2419", short_code: "T-2419", status: "preparing", total_paise: 14000, placed_at: minutesAgo(5), ready_at: null, collected_at: null, customer_name: "Vikram S.", order_type: "takeaway", table_label: null },
    { id: "demo-o-2418", short_code: "T-2418", status: "ready", total_paise: 21000, placed_at: minutesAgo(8), ready_at: minutesAgo(1), collected_at: null, customer_name: "Meera P.", order_type: "takeaway", table_label: null },
    { id: "demo-o-2417", short_code: "T-2417", status: "ready", total_paise: 15000, placed_at: minutesAgo(11), ready_at: minutesAgo(2), collected_at: null, customer_name: "Rohan G.", order_type: "dine_in", table_label: "7" },
    { id: "demo-o-2416", short_code: "T-2416", status: "collected", total_paise: 16000, placed_at: minutesAgo(18), ready_at: minutesAgo(9), collected_at: minutesAgo(4), customer_name: "Priya N.", order_type: "takeaway", table_label: null },
  ];
}

export function demoLines(): DemoLine[] {
  return [
    { id: "demo-l-1", order_id: "demo-o-2421", name_snapshot: "House Biryani", qty: 1, diet_snapshot: "nonveg", price_paise_snapshot: 18000 },
    { id: "demo-l-2", order_id: "demo-o-2421", name_snapshot: "Masala Chai", qty: 1, diet_snapshot: "veg", price_paise_snapshot: 2500 },
    { id: "demo-l-3", order_id: "demo-o-2420", name_snapshot: "Paneer Butter Masala", qty: 1, diet_snapshot: "veg", price_paise_snapshot: 16000 },
    { id: "demo-l-4", order_id: "demo-o-2420", name_snapshot: "Filter Coffee", qty: 2, diet_snapshot: "veg", price_paise_snapshot: 3000 },
    { id: "demo-l-5", order_id: "demo-o-2419", name_snapshot: "Chicken Fried Rice", qty: 1, diet_snapshot: "nonveg", price_paise_snapshot: 14000 },
    { id: "demo-l-6", order_id: "demo-o-2418", name_snapshot: "Masala Dosa", qty: 2, diet_snapshot: "veg", price_paise_snapshot: 9000 },
    { id: "demo-l-7", order_id: "demo-o-2418", name_snapshot: "Filter Coffee", qty: 1, diet_snapshot: "veg", price_paise_snapshot: 3000 },
    { id: "demo-l-8", order_id: "demo-o-2417", name_snapshot: "Pongal", qty: 1, diet_snapshot: "veg", price_paise_snapshot: 8000 },
    { id: "demo-l-9", order_id: "demo-o-2417", name_snapshot: "Idli Sambar (4 pcs)", qty: 1, diet_snapshot: "veg", price_paise_snapshot: 7000 },
    { id: "demo-l-10", order_id: "demo-o-2416", name_snapshot: "Pav Bhaji", qty: 1, diet_snapshot: "veg", price_paise_snapshot: 10000 },
    { id: "demo-l-11", order_id: "demo-o-2416", name_snapshot: "Cold Coffee", qty: 1, diet_snapshot: "veg", price_paise_snapshot: 6000 },
  ];
}

export function demoStatusLogs() {
  return [
    { id: "demo-log-1", order_id: "demo-o-2418", to_status: "ready", from_status: "preparing", created_at: minutesAgo(1), note: "Ready for pickup" },
    { id: "demo-log-2", order_id: "demo-o-2420", to_status: "preparing", from_status: "placed", created_at: minutesAgo(3), note: "Kitchen started" },
    { id: "demo-log-3", order_id: "demo-o-2421", to_status: "placed", from_status: "pending_payment", created_at: minutesAgo(4), note: "Payment captured" },
  ];
}
