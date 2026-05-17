<!-- Keep titles short. Use the body for context. -->

## Summary

<!-- What changed and why, in 1–3 bullets. -->

-
-

## Screenshots / recordings

<!-- Required for UI changes. Drag and drop or paste. -->

## Test plan

- [ ]
- [ ]

## Checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes locally
- [ ] Touches RLS / migrations? Verified policies for all roles (student, kitchen, admin)
- [ ] Touches money flow? Razorpay webhook still HMAC-verified and idempotent
- [ ] Touches schema? `src/lib/db/types.ts` regenerated
- [ ] No secrets, `.env.local`, or service-role keys committed

## Related

<!-- Issue / ADR / Linear ticket. -->
