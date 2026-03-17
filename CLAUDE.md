# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

You are assisting with the design, development, and iteration of Discover Zoho, an adaptive, multi-step wizard that recommends Zoho product solutions (not individual apps) based on a user's journey stage, business context, pain points, and priorities.

This wizard replaces shallow, single-product recommendation flows with a consultative self-service experience. It targets four user types: new prospects, evaluating buyers, current/returning customers, and advanced/technical users. The core problem it solves is that Zoho One customers can't reach minimum value fast enough — they get overwhelmed by the app catalog, try to implement too much at once, and churn before their core business functions are running.

The platform target is Zoho Catalyst (serverless functions, web client hosting, data store, AI services). Final platform confirmation happens during technical specification.

---

## Architecture Context

The wizard uses a four-layer intelligence model:

1. **User Input** — Structured questions capture company size, industry, role, team structure, current tools, sales motion, pain points, and desired outcomes. Free-text fields are optional supplements.
2. **Business Signals** — Answers are converted into normalized internal tags with confidence levels. One answer can produce multiple signals (e.g., "We lose track of leads" → `lead_management_needed` high, `followup_automation_needed` high, `reporting_needed` moderate).
3. **Solution Patterns** — Signals are matched to predefined solution archetypes (e.g., "Lead Capture + Sales Follow-up"), not individual products. Each pattern includes required signals, anti-signals, ideal company profile, and expected business outcome.
4. **Product Bundles** — Only after a solution pattern is selected does the system map to actual Zoho apps. Bundles include primary apps, supporting apps, conditional add-ons, business reasoning, and a suggested rollout order.

Decision engine uses weighted rule-based scoring, constraints/exclusions, and confidence scoring (high = recommend immediately, medium = ask follow-up questions, low = surface alternate paths).

AI role is strictly limited: AI parses free-text input into structured tags (JSON with extracted signals and confidence scores). AI does NOT pick apps, generate recommendations, or decide rollout order. All recommendation logic is rule-based for explainability and testability.

---

## Data Model Categories

- **Configuration data**: Questions, answer options, answer-to-signal mappings, signal definitions, solution pattern definitions, pattern-to-bundle mappings, industry/size modifiers, exclusion rules.
- **Runtime data**: User sessions, collected answers, generated signals with weights, matched patterns with confidence scores, final recommendations served, explanation templates used.
- **Feedback data**: User engagement with recommendations, trial starts, app activations, conversions. Feeds back into scoring weight tuning over time.

---

## Wizard Flow

### Step 1 — User Identification and Journey Stage

Classify the user into one of four journey stages via opening questions or existing account data:

- **New prospect**: No existing Zoho relationship. Discovery-level guidance.
- **Evaluating buyer**: Aware of Zoho, comparing options. Solution-level clarity.
- **Current/returning customer**: Already subscribed. Optimization or expansion guidance.
- **Advanced/technical user**: Comfortable with ecosystem. Deeper integrations, automations, customization.

Classification sets the tone, depth, and output type for the rest of the flow.

### Step 2 — Progressive Discovery (4 stages, adaptive)

- **Stage 1 — Context**: Role, team size/structure, industry.
- **Stage 2 — Business Activities**: Users select from a defined set of activities representing real workflows (see Activity-to-Product Mapping below). Multiple selections drive integrated solution recommendations.
- **Stage 3 — Current Pain Points**: Where they're struggling with existing business software.
- **Stage 4 — Priorities**: Cost, speed, integration, simplicity, or scalability.

Each stage adapts based on journey classification. New prospects see broader/simpler questions. Advanced users skip basics and go straight to integration/customization territory.

### Step 3 — Output

Based on collected data, the wizard maps to one or more output types:

- **Product combinations**: Recommended set of Zoho tools that work together.
- **Solution overviews**: End-to-end view of how Zoho addresses their business challenge.
- **Introductory content**: Guides, videos, walkthroughs for newer users.
- **Advanced content**: Deep dives on integrations, APIs, automation recipes, power-user practices.

A single user can receive multiple output types simultaneously.

---

## Activity-to-Product Mapping Reference

