# Reasoning / Debug View — Design

**Date:** 2026-04-13
**Status:** Approved, ready for implementation plan

## Problem

Today the Discover Zoho wizard shows a polished Phase I diagnostic (problem / root cause / severity / roadmap) but hides all of the AI's reasoning. When iterating on prompts, signal taxonomy, or solution-pattern mappings, there's no way — for developers or for internal stakeholders (product/sales) — to see:

- What the LLM received
- How it interpreted the user's situation
- Which signals it extracted and why
- How those signals mapped onto solution patterns in the rule engine

The LLM's free-text parsing is load-bearing per CLAUDE.md, but the output is opaque. Debugging today requires tailing Catalyst function logs.

## Goal

Add an internal-stakeholder-readable "Reasoning" card to the summary page that surfaces the AI's inputs, interpretation, extracted tags with evidence, and the rule-engine pattern trace. Include a collapsible "Developer details" section for raw prompt, raw response, and metadata. Extend Data Store logging so past sessions are reviewable later.

## Non-goals

- Multi-session dashboard / `/debug/:sessionId` route — out of scope for this change, though the logging changes here make it a natural follow-up.
- Changing the polished diagnostic card or the scoring engine's business logic.
- Exposing Zoho product names in Phase I output. The reasoning card references signals and patterns, not bundles.

## Architecture

```text
User submits PP4 + biggestWorry
        │
        ▼
discowizard_function (Catalyst)
        │  1. Build prompt (extended schema)
        │  2. Call Qwen via QuickML (measure latency)
        │  3. Parse JSON: diagnostic + parsedSignals + interpretation + signalEvidence
        │  4. Log all of it + prompt + rawResponse to WizardSessions
        ▼
Response payload:
  { status, data: { diagnostic, parsedSignals, interpretation, signalEvidence },
    _debug: { prompt, rawResponse, model, latencyMs, attempts } }
        │
        ▼
Client:
  • renderDiagnostic(d)         → existing polished card (unchanged)
  • ScoringEngine.score(...)    → existing, result now reused
  • renderReasoningCard(answers, scoringResult, debug) → NEW collapsible
```

One LLM call. `_debug` is always returned; the client decides what to display.

## Components

### Backend — `functions/discowizard_function/index.js`

**Extended LLM JSON schema.** Add two fields to the prompt at line 40:

```json
{
  "parsedSignals": { ... unchanged ... },
  "interpretation": "1-2 sentences in plain English explaining how you read the situation. Written for a human reviewer to sanity-check. Reference the user's own words where useful. No brand names.",
  "signalEvidence": {
    "root_cause_type": "Direct quote or close paraphrase from the user's free-text that justifies this tag.",
    "problem_pattern": "Same.",
    "urgency_signal": "Same. May pull from IU2 structured answer if free-text doesn't cover urgency."
  },
  "diagnostic": { ... unchanged ... }
}
```

**Instrumentation.** Capture `latencyMs` around the fetch call. `rawText` is already captured at line 114 — carry it into the response. `attempts` comes from `parsedBody.attempt || 1`. The client does not currently send this field; the implementation must add `attempt` to the POST body at `client/main.js:696`, incrementing it on retry at line 714.

**Response payload.** At line 149, emit:

```js
res.end(JSON.stringify({
  status: 'success',
  data: parsed,
  _debug: { prompt, rawResponse: rawText, model, latencyMs, attempts }
}));
```

**Validation.** Extend the missing-fields check at line 136 to require `interpretation` and `signalEvidence`. If either is missing, return 502 — same posture as the existing `parsedSignals`/`diagnostic` check. No partial render (per CLAUDE.md).

**Data Store logging.** Extend `WizardSessions` with new columns: `prompt` (Text), `raw_response` (Text), `latency_ms` (Number), `interpretation` (Text), `signal_evidence` (Text). Update `logSession` payload at line 194. Columns must be created in the Catalyst console *before* the function deploy, or `insertRow` will reject the extra fields.

### Frontend — `client/index.html`, `client/main.js`, `client/main.css`

**Markup.** Add a collapsible section to `#pageSummary` after the diagnostic block and before the Zoho bundles. Static skeleton with empty containers: `#reasoningInterpretation`, `#reasoningInputs`, `#reasoningQuotes`, `#reasoningSignals`, `#reasoningPatterns`, `#reasoningDevDetails`.

**State wiring.** At `client/main.js:661`, destructure the function response to capture four pieces (not two): `parsedSignals`, `diagnostic`, `interpretation`, `signalEvidence` into `state.answers`, and `_debug` into `state.answers._debug`.

**New render function.** `renderReasoningCard(answers, scoringResult, debug)` in `client/main.js`, called from `generateSummary()` right after `renderDiagnostic(...)` at line 836. Uses `scoringResult` from line 844 (currently discarded after `renderScoredSummary`).

