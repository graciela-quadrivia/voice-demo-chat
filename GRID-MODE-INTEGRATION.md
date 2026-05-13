# Grid-mode integration — design system audit + plan

**Date:** 2026-05-12
**Inputs:** `voice-demo-chat-prototype/styles/` (canonical chat-mode CSS, this repo) vs `frontend/src/pages/voice-assistant/styles/` (iteration on `main`, just pulled)
**Status:** repo is on latest `main` (`75cbf2fb`). `voice-demo` was renamed to `voice-assistant` on `main`; only an empty `voice-demo/.DS_Store` residue remains — flagged at the bottom for cleanup.

---

## TL;DR

The voice-assistant copy added one substantively new file — **`grid.css`** — and made nine of the ten shared files diverge from the prototype in two predictable ways (selector scoping under `.voice-demo-root`, and comment/whitespace formatting). The substantive new design language in `grid.css` is **grid mode**: a marketing-page layout for the agent picker / variables / call surface that runs alongside the prototype's **chat mode** (everything we've built in the prototype so far). They are *the same state machine* with *two visual treatments*. To keep one canonical CSS source, grid mode should be folded back into the prototype as a parallel demo lane.

## What landed in `grid.css`

Eight design patterns, each new vs. chat mode:

| # | Pattern | Class(es) | Replaces / extends |
|---|---------|-----------|--------------------|
| 1 | **Marketing page shell** | `.grid-page` / `.grid-main` / `.grid-content` | Chat mode's `.chat-page` + `.chat-thread`; no message stream, centred 768px column under the q-nav |
| 2 | **Static 1–4-agent grid** | `.grid-action-grid` | `auto-fit minmax(min(100%,260px), 1fr)` — no container queries, no peek/scroll |
| 3 | **2-row snap-scroll carousel for 5+ agents** | `.grid-action-strip` / `…-wrap` / `…-dots` / `…-dot` | Vertical-pair columns, native `scroll-snap-type: x mandatory`, right-edge fade mask, dot pagination with active-dot pill |
| 4 | **Horizontal brand-card** | `.grid-action-card` + `__body` / `__name` / `__hint` / `__chevron` | Chat mode's vertical icon-on-top card. 2px brand-teal border (no per-card colour cycling), 40px teal chevron circle that slides on hover, lift + glow shadow |
| 5 | **Marketing title block** | `.grid-title-block` / `.grid-title` / `.grid-subtitle` | Jost display, `clamp(2.25rem, 5vw, 3.5rem)`, `text-wrap: pretty` |
| 6 | **State-machine swap-area** | `.grid-swap-frame` / `.grid-swap-area` | `min-height: clamp(280px, 32vh, 360px)` floor so picker ↔ form crossfades don't shift the chrome below. Pairs with Framer Motion's `AnimatePresence popLayout` |
| 7 | **Brand-coloured 2px dividers** | `.grid-divider`, `--teal`, `--pink` | New decorative element between marketing sections |
| 8 | **Variables form re-skin** + back button | `.grid-form-panel` / `.grid-form-heading` / `.grid-form-title` / `.grid-form-subtitle` / `.grid-back-button` | Same 2px teal-bordered brand-card language as the action card. Back button is a mirror of the action-card chevron (40px teal circle, arrow slides on hover) — gives `.chat-form` a back affordance it never had |

Plus targeted **overrides on `.chat-call-card`** when nested under `.voice-demo-root` (lifts the typography, drops the 1px border, makes the orb the sole visual anchor for the active-call state).

## Deviations from the canonical prototype CSS

Three categories.

### 1. Mechanical / harmless

- Every selector in voice-assistant is scoped under `.voice-demo-root` so the styles can't leak into the admin app. The prototype is a static HTML demo with no host app to leak into, so its selectors are bare. **Not a design deviation — a deployment-target adaptation.**
- Voice-assistant strips the prototype's "Future React mapping" header comments and the verbose architecture annotations. **Not a design deviation — comment density.**
- Voice-assistant uses Prettier's multi-line formatting for long property values; prototype keeps single-line. **Not a design deviation — code style.**

### 2. Substantive but small (need backporting)

- **`tokens.css` adds ~8 tokens** for grid mode: `--color-bg-canvas`, `--color-fg-on-brand`, `--color-border-emphasis`, `--color-focus-ring`, `--color-shadow-tiny`, `--radius-2xl`, `--space-y-band`, `--gutter-x`. The prototype's tokens.css doesn't have these — bringing grid mode into the prototype means absorbing them.
- **`layout.css` gains ~44 lines** including new chrome rules (44px touch targets, 4-col `grid-template-columns: 4fr 8fr` etc.) supporting the marketing-page layout.
- **`chat-callout.css` adds variants** (`--color-brand-yellow` background, status-info/danger backgrounds) — small theme expansion.
- **`base.css` moved web-font `<link>` to `index.html`** for parallel fetch on a public page. Pure perf win, no visual change. The prototype's `@import` chain is acceptable for a demo but should be noted as a production divergence.

### 3. Genuine design-language divergence (the interesting one)

