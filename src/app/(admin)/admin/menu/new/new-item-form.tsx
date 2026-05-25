"use client";

import Link from "next/link";
import { useState } from "react";
import { createMenuItem } from "@/app/(admin)/admin/_actions";
import { UploadCloud, Link as LinkIcon, X } from "lucide-react";

const inputCls =
  "w-full font-sans rounded-xl border border-[var(--admin-line-2)] bg-[var(--admin-bg-3)]/60 px-4 py-3 text-[16px] text-[var(--admin-ink)] placeholder:text-[var(--admin-ink-3)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--admin-lime)]/30 focus:border-[var(--admin-lime)] transition-all duration-200 shadow-inner";

/** Mini DietDot — matches the student portal's FSSAI indicator exactly */
function PreviewDietDot({ diet }: { diet: string }) {
  const color =
    diet === "veg" ? "#0c8a43" : diet === "egg" ? "#f59e0b" : "#b32b2b";
  return (
    <span
      style={{
        width: 18, height: 18,
        border: `2px solid ${color}`,
        borderRadius: 3,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        background: "transparent",
      }}
    >
      {diet === "nonveg" ? (
        <span style={{
          width: 0, height: 0,
          borderLeft: "4.5px solid transparent",
          borderRight: "4.5px solid transparent",
          borderBottom: `8px solid ${color}`,
          display: "block",
        }} />
      ) : (
        <span style={{
          height: 8, width: 8,
          borderRadius: "50%",
          background: color,
          display: "block",
        }} />
      )}
    </span>
  );
}

/** Student portal item card preview — matches RegularCard exactly */
function StudentCardPreview({
  name,
  description,
  pricePaise,
  diet,
  imageUrl,
}: {
  name: string;
  description: string;
  pricePaise: number;
  diet: "veg" | "nonveg" | "egg";
  imageUrl: string | null;
}) {
  function dietEmoji(d: string) {
    if (d === "veg") return "🥬";
    if (d === "egg") return "🍳";
    return "🍗";
  }
  function formatRupees(paise: number) {
    if (!paise || paise <= 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(paise / 100);
  }

  return (
    <article
      style={{
        display: "flex", gap: 14,
        padding: 16, borderRadius: 14,
        border: "1px solid rgba(26,26,25,.12)",
        background: "linear-gradient(145deg, rgba(255,255,255,.35) 0%, rgba(255,255,255,.1) 100%)",
        fontFamily: "var(--font-bricolage, 'Bricolage Grotesque', system-ui)",
      }}
    >
      {/* 72×72 icon */}
      <div style={{
        width: 72, height: 72, borderRadius: 12, flexShrink: 0,
        background: "rgba(26,26,25,.07)",
        display: "grid", placeItems: "center",
        fontSize: 30, border: "1px solid rgba(26,26,25,.08)",
        overflow: "hidden",
      }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          dietEmoji(diet)
        )}
      </div>
      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <h3 style={{
            margin: 0,
            fontSize: 17, fontWeight: 500,
            letterSpacing: "-0.015em", lineHeight: 1.25,
            color: "#1A1A19",
          }}>
            {name || <span style={{ color: "rgba(26,26,25,.35)", fontStyle: "italic" }}>Item name…</span>}
          </h3>
          <PreviewDietDot diet={diet} />
        </div>
        {description && (
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(26,26,25,.58)", lineHeight: 1.45 }}>
            {description}
          </p>
        )}
        <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#334155" }}>
            {pricePaise > 0 ? formatRupees(pricePaise) : <span style={{ color: "rgba(26,26,25,.35)", fontStyle: "italic" }}>₹0</span>}
          </span>
          <button
            type="button"
            style={{
              padding: "8px 14px", borderRadius: 10,
              fontSize: 14, fontWeight: 600,
              background: "rgba(51,65,85,.08)", color: "#334155",
              border: "1px solid rgba(26,26,25,.12)",
              cursor: "default",
            }}
          >
            + Add
          </button>
        </div>
      </div>
    </article>
  );
}

