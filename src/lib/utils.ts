import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupees(paise: number, opts: { withSymbol?: boolean } = {}) {
  const { withSymbol = true } = opts;
  const rupees = paise / 100;
  const s = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
  return withSymbol ? `₹${s}` : s;
}

export function formatTimeIST(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
    hour12: false,
  }).format(date);
}

export function formatDateIST(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function elapsedSeconds(from: Date | string) {
  const t = typeof from === "string" ? new Date(from).getTime() : from.getTime();
  return Math.floor((Date.now() - t) / 1000);
}

export function fmtElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function randomOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function tenantHeaders(tenantId: string | null) {
  if (!tenantId) return {} as Record<string, string>;
  return { "x-tenant-id": tenantId };
}
