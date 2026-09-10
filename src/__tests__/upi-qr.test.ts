import { describe, it, expect } from "vitest";
import { upiQrPayload } from "@/lib/payments/upi";

describe("upiQrPayload", () => {
  it("generates a valid UPI intent URL with standard fields", () => {
    const uri = upiQrPayload({
      vpa: "canteen@okhdfcbank",
      name: "Campus Canteen",
      amountPaise: 5043,
      note: "ORD-1234",
    });

    expect(uri).toBe(
      "upi://pay?pa=canteen@okhdfcbank&pn=Campus%20Canteen&am=50.43&cu=INR&tn=ORD-1234"
    );
  });

  it("preserves raw @ symbol in payee address", () => {
    const uri = upiQrPayload({
      vpa: "stall-42@upi",
      name: "Stall 42",
      amountPaise: 12000,
    });

    expect(uri).toContain("pa=stall-42@upi");
    expect(uri).not.toContain("%40");
  });

  it("encodes spaces in payee name as %20", () => {
    const uri = upiQrPayload({
      vpa: "stall@upi",
      name: "Anna's Dosa Stall",
      amountPaise: 4500,
    });

    expect(uri).toContain("pn=Anna's%20Dosa%20Stall");
  });

  it("sanitizes and truncates transaction note to 20 alphanumeric characters", () => {
    const uri = upiQrPayload({
      vpa: "stall@upi",
      name: "Stall",
      amountPaise: 1000,
      note: "Order #999999999999999999999999999999!",
    });

    expect(uri).toContain("&tn=Order%209999999999999");
  });

  it("formats integer rupee amounts with two decimal zeroes", () => {
    const uri = upiQrPayload({
      vpa: "stall@upi",
      name: "Stall",
      amountPaise: 5000,
    });

    expect(uri).toContain("&am=50.00&cu=INR");
  });

  it("handles floating point precision by rounding to nearest paise", () => {
    const uri = upiQrPayload({
      vpa: "stall@upi",
      name: "Stall",
      amountPaise: 5042.9999999,
    });

    expect(uri).toContain("&am=50.43&cu=INR");
  });

  it("throws when VPA is missing or does not contain @", () => {
    expect(() =>
      upiQrPayload({ vpa: "invalidvpa", name: "Stall", amountPaise: 1000 })
    ).toThrow(/Invalid UPI VPA/);

    expect(() =>
      upiQrPayload({ vpa: "", name: "Stall", amountPaise: 1000 })
    ).toThrow(/Invalid UPI VPA/);
  });

  it("throws when amount is zero or negative", () => {
    expect(() =>
      upiQrPayload({ vpa: "stall@upi", name: "Stall", amountPaise: 0 })
    ).toThrow(/Amount must be greater than 0/);

    expect(() =>
      upiQrPayload({ vpa: "stall@upi", name: "Stall", amountPaise: -100 })
    ).toThrow(/Amount must be greater than 0/);
  });
});