export function NewItemForm({
  tenantSlug,
  cats,
}: {
  tenantSlug: string;
  cats: { id: string; name: string }[];
}) {
  const [errorState, setErrorState] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Live preview state
  const [preview, setPreview] = useState({
    name: "",
    description: "",
    price: "",
    diet: "veg" as "veg" | "nonveg" | "egg",
    image_url: "",
  });

  const [photoMode, setPhotoMode] = useState<"file" | "url">("file");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 400;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setPreview((p) => ({ ...p, image_url: dataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPreview((p) => ({ ...p, image_url: "" }));
    const fileInput = document.getElementById("file-upload-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    const urlInput = document.getElementById("image_url") as HTMLInputElement;
    if (urlInput) urlInput.value = "";
  };

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

  const pricePaise = Math.round(parseFloat(preview.price || "0") * 100);

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

      {/* Side-by-side on desktop: form left, preview right */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-5 shrink-0">
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
              onChange={(e) => setPreview((p) => ({ ...p, name: e.target.value }))}
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
              onChange={(e) => setPreview((p) => ({ ...p, description: e.target.value }))}
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
              onChange={(e) => setPreview((p) => ({ ...p, price: e.target.value }))}
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
                    onChange={() => setPreview((p) => ({ ...p, diet: opt.value as "veg" | "nonveg" | "egg" }))}
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
            <span className="block text-[15px] font-semibold text-[var(--admin-ink-2)] mb-2 tracking-tight">Photo</span>
            <div className="mb-3 flex rounded-lg bg-[var(--admin-bg-2)] p-1" style={{ border: "1px solid var(--admin-line)" }}>
              <button
                type="button"
                onClick={() => { setPhotoMode("file"); clearPhoto(); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  photoMode === "file"
                    ? "bg-[var(--admin-bg-4)] text-[var(--admin-ink)] shadow-sm"
                    : "text-[var(--admin-ink-3)] hover:text-[var(--admin-ink-2)]"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => { setPhotoMode("url"); clearPhoto(); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  photoMode === "url"
                    ? "bg-[var(--admin-bg-4)] text-[var(--admin-ink)] shadow-sm"
                    : "text-[var(--admin-ink-3)] hover:text-[var(--admin-ink-2)]"
                }`}
              >
                Image URL
              </button>
            </div>

            {photoMode === "file" ? (
              <div className="relative">
                {preview.image_url ? (
                  <div
                    className="relative rounded-xl overflow-hidden group flex items-center justify-center bg-[var(--admin-bg-3)]/60"
                    style={{ height: 160, border: "1px solid var(--admin-line-2)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview.image_url}
                      alt="Uploaded preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                      >
                        Remove photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--admin-line-2)] hover:border-[var(--admin-lime)] bg-[var(--admin-bg-3)]/40 hover:bg-[var(--admin-bg-3)]/60 py-8 px-4 text-center cursor-pointer transition-all duration-200"
                    style={{ minHeight: 160 }}
                  >
                    <UploadCloud size={28} className="text-[var(--admin-ink-3)] mb-2" />
                    <span className="text-[14px] font-semibold text-[var(--admin-ink-2)]">Upload a photo</span>
                    <span className="text-[12px] text-[var(--admin-ink-3)] mt-1">Drag and drop or click to select</span>
                    <input
                      id="file-upload-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
                {/* Hidden input to submit the base64 URL to the action */}
                <input type="hidden" name="image_url" value={preview.image_url || ""} />
              </div>
            ) : (
              <div>
                <input
                  id="image_url"
                  name="image_url"
                  type="url"
                  value={preview.image_url || ""}
                  className={inputCls}
                  placeholder="https://images.unsplash.com/..."
                  onChange={(e) => setPreview((p) => ({ ...p, image_url: e.target.value }))}
                />
                <p className="mt-2 text-[13px] text-[var(--admin-ink-3)] leading-normal">Paste an external web link to any image.</p>
              </div>
            )}
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

        {/* ── Student Portal Preview Panel ── */}
        <div className="w-full lg:max-w-sm lg:sticky lg:top-20">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--admin-line-2)" }}
          >
            {/* Panel header */}
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ background: "var(--admin-bg-3)", borderBottom: "1px solid var(--admin-line)" }}
            >
              <span
                className="font-mono text-[10px] uppercase tracking-[0.14em]"
                style={{ color: "var(--admin-lime)" }}
              >
                Student Portal Preview
              </span>
              <span
                className="ml-auto text-[10px] font-mono"
                style={{ color: "var(--admin-ink-4)" }}
              >
                Live
              </span>
              <span
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#0c8a43",
                  boxShadow: "0 0 6px #0c8a43",
                  display: "inline-block",
                }}
              />
            </div>

            {/* Warm cream portal simulation */}
            <div
              className="p-5"
              style={{ background: "#F4EFE6" }}
            >
              <p
                className="font-mono mb-3"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(26,26,25,.45)",
                }}
              >
                How students see it
              </p>
              <StudentCardPreview
                name={preview.name}
                description={preview.description}
                pricePaise={pricePaise}
                diet={preview.diet}
                imageUrl={preview.image_url}
              />
            </div>
          </div>

          <p
            className="mt-3 text-[12px] font-mono leading-relaxed"
            style={{ color: "var(--admin-ink-4)", letterSpacing: "0.02em" }}
          >
            Preview updates as you type. The student portal uses warm cream (#F4EFE6) background with Bricolage Grotesque font.
          </p>
        </div>
      </div>
    </div>
  );
}

