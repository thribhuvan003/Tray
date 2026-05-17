export function upiQrPayload(opts: { vpa: string; name: string; amountPaise: number; note?: string }) {
  const params = new URLSearchParams({
    pa: opts.vpa,
    pn: opts.name,
    am: (opts.amountPaise / 100).toFixed(2),
    cu: "INR",
  });
  if (opts.note) params.set("tn", opts.note);
  return `upi://pay?${params.toString()}`;
}
