# Phase 8 — Data Excellence & Legal Auditability

**Duration:** 2–4 weeks

**Objective:** Make law data a source-of-truth system with verifiable provenance.

## Tracked tasks

- [ ] [#1](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/1) — [P8.1] Introduce Law Packs with SemVer + pack_metadata.json
- [ ] [#2](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/2) — [P8.1] Generate checksums.json for integrity + tamper detection
- [ ] [#3](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/3) — [P8.1] UI: 'Law Pack: IN-central@1.2.0 — Verified on YYYY-MM-DD' badge
- [ ] [#4](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/4) — [P8.2] Weekly scraper GitHub Action: Fetch → Extract → Diff → PR
- [ ] [#5](https://github.com/ayushjhaa1187-spec/DriveLegal/issues/5) — [P8.3] Build /tools/audit internal page + accuracy scoring

## Done when

- [ ] App displays: "Law Pack: IN-central@1.2.0 — Verified on 2026-05-20"
- [ ] Every violation has a working `source_url + excerpt + page`
- [ ] Changes never merge without validation + diff report
- [ ] Accuracy % tracked over time in `/tools/audit`

## Risks & mitigations

- LLM extraction drifts vs. source PDFs → mitigated by schema + diff gate
- Source URLs 404 → nightly link-check job

Back to [ROADMAP.md](../../ROADMAP.md).
