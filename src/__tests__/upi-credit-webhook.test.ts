// @ts-nocheck — mock objects intentionally omit Supabase client internals
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
  env: { SUPABASE_SERVICE_ROLE_KEY: "service_role_test_key" },
}));
vi.mock("@/lib/logging", () => {
  const noop = () => {};
  const l = { debug: noop, info: noop, warn: noop, error: noop, withContext: () => l };
  return { logger: l, withRequestContext: () => l };
});
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 99 }),
}));

const mockGetAdminClient = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({ getAdminClient: (...a) => mockGetAdminClient(...a) }));

import { POST } from "@/app/api/webhooks/upi-credit/route";

const TENANT = "tenant-uuid-001";
const SECRET = "tray_upi_secret_demo";

function makeReq(body, secret = SECRET) {
  return new Request("http://localhost/api/webhooks/upi-credit", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-tray-upi-secret": secret,
      "x-forwarded-for": "1.2.3.4",
    },
    body: JSON.stringify(body),
  });
}

// Admin client: tenants lookup returns our tenant+secret; orders matcher returns
// the given pending rows; rpc returns rpcResult; upi_credit_events insert succeeds.
function adminWith({ tenantRow, matchRows, rpcResult }) {
  const rpc = vi.fn().mockResolvedValue({ data: rpcResult, error: null });
  const impl = () => ({
    from: (table) => {
      if (table === "tenants") {
        return {
          select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: tenantRow, error: null }) }) }),
        };
      }
      if (table === "orders") {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ gt: () => Promise.resolve({ data: matchRows, error: null }) }) }) }),
        };
      }
      if (table === "upi_credit_events") {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    },
    rpc,
  });
  impl.rpc = rpc;
  return { impl, rpc };
}

describe("upi-credit listener", () => {
  beforeEach(() => vi.clearAllMocks());

  it("401s on a bad secret", async () => {
    const { impl } = adminWith({
      tenantRow: { id: TENANT, upi_listener_secret: SECRET, upi_autoverify_enabled: true },
      matchRows: [],
      rpcResult: "captured",
    });
    mockGetAdminClient.mockImplementation(impl);
    const res = await POST(makeReq({ tenant: TENANT, text: "₹50.43 received" }, "WRONG"));
    expect(res.status).toBe(401);
  });

  it("confirms the matching order and returns matched:true", async () => {
    const { impl, rpc } = adminWith({
      tenantRow: { id: TENANT, upi_listener_secret: SECRET, upi_autoverify_enabled: true },
      matchRows: [{ id: "order-1", total_paise: 5000, upi_verify_paise: 43, placed_at: "2026-05-31T00:00:00Z" }],
      rpcResult: "captured",
    });
    mockGetAdminClient.mockImplementation(impl);
    const res = await POST(makeReq({ tenant: TENANT, text: "You received ₹50.43 from X" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.matched).toBe(true);
    expect(rpc).toHaveBeenCalledWith(
      "safe_capture_upi_credit",
      expect.objectContaining({ p_order_id: "order-1", p_amount_paise: 5043 })
    );
  });

  it("returns matched:false when no pending order has that amount", async () => {
    const { impl } = adminWith({
      tenantRow: { id: TENANT, upi_listener_secret: SECRET, upi_autoverify_enabled: true },
      matchRows: [{ id: "order-1", total_paise: 5000, upi_verify_paise: 43, placed_at: "2026-05-31T00:00:00Z" }],
      rpcResult: "captured",
    });
    mockGetAdminClient.mockImplementation(impl);
    const res = await POST(makeReq({ tenant: TENANT, text: "₹999.99 received" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.matched).toBe(false);
  });

  it("returns parsed:false for unparseable text", async () => {
    const { impl } = adminWith({
      tenantRow: { id: TENANT, upi_listener_secret: SECRET, upi_autoverify_enabled: true },
      matchRows: [],
      rpcResult: "captured",
    });
    mockGetAdminClient.mockImplementation(impl);
    const res = await POST(makeReq({ tenant: TENANT, text: "Payment request from John" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.parsed).toBe(false);
  });
});
