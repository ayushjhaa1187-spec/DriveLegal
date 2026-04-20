# Phase 12 — Scan & Verify v2

**Duration:** 4–6 weeks

**Objective:** Best-in-class challan verification.

## Tracked tasks

- [ ] [#18](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/18) — [P12.1] Client-side image preprocessing (crop / de-skew / contrast)
- [ ] [#19](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/19) — [P12.1] Tesseract fallback when Gemini Vision fails
- [ ] [#20](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/20) — [P12.2] Matching Algorithm v2 (exact → schedule → fuzzy)
- [ ] [#21](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/21) — [P12.3] Dispute Letter v2 (PDF + WhatsApp / email share)
- [ ] [#22](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/22) — [P12] Accuracy benchmark: 20 real-world challan samples

## Done when

- [ ] 20 real-world challan photos match with >= 90% section accuracy
- [ ] Dispute letter exports as clean PDF on mobile
- [ ] Tesseract fallback activates automatically on Vision failure

## Risks & mitigations

- OCR quality on low-end cameras — preprocessing pipeline mitigates.

Back to [ROADMAP.md](../../ROADMAP.md).
