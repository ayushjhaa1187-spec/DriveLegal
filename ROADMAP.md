# 🗺️ DriveLegal Advanced Roadmap (Phase 8 → 20)

> Turn the hackathon MVP into a **production-grade, legally-auditable, offline-first** consumer app.
> Optional cloud features (auth, community, analytics) must never break the core offline experience.

- Living doc — every bullet links to a tracked GitHub issue.
- Milestones define due dates; labels define phase + type + priority.
- A phase is "done" when every issue under its milestone is closed.

## At-a-glance timeline

| Month | Phases |
|-------|--------|
| M1–M2 | Phase 8–10 (data + law engine + UX polish) |
| M3    | Phase 11–12 (AI reliability + scan v2) |
| M4    | Phase 13–14 (auth + license health) |
| M5–M6 | Phase 15–16 (hotspots + global benchmark) |
| M7    | Phase 17–19 (analytics + security + release engineering) |
| Long  | Phase 20 (partnerships) |

## Phases

### Phase 8 — Data Excellence & Legal Auditability · _2–4 weeks_

**Objective:** Make law data a source-of-truth system with verifiable provenance.

Phase doc: [`docs/roadmap/phase-08.md`](docs/roadmap/phase-08.md)

- [ ] [#1](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/1) — [P8.1] Introduce Law Packs with SemVer + pack_metadata.json
- [ ] [#2](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/2) — [P8.1] Generate checksums.json for integrity + tamper detection
- [ ] [#3](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/3) — [P8.1] UI: 'Law Pack: IN-central@1.2.0 — Verified on YYYY-MM-DD' badge
- [ ] [#4](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/4) — [P8.2] Weekly scraper GitHub Action: Fetch → Extract → Diff → PR
- [ ] [#5](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/5) — [P8.3] Build /tools/audit internal page + accuracy scoring

### Phase 9 — Law Engine v2 (Explainable + Deterministic) · _2–3 weeks_

**Objective:** Calculator becomes court-defensible logic.

Phase doc: [`docs/roadmap/phase-09.md`](docs/roadmap/phase-09.md)

- [ ] [#6](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/6) — [P9.1] Decision Table Engine with explanation trace
- [ ] [#7](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/7) — [P9.1] UI: 'Why this amount?' expandable trace on result
- [ ] [#8](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/8) — [P9.2] Property-based / fuzz tests for the law engine
- [ ] [#9](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/9) — [P9.2] 100% unit coverage on law engine

### Phase 10 — UX v2 (Mobile-first, Delight) · _2–4 weeks_

**Objective:** Make it feel like a polished consumer product.

Phase doc: [`docs/roadmap/phase-10.md`](docs/roadmap/phase-10.md)

- [ ] [#10](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/10) — [P10.1] Mobile bottom tabs + Scan FAB; desktop top bar + sidebar
- [ ] [#11](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/11) — [P10.1] Global search (Cmd/Ctrl+K) across violations, sections, rights
- [ ] [#12](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/12) — [P10.2] Calculator Wizard v2 (3-step smart flow)
- [ ] [#13](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/13) — [P10.3] WCAG AA audit (keyboard, screen reader, reduced-motion)
- [ ] [#14](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/14) — [P10.3] Indic font rendering QA (Hindi / Tamil / Telugu / etc.)

### Phase 11 — AI Reliability Layer · _3–5 weeks_

**Objective:** AI becomes safe + predictable (no hallucinations).

Phase doc: [`docs/roadmap/phase-11.md`](docs/roadmap/phase-11.md)

- [ ] [#15](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/15) — [P11.1] Strict JSON schema intent parser + deterministic fallback
- [ ] [#16](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/16) — [P11.2] Composition rule: AI never emits fines directly
- [ ] [#17](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/17) — [P11.3] Golden dataset (200 queries) + nightly eval harness

### Phase 12 — Scan & Verify v2 · _4–6 weeks_

**Objective:** Best-in-class challan verification.

Phase doc: [`docs/roadmap/phase-12.md`](docs/roadmap/phase-12.md)

- [ ] [#18](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/18) — [P12.1] Client-side image preprocessing (crop / de-skew / contrast)
- [ ] [#19](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/19) — [P12.1] Tesseract fallback when Gemini Vision fails
- [ ] [#20](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/20) — [P12.2] Matching Algorithm v2 (exact → schedule → fuzzy)
- [ ] [#21](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/21) — [P12.3] Dispute Letter v2 (PDF + WhatsApp / email share)
- [ ] [#22](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/22) — [P12] Accuracy benchmark: 20 real-world challan samples

### Phase 13 — Auth + User Profiles · _3–4 weeks_

**Objective:** Cross-device sync + trust, without harming offline mode.

Phase doc: [`docs/roadmap/phase-13.md`](docs/roadmap/phase-13.md)

- [ ] [#23](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/23) — [P13.1] Mobile OTP (WhatsApp/SMS) login
- [ ] [#24](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/24) — [P13.1] Google login (secondary) + Passkeys scaffold
- [ ] [#25](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/25) — [P13.2] Profile: preferred language, state, vehicle, history, scans

### Phase 14 — License Health Dashboard · _2–3 weeks_

**Objective:** Personalized risk awareness (but legally cautious).

Phase doc: [`docs/roadmap/phase-14.md`](docs/roadmap/phase-14.md)

- [ ] [#26](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/26) — [P14.1] Green/Yellow/Red license health tiers
- [ ] [#27](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/27) — [P14.2] Reminders: PUC, Insurance, RC

### Phase 15 — Community Legal Hotspots · _6–10 weeks_

**Objective:** Crowdsourced enforcement hotspots + warnings.

Phase doc: [`docs/roadmap/phase-15.md`](docs/roadmap/phase-15.md)

- [ ] [#28](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/28) — [P15.1] Backend data model + trust score (Supabase)
- [ ] [#29](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/29) — [P15.2] Moderation + anti-spam (rate limits, proximity, abuse reports)
- [ ] [#30](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/30) — [P15.3] Map + list UX with 'Approaching hotspot' geofence banner

### Phase 16 — Global Benchmark Tool · _3–5 weeks_

**Objective:** Compare Indian penalties to global standards + shareable insights.

Phase doc: [`docs/roadmap/phase-16.md`](docs/roadmap/phase-16.md)

- [ ] [#31](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/31) — [P16.1] Normalized comparison dataset (currency + severity)
- [ ] [#32](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/32) — [P16.2] Share-first output cards (WhatsApp-first)

### Phase 17 — Observability, Analytics, Growth · _2–3 weeks_

**Objective:** Understand usage without violating privacy.

Phase doc: [`docs/roadmap/phase-17.md`](docs/roadmap/phase-17.md)

- [ ] [#33](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/33) — [P17] Privacy-first analytics (Plausible/Umami) + offline queue
- [ ] [#34](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/34) — [P17] Optional Sentry crash reporting with user opt-in

### Phase 18 — Security + Compliance Hardening · _2–4 weeks_

**Objective:** Be govt-grade.

Phase doc: [`docs/roadmap/phase-18.md`](docs/roadmap/phase-18.md)

- [ ] [#35](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/35) — [P18] Strict CSP headers + dependency scanning + SBOM
- [ ] [#36](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/36) — [P18] Rate limiting + bot protection on API routes
- [ ] [#37](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/37) — [P18] Data Protection page aligned with competition terms

### Phase 19 — Release Engineering · _2–3 weeks_

**Objective:** Safe updates at scale.

Phase doc: [`docs/roadmap/phase-19.md`](docs/roadmap/phase-19.md)

- [ ] [#38](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/38) — [P19] Feature flags (remote config optional)
- [ ] [#39](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/39) — [P19] Law-pack update prompts in UI
- [ ] [#40](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/40) — [P19] Canary releases on Vercel + Lighthouse CI gate

### Phase 20 — Partnerships & Integrations · _Long-term_

**Objective:** Extend reach via deep links, directories, and B2B APIs.

Phase doc: [`docs/roadmap/phase-20.md`](docs/roadmap/phase-20.md)

- [ ] [#41](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/41) — [P20] Parivahan / eChallan deep links
- [ ] [#42](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/42) — [P20] RTO help directory by state
- [ ] [#43](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/43) — [P20] Driving school widget embeds
- [ ] [#44](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/44) — [P20] Fleet APIs (B2B)

---

## How to contribute

1. Pick an issue from a phase whose dependencies are done.
2. Comment `/claim` on the issue so others don't duplicate work.
3. Branch naming: `phase-<N>/<short-slug>` (e.g. `phase-8/law-packs-semver`).
4. Every PR must link its issue (`Closes #<N>`) and mention the phase.
5. CI must be green. New features need tests.

## Labels

- `phase-8` … `phase-20` — which phase the work lives in
- `type:feature`, `type:infra`, `type:data`, `type:ai`, `type:ux`, `type:security`, `type:testing`, `type:docs`
- `priority:p0` (blocker) · `p1` (high) · `p2` (normal) · `p3` (nice-to-have)
- `status:ready`, `status:blocked`, `status:in-design`

## One architectural decision still pending

Do we keep DriveLegal **strictly "no backend" forever**, or add a **minimal optional backend** (Supabase/Firebase) for: OTP login + hotspots + sync?

Phase 13 and 15 are gated on this. Tracking in [`docs/roadmap/decisions/0001-backend-policy.md`](docs/roadmap/decisions/0001-backend-policy.md).