The **action card** is the clearest fork in the road. Same state in the state machine (the agent picker), two distinct visual treatments:

| | Chat mode (prototype) | Grid mode (voice-assistant) |
|---|---|---|
| Card layout | Vertical: icon-top-centre / title / hint | Horizontal: body-left / chevron-right |
| Border | 1px `--color-border-base` → teal on hover | 2px `--color-brand-teal` always |
| Text align | Centre | Left |
| Hover | Border colour, small shadow, -1px lift | -2px lift, teal-tinted fill, large teal glow, chevron slide |
| Variant flavours | `--refined` (Option A), `--with-description` (Option B) | None — single visual style, content adapts |
| Per-agent count layout | `:has()` + `@container thread` (1/2/3-col responsive) | `auto-fit` minmax (static), or 2-row snap-carousel at 5+ |
| Long-name handling | `text-wrap: balance` on `.chat-action-card__title` (Option A) | `overflow-wrap: anywhere` on `.grid-action-card__name`; the chevron is fixed-width so the body has full breathing room |
| Brand pop | Subtle — relies on hover to introduce colour | Confident — colour is present at rest, hover amplifies |

**These are not interchangeable.** Chat mode is meant to coexist with a chat thread; restraint is the point. Grid mode is the entire page; the card is allowed to dominate. Both are valid.

The same divergence applies to the **variables form** (`.chat-form` inside `.chat-panel` vs. `.grid-form-panel` with the 2px teal border) and to the **page heading typography** (Inter h1 vs Jost display).

---

## For business — validating the conversational reframing

The conversational refactor that landed earlier today (universal P1+P2 intro, bare forms, no panel chrome) was authored against chat mode. The state machine underneath both modes is identical:

```
welcome  →  agent picked  →  variables  →  call connecting  →  call ended
            (or error)        (or error)    (or unreachable)
```

Grid mode reframes the *visual chrome* around each state but doesn't change the states themselves. **The conversational design choices still apply** — they're just delivered differently:

- The chat-mode P1 ("Hi, I'm Q. I can show you…") becomes the grid-mode **page subtitle**.
- The chat-mode P2 directive ("Which one would you like to try?") becomes the grid-mode **page title-block prompt**, or disappears entirely because the grid of cards is the implicit prompt.
- The chat-mode bare form becomes the grid-mode **`.grid-form-panel`** — same fields, same labels, same Start CTA, framed in a 2px-teal card with a back button.
- The chat-mode "Acme Hospital" attribution is a candidate for either the page title block or the marketing tagline at the bottom of the grid-mode page.

The business validation question is therefore: **do the conversational copy choices land equally well when presented in a marketing-page voice vs. a chat-thread voice?** Booking that comparison side-by-side in the prototype (chat mode and grid mode for the same state) is the point of the integration plan below.

## For front-end engineers — CSS reference for the production rebuild

The canonical source for both modes lives in this repo's `styles/` folder. Today it covers chat mode only. The integration plan adds `grid.css` here, absorbs the new tokens, and keeps voice-assistant in sync by **always porting in this direction**: prototype → voice-assistant. The voice-assistant directory becomes a transformed copy (selector scoping + production perf tweaks); the prototype stays the design-system source of truth.

Concrete checklist when reviewing voice-assistant CSS PRs:

- New rule? Must have a prototype counterpart, or a tracked exception (e.g. font-loading lives in `index.html` for perf — non-portable).
- New token? Must be added to the prototype's `tokens.css` in the same PR.
- New layout / component? Either it belongs to grid mode (`grid.css`) and the prototype gets a grid-mode demo page exercising it, or it belongs to chat mode (an existing component file) and a chat-mode demo page is added/updated.

The 1:1 file-to-component mapping documented in `index.css` ("MIGRATION NOTE — pull each file into its component module") still holds; `grid.css` slots in as the styles for `PublicAgentPicker` + `PublicVariablesPanel`'s grid-mode rendering.

## For sales / demo

Grid mode is the more **brochure-like** look — larger display type, brand cards with confident colour at rest, marketing taglines top and bottom, no chat avatar. Chat mode is the more **product-like** look — feels like a working AI assistant, embedded inside what could be a real product surface. Sales gets both to show, and can pick which lands better per audience:

- **Health-system execs / marketing decision-makers** → grid mode reads as a polished product page.
- **Clinical-ops / product owners doing technical evaluation** → chat mode shows the real interaction model their patients would experience.

The prototype's index page will gain a "Grid mode" section so a single URL can demo either flow.

## For future agentic systems

`proto-stepper.js`'s `STATES` array is the catalog schema. Each state is `{ f, sec, step, name }` — file path, section, step ID, human name. Today the prototype has four sections: Discovery, Variables, Live call, Failure modes. Adding a **Grid mode** section (or two — *Grid mode — Discovery*, *Grid mode — Variables*, etc.) extends this schema cleanly.

Once grid-mode pages are catalogued, agentic systems can:

