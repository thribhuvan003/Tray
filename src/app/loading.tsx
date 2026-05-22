export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--tray-bg, #D8C9AE)" }}
    >
      <div
        className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em]"
        style={{ fontFamily: "var(--font-dm-mono, monospace)", color: "var(--tray-muted, #575757)" }}
      >
        <span
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ background: "var(--tray-clay, #B8531A)" }}
        />
        Loading
      </div>
    </div>
  );
}
