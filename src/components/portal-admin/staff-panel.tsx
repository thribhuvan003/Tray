"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { inviteStaff, revokeStaff } from "@/app/(admin)/admin/_actions";
import { cn, formatDateIST } from "@/lib/utils";

type Role = "student" | "kitchen_staff" | "canteen_admin" | "super_admin";
type Member = { id: string; user_id: string; role: Role; display_name: string | null; is_active: boolean; created_at: string };
type Invite = { id: string; email: string; role: Role; token: string; expires_at: string; accepted_at: string | null };

const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  kitchen_staff: "Kitchen staff",
  canteen_admin: "Canteen admin",
  super_admin: "Super admin",
};

export function StaffPanel({ members, invites, tenantSlug }: { members: Member[]; invites: Invite[]; tenantSlug: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"kitchen_staff" | "canteen_admin">("kitchen_staff");
  const [pending, start] = useTransition();
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  const onInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    start(async () => {
      const r = await inviteStaff(email.trim(), role, tenantSlug);
      if (!r.ok) toast.error(r.error ?? "Failed");
      else {
        toast.success("Invite sent");
        if (r.url) setLastUrl(r.url);
        setEmail("");
      }
    });
  };

  const onRevoke = (id: string) => {
    start(async () => {
      const r = await revokeStaff(id, tenantSlug);
      if (!r.ok) toast.error(r.error ?? "Failed");
      else toast.success("Access revoked");
    });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-3">
      <section className="bg-[var(--admin-bg-2)] border border-[var(--admin-line)] rounded-xl overflow-hidden">
        <header className="px-4 py-3 border-b border-[var(--admin-line)]">
          <h2 className="text-[13px] font-semibold text-[var(--admin-ink)]">Members ({members.length})</h2>
        </header>
        <ul>
          {members.map((m) => (
            <li
              key={m.id}
              className={cn(
                "px-4 py-3 flex items-center gap-3 border-b border-[var(--admin-line)] last:border-0",
                !m.is_active && "opacity-50"
              )}
            >
              <div className="h-9 w-9 rounded-full bg-[var(--admin-lime-soft)] text-[var(--admin-lime)] inline-flex items-center justify-center font-mono text-[12px] font-semibold">
                {(m.display_name ?? "U").slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-[var(--admin-ink)] truncate">
                  {m.display_name ?? `user_${m.user_id.slice(0, 6)}`}
                </div>
                <div className="text-[11px] font-mono text-[var(--admin-ink-3)]">
                  {ROLE_LABEL[m.role]} · since {formatDateIST(m.created_at).split(",")[0]}
                </div>
              </div>
              {m.is_active ? (
                <button
                  onClick={() => onRevoke(m.id)}
                  disabled={pending}
                  className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded border border-[var(--admin-rose)]/30 text-[var(--admin-rose)] hover:bg-[var(--admin-rose-soft)] cursor-pointer"
                >
                  <Trash2 size={11} /> Revoke
                </button>
              ) : (
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--admin-ink-3)]">Revoked</span>
              )}
            </li>
          ))}
          {members.length === 0 && (
            <li className="px-4 py-12 text-center text-[var(--admin-ink-3)] text-[13px]">No members yet.</li>
          )}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <form onSubmit={onInvite} className="bg-[var(--admin-bg-2)] border border-[var(--admin-line)] rounded-xl p-4 flex flex-col gap-3">
          <h2 className="text-[13px] font-semibold text-[var(--admin-ink)] inline-flex items-center gap-2">
            <UserPlus size={14} /> Invite staff
          </h2>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@yourcollege.edu"
            className="h-10 px-3 rounded-md bg-[var(--admin-bg-3)] border border-[var(--admin-line-2)] text-[13px] text-[var(--admin-ink)] placeholder:text-[var(--admin-ink-3)]/40 focus:outline-none focus:border-[var(--admin-lime)]"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="h-10 px-3 rounded-md bg-[var(--admin-bg-3)] border border-[var(--admin-line-2)] text-[13px] text-[var(--admin-ink)] focus:outline-none focus:border-[var(--admin-lime)]"
          >
            <option value="kitchen_staff" className="bg-[var(--admin-bg-3)]">Kitchen staff</option>
            <option value="canteen_admin" className="bg-[var(--admin-bg-3)]">Canteen admin</option>
          </select>
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-md bg-[var(--admin-lime)] text-[var(--admin-bg)] text-[13px] font-semibold hover:bg-[var(--admin-lime-2)] transition-colors cursor-pointer"
          >
            {pending ? "Sending…" : "Send invite"}
          </button>
          {lastUrl && (
            <div className="text-[11px] font-mono text-[var(--admin-ink-3)] bg-[var(--admin-bg-3)] p-2 rounded border border-[var(--admin-line)] break-all flex items-start gap-2">
              <Check size={12} className="text-[var(--admin-mint)] shrink-0 mt-0.5" />
              <span className="flex-1">{lastUrl}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(lastUrl);
                  toast.success("Copied");
                }}
                className="cursor-pointer text-[var(--admin-ink-2)] hover:text-[var(--admin-lime)]"
              >
                <Copy size={12} />
              </button>
            </div>
          )}
        </form>
        <div className="bg-[var(--admin-bg-2)] border border-[var(--admin-line)] rounded-xl p-4">
          <h3 className="text-[13px] font-semibold text-[var(--admin-ink)] mb-2">Pending invites</h3>
          {invites.length === 0 ? (
            <div className="text-[12px] text-[var(--admin-ink-3)]">No pending invites.</div>
          ) : (
            <ul className="flex flex-col gap-2">
              {invites.map((iv) => (
                <li key={iv.id} className="text-[12px] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[var(--admin-ink)] truncate">{iv.email}</div>
                    <div className="text-[10px] font-mono text-[var(--admin-ink-3)]">
                      {ROLE_LABEL[iv.role]} · expires {formatDateIST(iv.expires_at).split(",")[0]}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