- Read `STATES` to enumerate every demo variant currently available.
- Generate new pages by appending to `STATES` and writing the corresponding HTML — the proto-stepper navigator on every page reads from `STATES`, so a new entry instantly gets prev/next + dropdown wiring.
- Cross-reference chat-mode and grid-mode renderings of the same state to evaluate visual/copy variations programmatically.

The catalog is the contract.

---

## Integration plan

### Phase 1 — Canonical CSS absorption (lossless)

1. **Add `prototype/styles/grid.css`** — copy from voice-assistant, drop the `.voice-demo-root` prefix on every selector (the prototype has no host app to leak into; bare selectors stay consistent with the rest of the prototype).
2. **Backport the ~8 new tokens** into `prototype/styles/tokens.css`:
   - `--color-bg-canvas`, `--color-fg-on-brand`, `--color-border-emphasis`, `--color-focus-ring`, `--color-shadow-tiny`, `--radius-2xl`, `--space-y-band`, `--gutter-x`.
3. **Backport the small `chat-callout.css` and `layout.css` additions** that grid mode needs (callout colour variants, marketing-page layout rules).
4. **Update `prototype/styles/index.css`** to `@import url("./grid.css");` after the existing component imports.

After phase 1, the prototype has the complete styling vocabulary for both chat mode and grid mode without yet using grid mode anywhere.

### Phase 2 — Grid-mode demo pages

Mirror the state machine in grid mode. Suggested page set (prefixed `g-` so they sort together and read unambiguously next to the existing `02*`/`05*`/etc.):

| File | State | Class structure |
|------|-------|-----------------|
| `g-01-welcome.html` | Picker — 1–4 agents (static grid) | `.grid-page > .grid-main > .grid-content > .grid-title-block + .grid-action-grid + .grid-tagline-block` |
| `g-02-welcome-many.html` | Picker — 5+ agents (snap carousel) | `.grid-action-strip-wrap > .grid-action-strip + .grid-action-strip-dots` |
| `g-03-variables-just-name.html` | Variables — 1 field | `.grid-form-panel` with single name field, `.grid-back-button` |
| `g-04-variables-multi.html` | Variables — 3–5 fields | Same panel, dense field set |
| `g-05-call-active.html` | Call — listening/speaking | `.chat-call-card` under `.grid-swap-area` |
| `g-06-call-ended.html` | Call — outcome | `.chat-call-card` ended variant |
| `g-07-error.html` | Failure mode | Pick one: at-capacity / unavailable in grid frame |

Each page reuses the canonical CSS — no per-page styles. Copy should follow the conversational reframing we did this morning (universal Q-intro line, bare forms), translated to grid-mode's typographic voice (Q-intro as page subtitle, bare form inside `.grid-form-panel`).

### Phase 3 — Catalog + landing

5. **Add a `Grid mode` section to `proto-stepper.js`** with the `g-*` entries from phase 2.
6. **Add a `Grid mode` card grid to `index.html`** so the landing page shows both lanes side by side (a clear "Chat mode demos / Grid mode demos" split).

### Phase 4 — Sync discipline

7. **Establish the one-way port rule** (prototype is source of truth, voice-assistant pulls in scoped form). Document this at the top of `voice-assistant/styles/index.css`.
8. **Delete the stale `frontend/src/pages/voice-demo/.DS_Store` residue** (the folder is empty otherwise; `voice-assistant/` is the canonical post-rename location). Worth a tiny PR.

### Phase 5 — Cross-mode design questions worth answering

Items the integration surfaces that aren't decisions for this plan but should be tracked:

- **Should chat mode adopt the back-button affordance?** Grid mode introduces an explicit back button (40px teal circle). Chat mode currently has no back button — relies on the chat thread's "Change agent" chip in the input bar. Worth comparing.
- **Should chat-mode cards inherit grid mode's confident-at-rest teal border?** Currently chat-mode cards are subtle (1px neutral border, teal only on hover). Grid mode's 2px-teal-always feels more on-brand. Could be unified — or kept different intentionally to signal "thread embedded vs. own-page".
- **Single `index.css` for both modes, or split entries?** Either one file imports both chat + grid, or two entry files load the relevant subset. Recommend single file for now (simpler), revisit if bundle size matters for the React port.
- **`.voice-demo-root` scoping for the canonical or downstream?** Today the prototype is bare and voice-assistant adds scoping. Could be flipped (scope in the canonical, apply globally) but that constrains the prototype unnecessarily.

---

## Open items + cleanup

- **Stale `frontend/src/pages/voice-demo/.DS_Store`** — empty folder residue after the `voice-demo → voice-assistant` rename on `main`. Safe to delete in a quick PR.
- **`.chat-panel` / `.chat-panel-title` CSS** in the prototype is now fully unused after this morning's bare-form refactor. Still flagged for removal from the previous decisions doc — phase 1 of this plan is a natural moment to do it.
- **Acme Pharmacy** copy in `05b-prescription.html` — still pending the keep-or-normalise call from the previous decisions doc.

*Index of every state — chat mode today, grid mode after phase 2 — lives at the prototype root [index.html](https://graciela-quadrivia.github.io/voice-demo-chat/) and feeds the proto-stepper navigator. The catalog is the contract.*
