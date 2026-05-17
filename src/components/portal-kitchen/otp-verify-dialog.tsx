"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { verifyAndCollect } from "@/app/(kitchen)/_actions";

type Order = { id: string; short_code: string; customer_name: string | null };

export function OtpVerifyDialog({
  open,
  order,
  onClose,
  onResult,
}: {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onResult: (ok: boolean) => void;
}) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [pending, start] = useTransition();
  const inputs = useRef<Array<HTMLInputElement | null>>([null, null, null, null]);

  useEffect(() => {
    if (open) {
      setDigits(["", "", "", ""]);
      setTimeout(() => inputs.current[0]?.focus(), 30);
    }
  }, [open]);

  const change = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
    if (cleaned && index < 3) inputs.current[index + 1]?.focus();
  };

  const submit = () => {
    if (!order) return;
    const otp = digits.join("");
    if (otp.length !== 4) {
      toast.error("Enter all 4 digits");
      return;
    }
    if (order.id.startsWith("demo-")) {
      if (otp === "1234") {
        toast.success("Order collected");
        onResult(true);
      } else {
        toast.error("Wrong code, try 1234");
      }
      return;
    }
    start(async () => {
      const r = await verifyAndCollect(order.id, otp);
      if (r.ok) {
        toast.success("Order collected");
        onResult(true);
      } else {
        toast.error(r.error ?? "Wrong code");
        setDigits(["", "", "", ""]);
        inputs.current[0]?.focus();
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-scrim open" />
        <Dialog.Content className="modal" onPointerDownOutside={(e) => e.preventDefault()}>
          <span className="eyebrow" style={{ color: "var(--accent)" }}>Verify pickup</span>
          <Dialog.Title asChild>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "-0.02em", margin: "8px 0 4px" }}>
              Order <span style={{ color: "var(--accent)", fontStyle: "italic" }}>{order?.short_code ?? "T-2421"}</span>
            </h2>
          </Dialog.Title>
          <p>
            Ask <strong>{order?.customer_name ?? "student"}</strong> for their 4-digit pickup code.
          </p>
          <div className="kotp">
            <div className="otp-digits" data-purpose="kitchen">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputs.current[idx] = el;
                  }}
                  className="otp-d"
                  maxLength={1}
                  inputMode="numeric"
                  value={digits[idx]}
                  onChange={(e) => change(idx, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digits[idx] && idx > 0) inputs.current[idx - 1]?.focus();
                    if (e.key === "Enter") submit();
                  }}
                />
              ))}
            </div>
            {order?.id.startsWith("demo-") && (
              <p style={{ color: "var(--ink-3)", fontSize: 12, marginTop: 8 }}>
                Hint for demo: <span className="mono" style={{ color: "var(--accent)" }}>1234</span>
              </p>
            )}
          </div>
          <div className="row" style={{ justifyContent: "flex-end", marginTop: 24, gap: 8 }}>
            <Dialog.Close className="btn btn-ghost">Cancel</Dialog.Close>
            <button className="btn btn-primary" onClick={submit} disabled={pending}>
              {pending ? "Verifying..." : "Verify"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
