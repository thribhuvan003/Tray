export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--tray-bg, #E6E6FA)" }}
    >
      <div
        className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em]"
        style={{ fontFamily: "var(--font-dm-mono, monospace)", color: "var(--tray-muted, #5E5E5E)" }}
      >
        <span
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ background: "var(--tray-clay, #5A4FCF)" }}
        />
        Loading
      </div>
    </div>
  );
}
