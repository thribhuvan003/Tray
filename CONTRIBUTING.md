# Contributing to Tray

Thanks for taking the time. This is a short guide — read it once, then refer back as needed.

## Local setup

```bash
pnpm install
cp .env.example .env.local      # fill in keys
pnpm dev
```

Node 22 + pnpm 10 are the supported versions (matches CI).

## Branches

```
feat/<short-slug>       # new capability
fix/<short-slug>        # bug fix
chore/<short-slug>      # tooling, deps, scaffolding
docs/<short-slug>       # docs only
```

Branch off `main`. Keep branches small — one logical change per PR.

## Commits

Conventional Commits, lowercase, imperative:

```
feat(menu): show "out of stock" badge inline
fix(pay): retry capture on transient razorpay 5xx
chore(deps): bump @supabase/ssr to 0.5.3
```

Reference an issue when it exists (`fix(menu): … (#42)`).

## Pull requests

The PR template covers it, but in short:

1. `pnpm typecheck && pnpm lint && pnpm build` must pass.
2. UI changes need a screenshot or recording.
3. If you touched RLS, migrations, money flow, or auth — call it out explicitly in the description so review can focus.
4. Don't commit `.env.local`, service-role keys, or any other secret.

## Code style

- TypeScript strict, no `any` without a comment justifying it.
- Server Components by default; reach for `"use client"` only when needed.
- Tailwind utility classes; reach for `@apply` only when a pattern is repeated 3+ times.
- Co-locate small components; promote to `src/components/` when reused across portals.
- No comments explaining *what* the code does — only *why*, when the why is non-obvious.

## Database changes

1. Add a migration in `supabase/migrations/` (timestamped filename).
2. Update / add RLS policies in the same migration.
3. Regenerate types:
   ```bash
   supabase gen types typescript --project-id <ref> --schema public > src/lib/db/types.ts
   ```
4. Verify the policy for **every** role (student, kitchen_staff, canteen_admin, super_admin).

## Architecture decisions

For non-trivial changes, add an ADR in `docs/adr/` following the existing format (`NNNN-short-title.md`).

## Reporting bugs / requesting features

Use the issue templates. For security issues, see [`SECURITY.md`](./SECURITY.md) — do not file a public issue.
