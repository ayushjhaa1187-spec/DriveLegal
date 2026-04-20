# ADR 0001 — Backend policy (no-backend vs. minimal optional backend)

- **Status:** Proposed
- **Date:** 2026-04-20

## Context

DriveLegal was built offline-first with zero backend. Phases 13 (auth) and 15
(hotspots) require persistent server-side state. We must decide whether to:

1. Stay strictly no-backend forever (drop auth-required and community features).
2. Add a minimal optional backend (Supabase) for OTP login, hotspots, and sync
   — gated behind feature flags so the core offline experience is untouched.

## Decision

_Pending — capture user decision and update this ADR._

## Consequences

- **Option 1:** Simpler ops; no community/auth features; purely client-side.
- **Option 2:** Opens growth lanes (license health sync, community hotspots,
  fleet APIs), but adds ops burden and auth surface to harden (Phase 18).

## Links

- Phase 13 · `docs/roadmap/phase-13.md`
- Phase 15 · `docs/roadmap/phase-15.md`
