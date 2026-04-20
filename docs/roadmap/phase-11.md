# Phase 11 — AI Reliability Layer

**Duration:** 3–5 weeks

**Objective:** AI becomes safe + predictable (no hallucinations).

## Tracked tasks

- [ ] [#15](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/15) — [P11.1] Strict JSON schema intent parser + deterministic fallback
- [ ] [#16](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/16) — [P11.2] Composition rule: AI never emits fines directly
- [ ] [#17](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/17) — [P11.3] Golden dataset (200 queries) + nightly eval harness

## Done when

- [ ] LLM calls use strict JSON schema responses
- [ ] No numeric fines originate from the model
- [ ] 200-query golden dataset runs nightly with < 2% regression threshold

## Risks & mitigations

- Model outages — deterministic fallback always available.

Back to [ROADMAP.md](../../ROADMAP.md).