**Layout** (top to bottom inside the card):

1. **LLM's interpretation** — block-quoted italic paragraph.
2. **What you told us** — structured answers as a labeled list (Industry, Sub-industry, Team size, Role, Breakdown, How handling today, What's driving it, Impact, Urgency). Label strings live inline in `renderReasoningCard`, not in `knowledge-model.json` (UI strings, not business logic).
3. **Your own words** — PP4 free-text and `biggestWorry` displayed verbatim, block-quoted. Separate section because this is the load-bearing text per CLAUDE.md.
4. **Signals the AI extracted** — three chips (`root_cause_type`, `problem_pattern`, `urgency_signal`), each with its `signalEvidence[tag]` snippet in muted text below the chip. If evidence is missing, render `—` (don't hide the chip — the gap is the debugging signal).
5. **Pattern matches (rule engine)** — top 3 from `scoringResult.top_patterns`. Each shows name, confidence, and contributing signals. See Open Questions for where contributing-signals data comes from.
6. **Developer details** — `<details>` element, collapsed by default. Inside: model name, latency, attempts, "Copy prompt" / "Copy raw response" buttons, and `<details>` sub-elements containing the prompt and raw response in `<pre>` blocks.

**URL param.** `?reasoning=1` auto-expands the card on load. Default: collapsed.

**Styles.** New CSS classes in `client/main.css`: `.reasoning-card`, `.reasoning-section`, `.signal-chip`, `.signal-evidence`, `.dev-details`. Reuse existing card/chip design language.

## Error handling

Posture: failures in the load-bearing path surface; failures in the reasoning-only path degrade gracefully.

- **Missing `interpretation` or `signalEvidence`** — treat same as missing `parsedSignals`/`diagnostic` today: 502, client retries once via the path at `client/main.js:712`, then surfaces error. No partial render.
- **Missing per-signal evidence** (object present, one tag's value missing) — render chip with `—` placeholder. Prompt-tuning signal, not a hard error; its visibility in the UI *is* the debugging.
- **Empty pattern trace** (no matches above threshold) — reasoning card still renders; pattern section shows "No pattern matched above threshold — check signal weights." Useful debug state.
- **Oversized `_debug` payload** — not a real concern at current scale. If Catalyst response caps ever become an issue, truncate `rawResponse` to first 8KB with a `[truncated]` marker. Defer until it breaks.
- **Data Store logging failure** — already fire-and-forget at lines 197-200. Keep that; failed log never breaks the user response.
- **Deploy ordering** — Data Store columns must exist before the function deploy or `insertRow` rejects new fields. Implementation plan must sequence console column creation → deploy.

## Testing

- **Function unit test** — canned `answers` payload + mocked Qwen fetch returning a fixture with all six fields. Assert response payload includes `data.interpretation`, `data.signalEvidence`, and `_debug.{prompt, rawResponse, model, latencyMs, attempts}`. Assert missing-field cases return 502.
- **Client render test** — given synthetic `state.answers` + `scoringResult` + `_debug`, assert `renderReasoningCard` populates all six subsections. Smoke test with jsdom or a manual test page is sufficient.
- **Manual QA checklist** — one scripted persona per PP1 branch (Sales, Service, Ops, Marketing). For each run: interpretation reads as plausible English; every signal chip has evidence or explicit `—`; quoted free-text matches input; pattern trace has ≥1 non-zero-confidence match; dev details toggle opens with plausible latency and valid-JSON raw response.
- **Prompt-regression watch** — semantic quality of `interpretation`/`signalEvidence` cannot be unit-tested. The reasoning card *is* the review instrument for prompt quality going forward. Out of scope for this change.

## Open questions (resolve during plan phase)

1. **Does the scoring engine expose contributing signals per pattern?** Read `client/scoring-engine.js` early in the plan. If it does, consume directly. If it doesn't, compute client-side in `renderReasoningCard` from the pattern's `required_signals` ∩ active signals. Prefer the client-side computation to keep the scoring engine pure.
2. **Where exactly does PP4 free-text land on `state.answers`?** Confirmed via `client/main.js:654` that `biggestWorry` is one of them. The PP4 free-text key (placeholder-branched by PP1) needs to be confirmed in the plan phase.

## Success criteria

- A developer running the wizard with `?reasoning=1` sees all six subsections populated with real data on the summary page.
- A stakeholder reviewing a completed run can answer "did the AI understand this user?" without opening dev tools or reading raw JSON.
- Every completed session logs `prompt`, `raw_response`, `latency_ms`, `interpretation`, and `signal_evidence` to `WizardSessions`, unlocking the future `/debug/:sessionId` route with only rendering work.
- When the LLM output is malformed, the user sees the existing retry path — not a half-rendered reasoning card.
