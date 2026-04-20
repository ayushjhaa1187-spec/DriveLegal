# Phase 9 — Law Engine v2 (Explainable + Deterministic)

**Duration:** 2–3 weeks

**Objective:** Calculator becomes court-defensible logic.

## Tracked tasks

- [ ] [#6](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/6) — [P9.1] Decision Table Engine with explanation trace
- [ ] [#7](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/7) — [P9.1] UI: 'Why this amount?' expandable trace on result
- [ ] [#8](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/8) — [P9.2] Property-based / fuzz tests for the law engine
- [ ] [#9](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/9) — [P9.2] 100% unit coverage on law engine

## Done when

- [ ] Result UI shows "Why this amount?" expandable trace
- [ ] Property-based tests cover invariants with 5k+ cases each
- [ ] 100% unit coverage on `src/lib/law-engine`

## Risks & mitigations

- Performance regressions in the evaluator → benchmark harness added alongside.

Back to [ROADMAP.md](../../ROADMAP.md).
