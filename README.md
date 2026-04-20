<!--
  DRIVELEGAL — HACKATHON SUBMISSION
  Offline-First PWA + LLM-Augmented Legal Engine
  Ask. Know. Contest. Drive Safe.
  Deployed: Vercel | Edge: Cloudflare | AI: Gemini 1.5 Flash + Groq (Llama-3.1) + HuggingFace
-->

<div align="center">

<a href="https://drivelegal.vercel.app/">
  <img src="https://img.shields.io/badge/🌐%20Live%20Demo-drivelegal.vercel.app-0ea5e9?style=for-the-badge&labelColor=0c4a6e" />
</a>

<br/><br/>

[🌐 Live Demo](https://drivelegal.vercel.app/) &nbsp;•&nbsp;
[📋 Problem Statement](#-problem-statement) &nbsp;•&nbsp;
[🗺️ Implementation Plan](#-40-day-master-timeline) &nbsp;•&nbsp;
[⚖️ Data Sources](#-data-acquisition--curation) &nbsp;•&nbsp;
[🐛 Report Bug](../../issues) &nbsp;•&nbsp;
[💡 Request Feature](../../issues)

</div>

***

## 📖 Table of Contents

- [What is DriveLegal?](#-what-is-drivelegal)
- [Problem Statement](#-problem-statement)
- [Core Features](#-core-features)
- [System Architecture](#-system-architecture)
- [Workflow Diagrams](#-workflow-diagrams)
- [Integrated Ecosystem](#-integrated-ecosystem)
- [Tech Stack](#-tech-stack-breakdown)
- [Data Acquisition & Curation](#-data-acquisition--curation)
- [Data Schema](#-data-schema)
- [LLM Extraction Pipeline](#-llm-extraction-pipeline)
- [Feature Specs](#-feature-specs)
- [UI / UX & Accessibility](#-ui--ux--accessibility)
- [Testing & Hardening](#-testing--hardening)
- [Scale Engineering](#-scale-engineering--how-we-serve-9m-users-on-free-tiers)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [40-Day Master Timeline](#-40-day-master-timeline)
- [Risks & Mitigations](#-risks--mitigations)
- [Success Metrics](#-success-metrics)
- [Roadmap](#-roadmap)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Team](#-team)

***

## 🎯 What is DriveLegal?

> **DriveLegal** is an **offline-first Progressive Web App** that acts as an **AI legal companion for every road user**. It fuses a **deterministic challan calculator**, **LLM-powered natural-language Q&A**, a **scan-and-verify overcharge detector**, and a **multilingual Know-Your-Rights chatbot** — all served over a **zero-backend, static-first architecture** that runs on free tiers and scales to millions.

Think of it as: **Google Translate** × **TurboTax** × **Wikipedia-for-traffic-law** — built for hackathon, engineered to scale, and designed to work **even in airplane mode**.

```
┌──────────────────────────────────────────────────────────────────┐
│                 DRIVELEGAL VALUE PROPOSITION                     │
├───────────────────────┬──────────────────────┬───────────────────┤
│    Traditional        │     DriveLegal       │      Outcome      │
├───────────────────────┼──────────────────────┼───────────────────┤
│ Citizens don't know   │ Instant fine lookup  │ Transparency &    │
│ the actual fine       │ by state + section   │ informed citizens │
├───────────────────────┼──────────────────────┼───────────────────┤
│ Lawyers charge ₹1000+ │ Free AI legal Q&A    │ Access to justice │
│ for basic questions   │ with citations       │ for every driver  │
├───────────────────────┼──────────────────────┼───────────────────┤
│ Overcharging at       │ Scan-and-Verify OCR  │ Empowered         │
│ checkpoints           │ + dispute letter     │ disputing         │
├───────────────────────┼──────────────────────┼───────────────────┤
│ English-only legal    │ 10+ Indic languages  │ True inclusivity  │
│ information           │ + voice queries      │                   │
├───────────────────────┼──────────────────────┼───────────────────┤
│ Needs 4G + server     │ Works 100% offline   │ Reliable on hwys  │
│ every single time     │ after first visit    │ & rural roads     │
└───────────────────────┴──────────────────────┴───────────────────┘
```

***

## 🧩 Problem Statement

> 60% of Indian drivers do **not** know the fines they pay at checkpoints — and a material percentage of those fines are **incorrect, outdated, or deliberately inflated**. There is **no single authoritative, multilingual, offline-capable tool** that tells a citizen exactly what the law says for their state, their vehicle, and their situation.

**DriveLegal solves three compounding failures simultaneously:**

1. **Information asymmetry** — The full Motor Vehicles Act, 36 state amendments, and hundreds of notifications are scattered across government PDFs.
2. **Language barrier** — Over 70% of Indians are not comfortable reading legal English.
3. **Connectivity barrier** — Highways, rural areas, and checkpoint scenarios often have poor or no data coverage.

***

## ✨ Core Features

### 🧮 Challan Calculator
- 3-step wizard: **Violation × Vehicle × State × Repeat offender?**
- Instant results — **zero spinner**, because all data is local JSON
- Returns: exact fine, legal section, imprisonment risk, licence impact, shareable URL
- Supports all **36 states & UTs** with state-specific overrides

### 💬 Natural-Language Q&A
- Ask in plain English or Hindi: *"How much fine if I don't wear helmet in Pune?"*
- **LLM only parses intent** → structured query → lookup in local authoritative JSON
- **LLM never invents fines** — all answers cite the exact source section + page
- Fallback: keyword search on local data if LLM is unreachable

### 📸 Scan-and-Verify OCR  ⭐ Hero Feature
- User uploads photo of a challan receipt
- **Gemini 1.5 Flash Vision (free tier)** extracts violation, date, amount charged
- Engine **compares charged amount vs legal amount** → flags overcharging in red
- **Auto-generates a Dispute Letter PDF** with correct section references if overcharged

### 📡 Offline-First PWA
- Service worker precaches app shell + `violations.json` (2.5 MB, ~400 KB gzipped)
- **100% of core features work in airplane mode** after first visit
- Installable on Android/iOS home screen — looks and feels like a native app
- Background sync for Q&A history

### 🌐 Multi-Language Support
- **Pre-translated** UI + law titles/descriptions in **10+ languages**: English, Hindi, Tamil, Marathi, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi
- Dynamic Q&A responses translated on-the-fly
- **Voice queries** via Web Speech API in all supported Indic languages

### ⚖️ Know-Your-Rights Chat
- Pre-prompted Gemini chatbot with strict guardrails
- Topics: **contesting a challan, Lok Adalat procedure, traffic court flow, required documents**
- Disclaimer auto-injected in every response for legal safety

### 🌍 Global Mode
- Top 10 countries: **USA, UK, UAE, Australia, Canada, Germany, Singapore, Japan, Saudi Arabia, Nigeria**
- Country-specific rule packs bundled at build time (not runtime)
- One-click country switch from the header

### 🧩 Embeddable Widget
- `<iframe src="drivelegal.app/embed/calculator?state=TN">`
- Designed for driving schools, state government sites, insurance portals, fleet operators

***

## 🏗️ System Architecture

### The Core Insight

> DriveLegal is **static-first, LLM-assisted** — not LLM-first. **95%+** of all user queries are resolved by a **deterministic rule engine running in the browser** on cached JSON. The LLM is invoked only for **natural-language understanding** (parsing a sentence into `{violation, state, vehicle}`) — never for generating legal amounts.

```
┌─────────────────────────────────────────────────────────────────────┐
│                       USER BROWSER (PWA)                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Service Worker (offline cache)                               │  │
│  │    -  violations.json (2.5 MB)                                 │  │
│  │    -  UI shell                                                 │  │
│  │    -  Last 50 Q&A responses                                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  IndexedDB — user preferences, saved challans, Q&A history    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Deterministic Rule Engine (pure JS, fully offline)           │  │
│  │    → 95%+ of queries resolved WITHOUT internet                │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  (only for NLU / novel queries)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  VERCEL EDGE FUNCTION (proxy)                       │
│    -  Rate limiting (Upstash Redis free tier)                        │
│    -  API key rotation:  Gemini → Groq → HuggingFace                │
│    -  Response caching (Cloudflare 24 h TTL)                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
      ┌──────────────────┬─────────────────┬────────────────────┐
      │  Gemini 1.5      │   Groq          │   HuggingFace      │
      │  Flash (primary) │   Llama-3.1 70B │   (Backup)         │
      │  1,500 req/day   │  14,400 req/day │   1,000 req/day    │
      └──────────────────┴─────────────────┴────────────────────┘
```

### Design Principles

| Principle | How we enforce it |
|---|---|
| **Static-first** | 95%+ of queries hit cached JSON, never a server |
| **LLM only for NLU** | AI only parses natural-language → structured query |
| **Graceful degradation** | If LLM fails → keyword search on local data |
| **Zero write operations on hot path** | No user-generated content writes = infinite read scale |
| **Deterministic > probabilistic** | Fines never come from LLM weights — always from authoritative JSON |
| **Privacy by design** | No user accounts, no behavioural tracking, no data leaves device |

---

…and then keep the rest of your sections (Workflow Diagrams, Tech Stack, Data Schema, etc.) exactly as you already had them, since they were structurally fine.

Key fixes you should also do in Git:

- Remove the conflict markers: `<<<<<<< HEAD`, `=======`, `>>>>>>> …`.
- Delete the old create-next-app boilerplate section entirely so your README is focused on DriveLegal.
- Remove the stray block of bare `[` lines under the `<img>` badge; they were breaking Markdown.

If you want, I can next:  
- Trim this into a shorter “judge-friendly” README, or  
- Add a small “Getting Started for judges” section at the very top.
