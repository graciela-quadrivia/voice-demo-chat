# Voice Demo — Chat-mode prototype

Static HTML/CSS reference for the public voice demo at quadrivia.ai, expressed
as a Studio/Qu Manager-style chat conversation. Covers every state from the
current source state machine plus key accessibility and contrast improvements
baked in from the start.

**Live**: https://graciela-quadrivia.github.io/voice-demo-chat/

## What's in here

33 state pages + 1 index, organised in five sections:

| Section | States |
|---|---|
| **Discovery** | Loading, Welcome, Picker popover, No agents, Agent fetch error |
| **Variables** | Forms for the 4 agents (empty + filled), optional-fields variant, submit-blocked, submitting |
| **Live call** | Connecting, Listening, Speaking, Hanging up, 5 ended-call variants |
| **Failure modes** | Call error, Mic blocked, Connection lost, At capacity, Unavailable |
| **Layout demos** | Token streaming, Long-thread + virtualization-ready |

Plus an avatar-states reference page.

## Navigating

- **`index.html`** — every state grouped by section, descriptive cards
- **Floating proto-stepper** (top-right pill on every page) — prev / next nav,
  searchable state dropdown, keyboard shortcuts
  - `← / →` step through the sequence
  - `I` jump to index
  - `Esc` close the dropdown
  - Type in the dropdown's search box to filter states by name

## Folder layout

```
.
├── *.html              # 34 state pages
├── styles/             # 10 modular CSS files
├── proto-stepper.js    # state catalog + interactive nav
├── quadrivia-logo.png
├── README.md           # this file
└── LICENSE
```

## CSS architecture (`styles/`)

ITCSS-lite, one file per future React component:

1. `tokens.css` — design tokens (the only `:root` declarations). Three tiers:
   primitives → derived → semantic. Light theme default + `[data-theme="dark"]`
   override block.
2. `base.css` — reset, html/body, font imports, `prefers-reduced-motion` guard.
3. `layout.css` — site nav, site footer, chat shell (`.chat-page`,
   `.chat-main`, `.chat-thread` — declared as a `@container thread`).
4. `chat-message.css`, `chat-panel.css`, `chat-form.css`, `chat-call.css`,
   `chat-callout.css`, `chat-input.css` — one component per file.
5. `prototype.css` — demo-only chrome (proto-stepper, index grid, sr-only).
6. `index.css` — `@import` orchestrator. The only stylesheet HTML links to.

## Naming conventions (BEM-lite)

- Block: `.chat-message`
- Element: `.chat-message__body` (double underscore)
- Modifier: `.chat-message--user` (double dash)
- Interactive state — prefer ARIA: `[aria-expanded="true"]`,
  `[aria-invalid="true"]`, `[aria-busy="true"]`
- Non-ARIA runtime state — `data-state`: `[data-state="speaking"]`,
  `[data-state="ended"]`

## Token reference

| Group | Tokens |
|---|---|
| Surfaces | `--color-bg-canvas`, `--color-bg-surface`, `--mkt-grey-50` |
| Foreground | `--color-fg-default`, `-muted`, `-subtle`, `-faint`, `-placeholder`, `-emphasis`, `-strong` |
| Borders | `--color-border-subtle/base/strong/emphasis` |
| Overlays | `--color-overlay-faint/subtle/strong` |
| Shadows | `--color-shadow-tiny/subtle/base/elevated` |
| Brand | `--color-brand-teal/yellow/pink`, `--color-brand-teal-tint`, `--color-brand-teal-tint-fg`, `--color-focus-ring` |
| Status | `--color-status-info/warning/danger/success` |
| Typography | `--text-micro` (11) → `--text-display` (28) |
| Radius | `--radius-xs/sm/md/lg/xl/2xl/pill/circle` |
| Z-index | `--z-base/sticky/overlay/popover/modal/toast/dev` |
| Duration | `--duration-instant/fast/base/slow` |
| Spacing | `--gutter-x`, `--space-y-band`, `--space-y-section` (fluid via `clamp`) |

## Responsive

- Phone: < 640px
- Tablet+: ≥ 640px
- Desktop+: ≥ 1024px
- Chat content uses `@container thread (min-width: 580px)` — responds to its
  container, not the viewport (works in sidebars and embeds).
- Site nav/footer use viewport queries — they fill the page, so that's correct.

## Accessibility

- Chat thread is wired as `role="log" aria-live="polite" aria-relevant="additions"`
  so new messages announce to screen readers.
- Status-icon foregrounds meet WCAG AA contrast (≥4.5:1) in both light and
  dark themes.
- Focus ring uses brand teal at 15% alpha (light) / brighter teal at 35% alpha
  (dark) — visible against both surfaces.
- All looping animations stop under `prefers-reduced-motion: reduce`.
- Form fields carry `aria-required`, `aria-invalid`, `aria-describedby` for
  error messages.
- Picker chip uses `aria-haspopup="listbox"` + `aria-expanded`.

## State catalog (registry)

The authoritative state list lives at the top of `proto-stepper.js` in the
`STATES` array. Each row:

```js
{ f: 'file.html', sec: 'Section', step: '01', name: 'Short name' }
```

Adding a new state:
1. Create the HTML file.
2. Add a row to `STATES`.
3. Add a card to `index.html`.

The proto-stepper bar, dropdown, and keyboard nav pick up the new state
automatically. Mark `aux: true` to keep a page out of the prev/next sequence
(used for demos and reference pages).

## Future React-port contracts

Declared in CSS comments next to the relevant rules:

- `<ChatMessage variant="ai" streaming={isStreaming}>` — sets `data-streaming`
  on the message while AI tokens arrive; CSS shows the blinking cursor.
- `<ChatThread virtualized height={…}>` — sets `data-virtualized` on the
  thread; CSS turns it into an internal scroll container with `contain: layout`.
- `<CallCard>` slot architecture: `__header` / `__visual` / `__controls` /
  `__footer` — additive, current direct-child markup still works for the
  states this prototype covers.

## Dark mode

Wired but inactive by default. To preview on any page, add `data-theme="dark"`
to the `<html>` tag:

```html
<html lang="en" data-theme="dark">
```

Token values in the dark block are functional defaults, not yet design-tuned.
Tune in the `[data-theme="dark"]` block at the end of `styles/tokens.css`.

## Deploying

This repository deploys to GitHub Pages from `main` branch, root path:

- Source: `Settings → Pages → Source: main / (root)`
- URL: https://graciela-quadrivia.github.io/voice-demo-chat/

No build step. Edit, commit, push — Pages picks up changes within a minute.

## License

MIT. See `LICENSE`.
