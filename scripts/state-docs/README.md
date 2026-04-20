# State Docs Pipeline

Pan-India legal document parsing and summarization pipeline for DriveLegal.

Parses state-level compounding schedules, gazette notifications, and e-challan tables into:
1. **Structured machine data** — state-specific fine/compounding overrides for the calculator
2. **State Digest** — human-readable summary JSON consumed by the UI

---

## Repo Layout

```
data/
  sources/
    state_docs_registry.json        # Master list of all source docs to process
  extracted/
    state-docs/
      [STATE]/
        [docId]/
          raw.pdf                   # Downloaded source
          raw.txt                   # Extracted text
          sections.json             # Discovered sections
          overrides_raw.json        # LLM-extracted overrides
          _normalized_overrides.json # Deduped, conflict-resolved overrides
  digests/
    states/
      [STATE].json                  # Final UI-ready digest

scripts/state-docs/
  fetch.ts                          # Step A: Download & fingerprint PDFs/HTML
  pdf-text.ts                       # Step B: Extract text (with OCR fallback note)
  section-discovery.ts              # Step C: Discover relevant sections
  extract-overrides.ts              # Step D: Regex + LLM extraction
  normalize-overrides.ts            # Step E: Dedup, conflict resolution, merge
  build-state-digest.ts             # Step F: Aggregate into state digest
```

---

## Pipeline Steps

### Step A — Fetch (`fetch.ts`)
Downloads source PDFs/HTML for a given state from `state_docs_registry.json`. Computes SHA-256 fingerprint to skip re-downloads.

```bash
npx tsx scripts/state-docs/fetch.ts --state=MH
```

### Step B — PDF Text (`pdf-text.ts`)
Extracts text from downloaded PDFs page by page using `pdf-parse`. Falls back to OCR note if text is sparse.

```bash
npx tsx scripts/state-docs/pdf-text.ts --file=data/extracted/state-docs/MH/MH-compounding-2022/raw.pdf
```

### Step C — Section Discovery (`section-discovery.ts`)
Scans extracted text for MV Act sections, compounding/fine keywords, and table headers.

```bash
npx tsx scripts/state-docs/section-discovery.ts --file=data/extracted/state-docs/MH/MH-compounding-2022/raw.txt
```

### Step D — Extract Overrides (`extract-overrides.ts`)
Combines regex patterns + LLM (Claude) structured extraction to pull fine/compounding rows.

```bash
npx tsx scripts/state-docs/extract-overrides.ts --state=MH --doc=MH-compounding-2022
```

Requires `ANTHROPIC_API_KEY` env var.

### Step E — Normalize (`normalize-overrides.ts`)
Deduplicates rows, resolves conflicts, flags ambiguous entries.

```bash
npx tsx scripts/state-docs/normalize-overrides.ts --state=MH
```

### Step F — Build Digest (`build-state-digest.ts`)
Aggregates all normalized overrides into the UI-ready `data/digests/states/[STATE].json`.

```bash
npx tsx scripts/state-docs/build-state-digest.ts --state=MH
```

---

## Full Pipeline (one state)

```bash
STATE=MH
npx tsx scripts/state-docs/fetch.ts --state=$STATE
# Manually run pdf-text.ts per doc, or automate in CI
npx tsx scripts/state-docs/section-discovery.ts --state=$STATE
npx tsx scripts/state-docs/extract-overrides.ts --state=$STATE --doc=[docId]
npx tsx scripts/state-docs/normalize-overrides.ts --state=$STATE
npx tsx scripts/state-docs/build-state-digest.ts --state=$STATE
```

---

## Document Types

| Type | Description |
|------|-------------|
| `state_compounding_schedule` | Official state compounding fee schedule |
| `state_notification` | Gazette notifications with amended rates |
| `police_echallan_table` | Traffic police e-challan fine tables |
| `court_order` | High Court / MACT orders on standard fines |
| `other` | Miscellaneous legal docs |

---

## Quality Rules

- **Never invent amounts** — if amount not found, set `null`
- **Preserve source excerpts** — always populate `source_text_excerpt`
- **Prefer compounding_schedule** over e-challan when conflict exists
- **Flag conflicts** — do not silently discard; add `has_conflict: true` + `conflict_note`
- **Confidence levels**: `high` = exact table row found, `medium` = inferred from text, `low` = OCR/ambiguous

---

## Adding a New State

1. Add entries to `data/sources/state_docs_registry.json`
2. Run the pipeline steps A–F for that state
3. The digest is auto-written to `data/digests/states/[STATE].json`
4. Import in UI via the state digest API

---

## Dependencies

```bash
npm install pdf-parse axios cheerio
npm install -D @types/pdf-parse tsx typescript
```

LLM extraction uses `@anthropic-ai/sdk` (Claude). Set `ANTHROPIC_API_KEY` in `.env`.
