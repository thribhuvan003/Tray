export default function KitchenLoading() {
  return (
    <div className="min-h-screen bg-cream-200 flex items-center justify-center">
      <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.28em] text-tomato-900/50">
        <span className="h-2 w-2 rounded-full bg-tomato-500 animate-pulse" />
        Kitchen loading
      </div>
    </div>
  );
}