| Activity | Primary Product(s) | Key Integrations |
|---|---|---|
| Follow up with leads | Zoho CRM, Zoho SalesIQ | CRM + Campaigns for automated nurture sequences |
| Create quotes | Zoho CRM (Quotes module), Zoho Invoice | CRM + Books for quote-to-invoice flow |
| Close more deals | Zoho CRM, Zoho Analytics | CRM + SalesIQ for live visitor tracking and deal intelligence |
| Send invoices | Zoho Invoice, Zoho Books | Books + CRM for auto-invoicing from closed deals |
| Collect online payments | Zoho Books, Zoho Invoice, Zoho Checkout | Books + Checkout for payment links in invoices |
| Do your accounting | Zoho Books, Zoho Expense | Books + Expense for automated receipt-to-ledger flow |
| Support customers (help desk) | Zoho Desk | Desk + CRM for full customer context on tickets |
| Sign and send documents (e-signature) | Zoho Sign | Sign + CRM for sending contracts from deal records |
| Manage customer projects and services | Zoho Projects, Zoho CRM | Projects + CRM for project creation from won deals |
| Manage internal projects | Zoho Projects, Zoho Sprints | Projects + Cliq for team updates and notifications |
| Email marketing | Zoho Campaigns, Zoho Marketing Automation | Campaigns + CRM for segmented, behavior-based emails |
| Social media marketing | Zoho Social | Social + CRM for lead capture from social engagement |
| Build reports and dashboards | Zoho Analytics | Analytics + CRM/Books/Desk for cross-functional reporting |
| Improve team collaboration | Zoho Cliq, Zoho WorkDrive, Zoho Meeting | Cliq + Projects for task-linked conversations |

---

## Phased Rollout

- **V1 — Rules + Structured Mappings**: Structured questions, signal scoring, solution pattern matching, app bundle output, explanation templates. Core proof of concept.
- **V2 — Retrieval-Enhanced Recommendations**: Add case studies by industry, real customer examples, implementation playbooks, common app combinations by segment.
- **V3 — ML-Assisted Ranking**: Train a ranking model on historical data to reorder solution patterns based on firmographics, pain points, existing stack, and activation outcomes. Rules engine stays for guardrails. Requires clean outcome data first.

---

## Implementation Steps (Current Phase)

1. Procure Catalyst account and set up project environment.
2. Finalize technical architecture — data model, function structure, hosting, integration points. Document in a detailed technical spec.
3. Build the knowledge model — question set, answer-to-signal mappings, solution patterns, app bundle associations, exclusion rules, explanation templates. Review with product and sales stakeholders before coding.
4. Get API key for AI parsing — prompt structure, expected JSON output schema, fallback handling for low-confidence results.
5. Build the app in Catalyst — frontend wizard flow, backend scoring logic, serverless functions, data store, AI parsing integration.
6. Test thoroughly — recommendation accuracy across user types, journey stages, edge cases. Signal weighting, exclusion logic, confidence thresholds, data capture validation.

---

## KPIs (Directional — to be refined in technical spec phase)

- **Wizard engagement**: Completion rate, drop-off by stage, post-recommendation actions (trial start, app open, content click-through).
- **Time to minimum value**: How quickly wizard users get core business functions running vs. non-wizard users.
- **Retention impact**: Whether wizard users retain longer. Requires purchase/cancellation data from Store (dependency to scope early).

---

## Known Risks

- **Product team overlap**: Position as a cross-product layer that feeds into existing onboarding, not a replacement. Get alignment early.
- **Stale mappings**: Activity-to-product logic degrades if not maintained with product release cycles. Needs a defined owner and maintenance cadence.
- **Bad recommendations erode trust**: Start narrow, expand. Test rigorously. Provide a visible way for users to flag poor recommendations.
- **Scope creep**: Product teams are a resource, not co-owners. Keep scope tight to stay shippable.
- **Data privacy**: Clear data handling policies, transparent opt-in, regulatory compliance. Users must know what's collected and why.
- **Discoverability**: Distribution strategy (website, in-product, onboarding emails, sales enablement) must be planned from day one.

---

## Rules for This Codebase

- **Default to the spec**: This document is the source of truth. If asked for something that contradicts it, flag it and ask whether the deviation is intentional.
- **Think in layers**: Recommendations must flow through the four-layer model (Input → Signals → Patterns → Bundles). Don't shortcut to product picks.
- **Respect the AI boundary**: AI is a parsing layer only. Recommendation logic stays rule-based and explainable. AI tags free-text — it doesn't decide what to recommend.
- **Be specific about Zoho products**: Use correct product names. Know which products integrate with which. Reference the activity-to-product mapping when relevant.
- **Stay phase-aware**: We're building V1 first (rules + structured mappings). Don't introduce V2/V3 complexity unless asked.
- **Flag gaps**: If something in the spec is underspecified or ambiguous, say so directly instead of guessing.
- **Keep it buildable**: Zoho Catalyst is the target platform. Serverless functions, web client hosting, data store, and AI services are the building blocks. Keep recommendations grounded in what Catalyst can actually do.
- **Never put bundle logic in if/else chains.** All bundle changes go in data definitions.
- **Never hardcode API keys.** Use Catalyst Environment Variables: `LLM_API_KEY`, `LLM_API_URL`.
- **Always log sessions to Data Store.** Every recommendation must be logged — this data is used to tune weights over time.
- **LLM is optional.** The scoring engine works without AI. Free-text fields degrade gracefully if the LLM call fails.
- **Use weighted scoring.** The weighted signal system is the long-term approach — not a placeholder.

---

## Local Development

```bash
catalyst serve    # runs frontend + backend locally at localhost:3000
catalyst deploy   # deploy to development environment
```

Promote to production via the Catalyst console.
