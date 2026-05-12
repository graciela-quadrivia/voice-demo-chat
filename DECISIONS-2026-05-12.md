# Chat-mode prototype — session decisions

**Date:** 2026-05-12
**Prototype:** https://graciela-quadrivia.github.io/voice-demo-chat/
**Source:** https://github.com/graciela-quadrivia/voice-demo-chat

## TL;DR

Two parallel refactors landed across **24 prototype pages**, locking in a single conversational pattern from first welcome through form submission. We stripped agent-picker panel chrome, stripped form-panel chrome, normalised every welcome line, and introduced one new canonical state (`05g-just-name`). The result is fewer visual containers, more conversational copy, and a flow that feels like *talking to Q* rather than *filling in a form on a website* — directly relevant to the patient population this product is built for (more on that below).

---

## For Business / Sales

- **Sales demo readiness.** Every welcome and variables state now opens with the same Q-introduction line + a clear directive. Sales can demo any starting state and the framing reads coherent. No more competing CTAs ("Pick a scenario below, or tell me what you'd like to try" — removed; that OR-clause was confusing prospects).
- **Tenant story is consistent.** "Acme Hospital" appears once in the intro and reads as the org behind every scenario. Two stale "Acme Health" references on the wellness pages were fixed. One outlier remains: `05b-prescription` still says "Acme Pharmacy" — flagged for review.
- **New "Just name (generic)" state (`05g`).** Demonstrates the *lowest-friction* version of the patient flow — one field, then the call. Useful when pitching to prospects whose populations skew older or lower-literacy; we can show this and say "this is what your patients see".
- **Demo dates locked.** Ali at Hims is **2026-05-20** (one event, not two).

## For Engineering

### Conversational pattern (universal across 02*, 05*, 06*)

```
P1:  Hi, I'm Q. I can show you what one of Acme Hospital's clinical
     voice agents sounds like — from the patient's side of the call.
P2:  Which one would you like to try? [+ state-specific hint]
```

P2 varies by backend state (uniform fields → consolidated hint; varied → per-card hint; 0 fields → "ready to go").

### Structural change

- **Welcome pages (02*)**: dropped `<div class="chat-panel">` + `<p class="chat-panel-title">` + `<p class="chat-panel-footer">` around `.chat-action-grid`. Cards now sit directly in `chat-message__body`.
- **Variables pages (05*, 06*)**: dropped the same panel wrapper around `<form class="chat-form">`. Field labels carry the meaning the panel-title used to (e.g. `"Just your first name"` panel-title + `"First name"` label was 3-way duplication with the conversational question; only the label and the question survive).
- **CSS removed:** `.chat-panel-footer`. **CSS now unused but kept:** `.chat-panel`, `.chat-panel-title` (no references in the prototype anymore; safe to remove in a follow-up).
- **Single-agent grid:** `justify-content: start` (was `center`) — aligns the card with the message column instead of floating it.
- **Count-driven layout:** CSS `:has()` + container queries (`@container thread`) drive 1/2/3-column variants from the agent count. No JS branching needed for the React port.

### React port mapping

Every removed wrapper is documented in `styles/chat-panel.css` and `styles/index.css` headers — the comments call out exactly how the dynamic hint logic should consume `participant_variables` (uniform → surface once in greeting; varied → keep per-card hints).

## For Marketing / Design

- **Voice and tone.** The Q-introduction line is the brand line for the prototype. Marketing copy should mirror that cadence — first-person ("I can show you…"), patient-side framing ("from the patient's side of the call"), no jargon.
- **No "panel" headings.** Section titles like "Patient details", "Verify identity", "Prescription details", "Just your name" are gone. The conversational question above the form is the heading — write those tightly.
- **One canonical intro across every state.** Any future state-specific page (e.g. errors, success, edge cases) should open with the same Q-intro. Drift here will undo the coherence we just built.
- **"Just name (generic)" is the new low-friction reference.** Use this card when describing the demo to prospects whose patient populations include older, low-vision, or low-literacy users.

## Accessibility & patient-health impact

Healthcare voice agents talk to a population that skews older, sicker, and more cognitively loaded than typical consumer software. Accessibility here isn't a compliance line item — it's a clinical-safety lever. The directional improvements from this session, and the gaps that remain:

### Improvements this session

- **Reduced cognitive load.** Removing duplicated framing (panel-title + label + conversational question saying the same thing) means a patient on opioids post-op, or with mild dementia, parses one cue instead of three before answering.
- **Fewer visual containers.** Less chrome competing for attention helps users with low vision (including the diabetic retinopathy and macular degeneration common in the very populations these agents call about) focus on the input.
- **One consistent voice.** Patients with anxiety or fatigue do not have spare bandwidth to reconcile inconsistent tones between welcome and form steps. Same intro every time = predictable mental model.
- **Required-field signalling preserved.** The `<span class="chat-field__required" aria-label="required">*</span>` pattern means screen readers still announce "required" on every mandatory field.

### Health consequences if these slip

The stakes are concrete. A patient who cannot complete the variables form does not get the call. A patient who completes it wrongly gets the wrong call:

- **Missed wellness/screening calls** → undiagnosed hypertension, missed mammograms, late-stage diagnosis.
- **Post-op follow-up missed** → infections, falls, hospital readmissions caught late.
- **Lab-result confusion** → diabetic patients with bad HbA1c readings who don't understand the form and don't manage glucose.
- **Wrong identity verification** → patient receives information meant for another patient (HIPAA exposure + clinical misinformation).

### Gaps still open

- **Colour-contrast audit not done in this session.** The teal accent + muted-foreground combinations need a WCAG-AA pass against both light and dark themes before this ships to the public demo. Anyone with a contrast checker (Stark, axe DevTools) can do this in 30 minutes — recommend booking it before launch.
- **Touch-target sizing not audited.** The action-card and form-field hit areas should be measured against the 44×44 px minimum (WCAG 2.5.5). Older patients with tremor or arthritis will silently fail to tap, then blame themselves and abandon.
- **Keyboard / screen-reader pass on the bare form.** Removing the `.chat-panel` wrapper did not change semantics (form, fieldset semantics were never attached to that div), but a VoiceOver/NVDA spot-check is worth 15 minutes of someone's time.
- **No text alternative for the audio call itself.** Deaf and hard-of-hearing patients can pick a scenario and fill a form but cannot consume the call. This is a *product* gap, not a prototype gap, but worth marking — the demo currently looks accessible up to the point the call starts.

## Open items

- Resolve **"Acme Pharmacy"** in `05b-prescription.html` line 75 — keep (pharmacy-scenario flavour) or normalise to "Acme Hospital"?
- Remove the now-unused **`.chat-panel`** and **`.chat-panel-title`** CSS rules in a follow-up.
- Backend rename initiative ("Acme Hospital Annual Wellness Visit Outreach Call" → "Wellness Visit Outreach") — Option A (refined typography, shorter names) is what every renamed-state prototype demonstrates. Awaiting backend buy-in.
- Optional Option B (cards with `description` field) demonstrated in `02h-option-b.html`; depends on backend adding a `description` to the agent schema.
- Colour-contrast and touch-target accessibility audit — schedule before public-demo launch.

---

*Index of every state, including the new `05g-just-name`, lives at the prototype root [index.html](https://graciela-quadrivia.github.io/voice-demo-chat/) and is also the source of truth for the proto-stepper navigator embedded on every page.*
