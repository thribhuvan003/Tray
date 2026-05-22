export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--tray-bg, #F4EFE6)" }}
    >
      <div
        className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em]"
        style={{ fontFamily: "var(--font-dm-mono, monospace)", color: "var(--tray-muted, #78716C)" }}
      >
        <span
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ background: "var(--tray-clay, #E60000)" }}
        />
        Loading
      </div>
    </div>
  );
}
