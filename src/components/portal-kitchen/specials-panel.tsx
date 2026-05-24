"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { pushSpecialToMenu, removeSpecialFromMenu } from "@/app/(kitchen)/_actions";
import { toast } from "sonner";

type SpecialItem = {
  id: string;
  name: string;
  description: string | null;
  price_paise: number;
  diet: "veg" | "nonveg" | "egg";
};

const SAMPLES = [
  { name: "Andhra Mutton Curry", desc: "Hot, oily, properly spicy", price: 260, prep: 9, diet: "nonveg" as const },
  { name: "Mushroom Manchurian", desc: "Indo-Chinese, dry", price: 120, prep: 5, diet: "veg" as const },
  { name: "Hot Mysore Bonda", desc: "Crisp, fluffy, ginger-spiked", price: 60, prep: 3, diet: "veg" as const },
  { name: "Chicken 65", desc: "Crisp, fiery, by the gram", price: 180, prep: 7, diet: "nonveg" as const },
  { name: "Veg Cutlet", desc: "Beetroot · carrot · potato", price: 80, prep: 4, diet: "veg" as const },
  { name: "Tandoori Chicken (half)", desc: "Yogurt-marinated, fire-grilled", price: 280, prep: 11, diet: "nonveg" as const },
];

export function SpecialsPanel({
  tenantId,
}: {
  tenantId: string;
}) {
  const [specials, setSpecials] = useState<SpecialItem[]>([]);
  const [sampleIdx, setSampleIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("Hyderabadi Dum Biryani");
  const [description, setDescription] = useState("Slow-cooked, sealed in dum");
  const [price, setPrice] = useState("240");
  const [prep, setPrep] = useState("8");
  const [diet, setDiet] = useState<"veg" | "nonveg" | "egg">("nonveg");

  const sb = getBrowserClient();

  const fetchSpecials = async () => {
    // Resolve "Specials" category first
    const { data: cat } = await sb
      .from("menu_categories")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("name", "Specials")
      .maybeSingle<{ id: string }>();

    if (!cat) {
      setSpecials([]);
      return;
    }

    const { data: items } = await sb
      .from("menu_items")
      .select("id, name, description, price_paise, diet")
      .eq("tenant_id", tenantId)
      .eq("category_id", cat.id)
      .eq("status", "live");

    setSpecials((items as SpecialItem[]) || []);
  };

  useEffect(() => {
    void fetchSpecials();
    const interval = setInterval(fetchSpecials, 15_000);
    return () => clearInterval(interval);
  }, [tenantId]);

  const handlePush = async () => {
    if (!name.trim()) {
      toast.error("Dish name is required");
      return;
    }
    if (specials.some(s => s.name.toLowerCase() === name.trim().toLowerCase())) {
      toast.error(`"${name}" is already in today's specials!`);
      return;
    }

    setLoading(true);
    const numPrice = Number(price) || 0;
    const numPrep = Number(prep) || 5;

    try {
      const res = await pushSpecialToMenu({
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        prep: numPrep,
        diet,
      });

      if (!res.ok) {
        toast.error(res.error ?? "Failed to push special");
      } else {
        toast.success(`✓ Pushed live · "${name}"`);
        void fetchSpecials();

        // Cycle sample form
        const sample = SAMPLES[sampleIdx % SAMPLES.length];
        setSampleIdx(prev => prev + 1);
        setName(sample.name);
        setDescription(sample.desc);
        setPrice(String(sample.price));
        setPrep(String(sample.prep));
        setDiet(sample.diet);
      }
    } catch {
      toast.error("Error pushing special");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string, itemName: string) => {
    try {
      const res = await removeSpecialFromMenu(itemId);
      if (!res.ok) {
        toast.error(res.error ?? "Failed to remove special");
      } else {
        toast.success(`Removed "${itemName}" from specials`);
        void fetchSpecials();
      }
    } catch {
      toast.error("Error removing special");
    }
  };

  return (
    <div className="right-panel flex flex-col gap-3 sticky top-6">
      <div className="panel bg-[var(--kt-paper)] border border-[var(--kt-ink)] rounded-xl overflow-hidden shadow-[4px_4px_0_var(--kt-ink)]">
        <div className="panel-head px-4 py-3 border-b border-[var(--line)] bg-[var(--kt-cream-3)] flex justify-between items-center">
          <h3 className="font-display font-medium text-xl leading-none text-[var(--kt-ink)]">
            Today's <span className="italic text-[var(--kt-tomato)]">special.</span>
          </h3>
          <span className="badge font-mono text-[10px] font-bold text-[var(--kt-tomato)] bg-[rgba(213,40,33,0.12)] px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
            Live · pushes to students
          </span>
        </div>
        
        <div className="panel-body p-4 flex flex-col gap-2.5">
          <div className="field flex flex-col gap-1">
            <label className="font-mono text-[10px] text-[var(--kt-ink-3)] uppercase tracking-widest font-semibold">
              Dish name
            </label>
            <input
              className="px-3 py-2 bg-[var(--kt-cream-4)] border border-[var(--line-2)] rounded-md font-medium text-sm text-[var(--kt-ink)] outline-none focus:border-[var(--kt-tomato)] focus:bg-[var(--kt-paper)] transition-all"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Andhra Special Mutton"
            />
          </div>

          <div className="field flex flex-col gap-1">
            <label className="font-mono text-[10px] text-[var(--kt-ink-3)] uppercase tracking-widest font-semibold">
              Description
            </label>
            <textarea
              className="px-3 py-2 bg-[var(--kt-cream-4)] border border-[var(--line-2)] rounded-md font-medium text-sm text-[var(--kt-ink)] outline-none focus:border-[var(--kt-tomato)] focus:bg-[var(--kt-paper)] transition-all resize-none"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short, appetising"
            />
          </div>

          <div className="field-row2 grid grid-cols-2 gap-2">
            <div className="field flex flex-col gap-1">
              <label className="font-mono text-[10px] text-[var(--kt-ink-3)] uppercase tracking-widest font-semibold">
                Price (₹)
              </label>
              <input
                className="px-3 py-2 bg-[var(--kt-cream-4)] border border-[var(--line-2)] rounded-md font-medium text-sm text-[var(--kt-ink)] outline-none focus:border-[var(--kt-tomato)] focus:bg-[var(--kt-paper)] transition-all"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
            <div className="field flex flex-col gap-1">
              <label className="font-mono text-[10px] text-[var(--kt-ink-3)] uppercase tracking-widest font-semibold">
                Prep (min)
              </label>
              <input
                className="px-3 py-2 bg-[var(--kt-cream-4)] border border-[var(--line-2)] rounded-md font-medium text-sm text-[var(--kt-ink)] outline-none focus:border-[var(--kt-tomato)] focus:bg-[var(--kt-paper)] transition-all"
                value={prep}
                onChange={e => setPrep(e.target.value)}
              />
            </div>
          </div>

          <div className="field flex flex-col gap-1">
            <label className="font-mono text-[10px] text-[var(--kt-ink-3)] uppercase tracking-widest font-semibold">
              Diet
            </label>
            <div className="diet-toggle flex gap-1.5">
              <button
                type="button"
                className={`flex-1 py-1.5 bg-[var(--kt-cream-4)] border border-[var(--line-2)] rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${diet === "veg" ? "bg-[var(--kt-ink)] text-[var(--kt-cream)] border-[var(--kt-ink)]" : "text-[var(--kt-ink-2)]"}`}
                onClick={() => setDiet("veg")}
              >
                <span className="veg-dot inline-block w-2.5 h-2.5 border border-[var(--kt-olive)] relative rounded-[2px] after:content-[''] after:absolute after:inset-[1.5px] after:bg-[var(--kt-olive)] after:rounded-full" />
                Veg
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 bg-[var(--kt-cream-4)] border border-[var(--line-2)] rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${diet === "nonveg" ? "bg-[var(--kt-ink)] text-[var(--kt-cream)] border-[var(--kt-ink)]" : "text-[var(--kt-ink-2)]"}`}
                onClick={() => setDiet("nonveg")}
              >
                <span className="veg-dot nv inline-block w-2.5 h-2.5 border border-[var(--kt-tomato)] relative rounded-[2px] after:content-[''] after:absolute after:inset-[1.5px] after:bg-[var(--kt-tomato)] after:rounded-full" />
                Non-veg
              </button>
            </div>
          </div>

          <button
            type="button"
            className="push-btn w-full py-2.5 bg-[var(--kt-tomato)] text-[var(--kt-cream)] rounded-[7px] text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_3px_0_var(--kt-ink)] hover:translate-y-[-2px] hover:shadow-[0_5px_0_var(--kt-ink)] active:translate-y-[1px] active:shadow-[0_2px_0_var(--kt-ink)] disabled:opacity-65 disabled:cursor-not-allowed transition-all mt-1.5 border-none cursor-pointer"
            onClick={handlePush}
            disabled={loading}
          >
            {loading ? "Pushing..." : "▶ Push to live menu"}
          </button>
        </div>

        <div className="live-specials px-4 pb-3 flex flex-col gap-1.5">
          {specials.length === 0 ? (
            <div className="empty-state text-center py-8 px-4 text-[var(--kt-ink-3)] text-xs">
              <div className="ic font-display italic text-5xl text-[var(--kt-tomato)] opacity-30 leading-none mb-2">∅</div>
              No specials yet today.
              <br />
              Add one above to push it live.
            </div>
          ) : (
            specials.map(s => (
              <div key={s.id} className="live-spec p-[9px_10px] bg-[var(--kt-cream-3)] border border-[var(--line)] rounded-[7px] flex justify-between items-center gap-2 text-xs animate-[liveIn_.4s_cubic-bezier(.34,1.26,.64,1)]">
                <span className="nm font-semibold text-[var(--kt-ink)] flex items-center gap-1.5 min-w-0 flex-1 leading-snug">
                  <span className={`veg-dot ${s.diet === "nonveg" ? "nv" : ""} inline-block w-2 h-2 rounded-[2px] flex-shrink-0`} />
                  <span className="nm-text overflow-hidden text-ellipsis whitespace-nowrap">{s.name}</span>
                </span>
                <span className="pr font-mono font-semibold text-[var(--kt-ink-2)] flex-shrink-0">
                  ₹{s.price_paise / 100}
                </span>
                <button
                  type="button"
                  className="rm px-1.5 py-0.5 font-mono text-[10px] font-bold text-[var(--kt-tomato)] bg-[rgba(213,40,33,0.08)] rounded-[3px] tracking-wider cursor-pointer border-none hover:bg-[var(--kt-tomato)] hover:text-[var(--kt-cream)] transition-all"
                  onClick={() => handleRemove(s.id, s.name)}
                >
                  REMOVE
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
