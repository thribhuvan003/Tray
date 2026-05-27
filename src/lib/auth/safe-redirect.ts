// Validates `next` redirect parameters to prevent open-redirect attacks.
// `new URL(absolute, base)` silently ignores the base for absolute URLs,
// so we reject anything that isn't a relative path starting with "/".
const SAFE_PATH = /^\/[a-zA-Z0-9\-_.~!$&'()*+,;=:@%/?#]*$/;

export function safeNext(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  try {
    // If `next` is an absolute URL, new URL() will parse it without throwing.
    // We detect this by checking that the origin matches a dummy localhost base.
    const u = new URL(next, "http://localhost");
    if (u.origin !== "http://localhost") return fallback;
  } catch {
    return fallback;
  }
  return SAFE_PATH.test(next) ? next : fallback;
}
