export function upiQrPayload(opts: { vpa: string; name: string; amountPaise: number; note?: string }) {
  // pa (payee address / VPA) must NOT be URL-encoded — the @ symbol must stay raw.
  // encodeURIComponent converts @ to %40. PhonePe, BHIM, and some Paytm builds
  // do NOT decode %40 back to @ before resolving the VPA, so the payment either
  // fails ("User not found") or silently routes to the wrong account.
  // UPI NPCI spec §4.3 says VPA is passed as-is in the pa= field.
  const pa = opts.vpa.trim();

  // pn (payee name) is a display field — URL-encode it safely
  const pn = encodeURIComponent(opts.name.trim()).replace(/\+/g, "%20");
  const am = (opts.amountPaise / 100).toFixed(2);

  let url = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR`;
  if (opts.note) {
    const cleanNote = opts.note.replace(/[^a-zA-Z0-9- ]/g, "").slice(0, 20);
    url += `&tn=${encodeURIComponent(cleanNote).replace(/\+/g, "%20")}`;
  }
  return url;
}

