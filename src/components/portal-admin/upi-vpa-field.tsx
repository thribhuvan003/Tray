"use client";

import { useState, useTransition } from "react";
import { validateUpiVpa } from "@/app/(admin)/admin/_actions";

type Status = "idle" | "checking" | "valid" | "invalid";

export function UpiVpaField({ currentVpa }: { currentVpa: string | null }) {
  const [vpa, setVpa] = useState(currentVpa ?? "");
  const [status, setStatus] = useState<Status>(currentVpa ? "valid" : "idle");
  const [customerName, setCustomerName] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  // If the admin edits the VPA after a successful verification, reset to idle
  const handleChange = (val: string) => {
    setVpa(val);
    if (status !== "idle") {
      setStatus("idle");
      setCustomerName(undefined);
      setErrorMsg(undefined);
    }
  };

  const handleVerify = () => {
    if (!vpa.trim()) return;
    setStatus("checking");
    setCustomerName(undefined);
    setErrorMsg(undefined);
    startTransition(async () => {
      const result = await validateUpiVpa(vpa.trim());
      if (result.valid) {
        setStatus("valid");
        setCustomerName(result.customerName);
        if (result.error) setErrorMsg(result.error); // warning (accepted but not fully verified)
      } else {
        setStatus("invalid");
        setErrorMsg(result.error ?? "Verification failed");
      }
    });
  };

  const isValid = status === "valid";
  const canVerify = vpa.trim().length > 3 && !isPending && status !== "valid";

  return (
    <div className="border-t border-graphite-200/10 pt-4 flex flex-col gap-2">
      <label
        htmlFor="upi_vpa"
        className="text-[11px] font-mono uppercase tracking-[0.1em] text-graphite-400"
      >
        UPI ID{" "}
        <span className="normal-case tracking-normal font-sans text-graphite-500">
          (your payment address)
        </span>
      </label>

      {/* Input + Verify button row */}
      <div className="flex gap-2">
        <input
          id="upi_vpa"
          name="upi_vpa"
          type="text"
          value={vpa}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="e.g. canteen@okaxis or 9876543210@ybl"
          spellCheck={false}
          autoComplete="off"
          className={`flex-1 h-9 px-3 rounded-md border bg-graphite-700/60 text-[13px] text-graphite-200 placeholder:text-graphite-500 focus:outline-none transition-colors ${
            status === "valid"
              ? "border-emerald-500/60"
              : status === "invalid"
              ? "border-rose-500/60"
              : "border-graphite-200/15 focus:border-lime/60"
          }`}
        />
        <button
          type="button"
          onClick={handleVerify}
          disabled={!canVerify}
          className="h-9 px-3 rounded-md border border-graphite-200/15 text-[11px] font-mono text-graphite-300 hover:border-lime/60 hover:text-lime transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isPending ? "Checking…" : "Verify"}
        </button>
      </div>

      {/* Status feedback */}
      {status === "valid" && (
        <p className="text-[11px] text-emerald-400">
          ✓ VPA verified
          {customerName ? ` · ${customerName}` : ""}
          {errorMsg ? ` (${errorMsg})` : ""}
        </p>
      )}
      {status === "invalid" && (
        <p className="text-[11px] text-rose-400">✗ {errorMsg}</p>
      )}
      {status === "idle" && (
        <p className="text-[11px] text-graphite-500">
          Students pay <strong className="text-graphite-300">directly</strong> to this — money lands in your bank. Verify before saving.
        </p>
      )}

      {/* Hidden input carries the verified VPA into the form submit */}
      {/* The Save button below is disabled when not valid */}
      <input type="hidden" name="upi_vpa_verified" value={isValid ? "1" : ""} />
    </div>
  );
}
