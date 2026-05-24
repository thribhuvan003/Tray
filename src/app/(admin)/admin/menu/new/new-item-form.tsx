"use client";

import Link from "next/link";
import { useState } from "react";
import { createMenuItem } from "@/app/(admin)/admin/_actions";

const inputCls =
  "w-full font-sans rounded-xl border border-[var(--admin-line-2)] bg-[var(--admin-bg-3)]/60 px-4 py-3 text-[16px] text-[var(--admin-ink)] placeholder:text-[var(--admin-ink-3)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--admin-lime)]/30 focus:border-[var(--admin-lime)] transition-all duration-200 shadow-inner";

export function NewItemForm({
  tenantSlug,
  cats,
}: {
  tenantSlug: string;
  cats: { id: string; name: string }[];
}) {
  const [errorState, setErrorState] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setErrorState(null);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string | null)?.trim() ?? "";
    const priceRaw = formData.get("price") as string | null;
    const price_paise = Math.round(parseFloat(priceRaw ?? "0") * 100);

    if (!name || !(price_paise > 0)) {
      setErrorState("Name and price are required.");
      setPending(false);
      return;
    }

    const description = (formData.get("description") as string | null)?.trim() || null;
    const diet = (formData.get("diet") as "veg" | "nonveg" | "egg") ?? "veg";
    const category_id = (formData.get("category_id") as string | null) || null;
    const image_url = (formData.get("image_url") as string | null)?.trim() || null;
    const sort_order = parseInt((formData.get("sort_order") as string | null) ?? "0", 10) || 0;

    try {
      const result = await createMenuItem({
        name,
        description,
        price_paise,
        diet,
        category_id,
        image_url,
        sort_order,
        tenantSlug,
      });

      if (result.ok) {
        window.location.href = `/c/${tenantSlug}/admin/menu?created=1`;
      } else {
        setErrorState(result.error ?? "Failed to create item.");
        setPending(false);
      }
    } catch (err: any) {
      setErrorState(err.message ?? "An unexpected error occurred.");
      setPending(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/c/${tenantSlug}/admin/menu`}
          className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--admin-ink-3)] hover:text-[var(--admin-ink-2)] transition-colors"
        >
          ← Menu
        </Link>
        <span className="text-[var(--admin-line-3)]">/</span>
        <h1 className="font-display text-[26px] sm:text-[30px] font-semibold tracking-tight">
          New item
        </h1>
      </div>

      {errorState && (
        <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-300">
          {errorState}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div>
          <label className="block text-[15px] font-semibold text-[var(--admin-ink-2)] mb-2 tracking-tight" htmlFor="name">
            Name <span className="text-[var(--admin-rose)]">*</span>
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
          <label className="block text-[15px] font-semibold text-[var(--admin-ink-2)] mb-2 tracking-tight" htmlFor="description">
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
          <label className="block text-[15px] font-semibold text-[var(--admin-ink-2)] mb-2 tracking-tight" htmlFor="price">
            Price (₹) <span className="text-[var(--admin-rose)]">*</span>
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
          <span className="block text-[15px] font-semibold text-[var(--admin-ink-2)] mb-2.5 tracking-tight">Diet</span>
          <div className="flex gap-6">
            {[
              { value: "veg", label: "Veg", color: "text-emerald-400" },
              { value: "nonveg", label: "Non-Veg", color: "text-rose-400" },
              { value: "egg", label: "Egg", color: "text-amber-400" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="diet"
                  value={opt.value}
                  defaultChecked={opt.value === "veg"}
                  className="accent-[var(--admin-lime)]"
                />
                <span className={`text-[15px] font-medium ${opt.color}`}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {cats && cats.length > 0 && (
          <div>
            <label className="block text-[15px] font-semibold text-[var(--admin-ink-2)] mb-2 tracking-tight" htmlFor="category_id">
              Category
            </label>
            <div className="relative">
              <select
                id="category_id"
                name="category_id"
                defaultValue=""
                className={inputCls + " appearance-none pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2523A1A1AA%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_16px_center] bg-no-repeat"}
              >
                <option value="" className="bg-[var(--admin-bg-3)] text-[var(--admin-ink)]">No category</option>
                {cats.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[var(--admin-bg-3)] text-[var(--admin-ink)]">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-[15px] font-semibold text-[var(--admin-ink-2)] mb-2 tracking-tight" htmlFor="image_url">
            Image URL
          </label>
          <input
            id="image_url"
            name="image_url"
            type="url"
            className={inputCls}
            placeholder="https://..."
          />
          <p className="mt-2 text-[13px] text-[var(--admin-ink-3)] leading-normal">Optional — paste a URL or leave blank</p>
        </div>

        <div className="rounded-xl border border-[var(--admin-lime)]/20 bg-[var(--admin-lime)]/5 px-4 py-3">
          <p className="text-[12px] text-[var(--admin-lime)] leading-relaxed">
            <strong>Items are immediately visible to students once created.</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-[var(--admin-lime)] px-6 py-2.5 text-[14px] font-semibold text-[var(--admin-bg)] hover:bg-[var(--admin-lime-2)] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {pending ? "Creating…" : "Create item"}
          </button>
          <Link
            href={`/c/${tenantSlug}/admin/menu`}
            className="rounded-xl px-5 py-2.5 text-[14px] font-medium text-[var(--admin-ink-3)] hover:text-[var(--admin-ink-2)] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
