"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const inputCls =
  "w-full font-sans rounded-xl border border-graphite-600/70 bg-graphite-800 px-3 py-2.5 text-[14px] text-graphite-100 placeholder:text-graphite-500 focus:outline-none focus:ring-2 focus:ring-lime/40 focus:border-lime/60 transition-colors";

export function NewItemForm({
  tenantSlug,
  action,
}: {
  tenantSlug: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const params = useSearchParams();
  const err = params.get("err");

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/c/${tenantSlug}/admin/menu`}
          className="text-[11px] font-mono uppercase tracking-[0.12em] text-graphite-400 hover:text-graphite-200 transition-colors"
        >
          ← Menu
        </Link>
        <span className="text-graphite-600">/</span>
        <h1 className="font-display text-[26px] sm:text-[30px] font-semibold tracking-tight">
          New item
        </h1>
      </div>

      {err && (
        <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-300">
          {err === "1" ? "Name and price are required." : decodeURIComponent(err)}
        </div>
      )}

      <form action={action} className="max-w-lg space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-graphite-300 mb-1.5" htmlFor="name">
            Name <span className="text-rose-400">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={inputCls}
            placeholder="e.g. Masala Dosa"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-graphite-300 mb-1.5" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className={inputCls + " resize-none"}
            placeholder="Optional short description"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-graphite-300 mb-1.5" htmlFor="price">
            Price (₹) <span className="text-rose-400">*</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min="0.01"
            step="0.01"
            className={inputCls}
            placeholder="0.00"
          />
        </div>

        <div>
          <span className="block text-[13px] font-medium text-graphite-300 mb-2">Diet</span>
          <div className="flex gap-6">
            {[
              { value: "veg", label: "Veg", color: "text-emerald-400" },
              { value: "nonveg", label: "Non-Veg", color: "text-rose-400" },
              { value: "egg", label: "Egg", color: "text-amber-400" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="diet" value={opt.value} defaultChecked={opt.value === "veg"} className="accent-lime" />
                <span className={`text-[14px] ${opt.color}`}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-graphite-300 mb-1.5" htmlFor="image_url">
            Image URL
          </label>
          <input
            id="image_url"
            name="image_url"
            type="url"
            className={inputCls}
            placeholder="https://..."
          />
          <p className="mt-1 text-[12px] text-graphite-500">Optional — paste a URL or leave blank</p>
        </div>

        <div className="rounded-xl border border-lime/20 bg-lime/5 px-4 py-3">
          <p className="text-[12px] text-lime leading-relaxed">
            <strong>Items are immediately visible to students once created.</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-lime px-6 py-2.5 text-[14px] font-semibold text-graphite-900 hover:bg-lime-dim transition-colors"
          >
            Create item
          </button>
          <Link
            href={`/c/${tenantSlug}/admin/menu`}
            className="rounded-xl px-5 py-2.5 text-[14px] font-medium text-graphite-400 hover:text-graphite-200 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
