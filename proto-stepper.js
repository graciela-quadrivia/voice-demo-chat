/* =============================================================================
 * proto-stepper.js — interactive state navigator for the chat-mode prototype
 *
 * Mounts inside <aside id="proto-stepper"></aside>. Auto-detects the current
 * state from the page's URL and renders:
 *   • A pill bar (top-right, fixed): prev · [section · step · name ▾] · next
 *   • A dropdown panel (toggled): all states grouped by section, current
 *     highlighted, type-to-filter, click to jump
 *
 * Keyboard shortcuts (active globally except inside form fields):
 *   ←  / → : navigate to previous / next sequenced state
 *   I       : open the index page
 *   Esc     : close the dropdown panel
 *
 * ── Adding a new state ──────────────────────────────────────────────────
 * 1. Append a row to STATES below with `{ f, sec, step, name }`.
 * 2. Decide whether it lives in the SEQUENCE (numbered demo funnel) or as
 *    `aux: true` (dropdown-only — demos, reference pages). Sequenced states
 *    flow into prev/next; aux ones don't, but show in the panel.
 *
 * The catalog here is the single source of truth — index.html sections and
 * the per-page proto-stepper bar both read from it.
 * ========================================================================== */

(function () {
  'use strict';

  // ── Catalog ──────────────────────────────────────────────────────────────
  // Order matters: defines prev/next traversal for sequenced states.
  const STATES = [
    // 1 · Discovery
    { f: '01-loading.html',                  sec: 'Discovery',     step: '01',   name: 'Loading' },
    { f: '02-welcome.html',                  sec: 'Discovery',     step: '02',   name: 'Welcome' },
    { f: '02b-picker-popover.html',          sec: 'Discovery',     step: '02b',  name: 'Picker popover' },
    { f: '02c-welcome-1-agent.html',         sec: 'Discovery',     step: '02c',  name: 'Welcome — 1 agent' },
    { f: '02d-welcome-2-agents.html',        sec: 'Discovery',     step: '02d',  name: 'Welcome — 2 agents' },
    { f: '02e-welcome-3-agents.html',        sec: 'Discovery',     step: '02e',  name: 'Welcome — 3 agents' },
    { f: '02f-welcome-6-agents.html',        sec: 'Discovery',     step: '02f',  name: 'Welcome — 6 agents (production)' },
    { f: '02g-option-a.html',                sec: 'Discovery',     step: '02g',  name: 'Option A — refined tiles (current backend)' },
    { f: '02h-option-b.html',                sec: 'Discovery',     step: '02h',  name: 'Option B — tiles with description (proposed)' },
    { f: '02i-welcome-ready-to-call.html',   sec: 'Discovery',     step: '02i',  name: 'Welcome — all ready to call (0 fields)' },
    { f: '02j-welcome-different-fields.html',sec: 'Discovery',     step: '02j',  name: 'Welcome — different field per agent' },
    { f: '02k-welcome-multi-input.html',     sec: 'Discovery',     step: '02k',  name: 'Welcome — all need multiple details' },
    { f: '03-empty.html',                    sec: 'Discovery',     step: '03',   name: 'No agents available' },
    { f: '04-error.html',                    sec: 'Discovery',     step: '04',   name: 'Agent fetch error' },

    // 2 · Variables
    { f: '05-agent-picked.html',             sec: 'Variables',     step: '05',   name: 'Appointment — empty' },
    { f: '05-filled.html',                   sec: 'Variables',     step: '05f',  name: 'Appointment — filled' },
    { f: '05b-prescription.html',            sec: 'Variables',     step: '05b',  name: 'Prescription — empty' },
    { f: '05b-filled.html',                  sec: 'Variables',     step: '05bf', name: 'Prescription — filled' },
    { f: '05c-lab-results.html',             sec: 'Variables',     step: '05c',  name: 'Lab Results — empty' },
    { f: '05c-filled.html',                  sec: 'Variables',     step: '05cf', name: 'Lab Results — filled' },
    { f: '05d-wellness.html',                sec: 'Variables',     step: '05d',  name: 'Wellness — empty' },
    { f: '05d-filled.html',                  sec: 'Variables',     step: '05df', name: 'Wellness — filled' },
    { f: '05e-with-optional.html',           sec: 'Variables',     step: '05e',  name: 'With optional fields' },
    { f: '06-variables-errors.html',         sec: 'Variables',     step: '06',   name: 'Submit blocked' },
    { f: '06b-variables-submitting.html',    sec: 'Variables',     step: '06b',  name: 'Submitting' },

    // 3 · Live call
    { f: '07-call-connecting.html',          sec: 'Live call',     step: '07',   name: 'Connecting' },
    { f: '08-call-listening.html',           sec: 'Live call',     step: '08',   name: 'Listening' },
    { f: '09-call-speaking.html',            sec: 'Live call',     step: '09',   name: 'Speaking' },
    { f: '09d-call-ending.html',             sec: 'Live call',     step: '09d',  name: 'Hanging up' },
    { f: '10-call-ended.html',               sec: 'Live call',     step: '10',   name: 'Ended — Appointment' },
    { f: '10b-call-ended-prescription.html', sec: 'Live call',     step: '10b',  name: 'Ended — Prescription' },
    { f: '10c-call-ended-lab-results.html',  sec: 'Live call',     step: '10c',  name: 'Ended — Lab Results' },
    { f: '10d-call-ended-wellness.html',     sec: 'Live call',     step: '10d',  name: 'Ended — Wellness' },
    { f: '10e-call-ended-timeout.html',      sec: 'Live call',     step: '10e',  name: 'Demo window complete' },

    // 4 · Failure modes
    { f: '11-call-error.html',               sec: 'Failure modes', step: '11',   name: 'Call error' },
    { f: '11b-mic-denied.html',              sec: 'Failure modes', step: '11b',  name: 'Mic blocked' },
    { f: '11c-connection-lost.html',         sec: 'Failure modes', step: '11c',  name: 'Connection lost' },
    { f: '12-at-capacity.html',              sec: 'Failure modes', step: '12',   name: 'At capacity' },
    { f: '13-unavailable.html',              sec: 'Failure modes', step: '13',   name: 'Unavailable' },

    // 5 · Layout demos (aux — not in prev/next sequence)
    { f: 'demo-streaming.html',              sec: 'Layout demos',  step: 'D1',   name: 'Streaming response',           aux: true },
    { f: 'demo-long-thread.html',            sec: 'Layout demos',  step: 'D2',   name: 'Long thread + virtualization', aux: true },

    // Reference pages (aux)
    { f: 'avatar-ring-demo.html',            sec: 'Reference',     step: 'R1',   name: 'Avatar ring states',         aux: true },
  ];

  const SEQUENCE = STATES.filter(s => !s.aux);

  // ── Locate current state ─────────────────────────────────────────────────
  const ROOT = document.getElementById('proto-stepper');
  if (!ROOT) return;

  const url = location.pathname.split('/').pop() || 'index.html';
  const isIndex = url === 'index.html';
  const current = STATES.find(s => s.f === url) || null;

  const seqIdx = current && !current.aux ? SEQUENCE.indexOf(current) : -1;
  const prev = seqIdx > 0 ? SEQUENCE[seqIdx - 1] : null;
  const next = seqIdx >= 0 && seqIdx < SEQUENCE.length - 1 ? SEQUENCE[seqIdx + 1] : null;

  // ── Render — pill bar ────────────────────────────────────────────────────
  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function navHTML(target, dir) {
    if (!target) {
      return `<span class="proto-stepper-nav proto-stepper-nav--disabled" aria-hidden="true">${dir}</span>`;
    }
    return `<a class="proto-stepper-nav" href="${escape(target.f)}" aria-label="${dir === '←' ? 'Previous' : 'Next'}: ${escape(target.step)} ${escape(target.name)}">${dir}</a>`;
  }

  function labelHTML() {
    if (isIndex) {
      return `<span class="proto-stepper-section">Index</span><span class="proto-stepper-name">${SEQUENCE.length} sequenced · ${STATES.length - SEQUENCE.length} aux</span>`;
    }
    if (current) {
      return `
        <span class="proto-stepper-section">${escape(current.sec)}</span>
        <span class="proto-stepper-step">${escape(current.step)}</span>
        <span class="proto-stepper-name">${escape(current.name)}</span>
      `;
    }
    return '<span class="proto-stepper-name">Unknown state</span>';
  }

  function barHTML() {
    return `
      <div class="proto-stepper-bar">
        ${navHTML(prev, '←')}
        <button type="button" class="proto-stepper-toggle" aria-expanded="false" aria-controls="proto-stepper-panel" aria-haspopup="dialog">
          ${labelHTML()}
          <span class="proto-stepper-caret" aria-hidden="true">▾</span>
        </button>
        ${navHTML(next, '→')}
      </div>
    `;
  }

  // ── Render — dropdown panel ──────────────────────────────────────────────
  function panelHTML() {
    const sections = [...new Set(STATES.map(s => s.sec))];
    const groups = sections.map(sec => {
      const items = STATES.filter(s => s.sec === sec).map(s => {
        const active = s.f === url;
        return `
          <li>
            <a class="proto-stepper-state${active ? ' proto-stepper-state--current' : ''}"
               href="${escape(s.f)}"${active ? ' aria-current="page"' : ''}>
              <span class="proto-stepper-state-step">${escape(s.step)}</span>
              <span class="proto-stepper-state-name">${escape(s.name)}</span>
            </a>
          </li>`;
      }).join('');
      return `
        <section class="proto-stepper-group">
          <h3 class="proto-stepper-group-title">${escape(sec)}</h3>
          <ul class="proto-stepper-list">${items}</ul>
        </section>`;
    }).join('');

    const indexCurrent = isIndex ? ' proto-stepper-state--current' : '';
    return `
      <div class="proto-stepper-panel" id="proto-stepper-panel" role="dialog" aria-label="State navigator" hidden>
        <div class="proto-stepper-panel-search">
          <input type="search" class="proto-stepper-search" placeholder="Filter states… (Esc to close)" aria-label="Filter states">
        </div>
        <div class="proto-stepper-panel-body">
          <a class="proto-stepper-state proto-stepper-state--index${indexCurrent}" href="index.html"${isIndex ? ' aria-current="page"' : ''}>
            <span class="proto-stepper-state-step">·</span>
            <span class="proto-stepper-state-name">Index — all states</span>
          </a>
          ${groups}
        </div>
        <div class="proto-stepper-panel-foot">
          <span><kbd>←</kbd> <kbd>→</kbd> nav</span>
          <span><kbd>I</kbd> index</span>
          <span><kbd>Esc</kbd> close</span>
        </div>
      </div>
    `;
  }

  // ── Mount ────────────────────────────────────────────────────────────────
  ROOT.innerHTML = barHTML() + panelHTML();
  ROOT.classList.add('proto-stepper--ready');

  const toggle = ROOT.querySelector('.proto-stepper-toggle');
  const panel = ROOT.querySelector('.proto-stepper-panel');
  const search = ROOT.querySelector('.proto-stepper-search');

  // ── Open/close ───────────────────────────────────────────────────────────
  const panelBody = panel.querySelector('.proto-stepper-panel-body');

  function scrollCurrentIntoView() {
    // Scroll the panel BODY (not the page) so the active state is centred.
    // Without this, opening the dropdown on a state deep in the catalog
    // (e.g. `09d-call-ending.html`) shows the top of the list — users have
    // to re-scroll to find their place after every navigation. Setting
    // scrollTop manually guarantees only the panel scrolls; scrollIntoView
    // would also nudge the document if the browser thought it was needed.
    //
    // Relies on .proto-stepper-panel-body having `position: relative` so
    // that `here.offsetTop` is relative to the scrollable body, not the
    // absolutely-positioned panel (which would include the search bar).
    const here = panel.querySelector('.proto-stepper-state--current');
    if (!here || !panelBody) return;
    const target = here.offsetTop - (panelBody.clientHeight / 2) + (here.offsetHeight / 2);
    panelBody.scrollTop = Math.max(0, target);
  }

  function openPanel() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    // requestAnimationFrame guarantees the browser has computed layout for
    // the just-shown panel before we measure offsets. setTimeout(0) is not
    // strictly equivalent — it can fire before the next layout pass.
    requestAnimationFrame(() => {
      scrollCurrentIntoView();
      search.focus({ preventScroll: true });
    });
  }
  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    search.value = '';
    filterStates('');
    toggle.focus();
  }
  toggle.addEventListener('click', () => panel.hidden ? openPanel() : closePanel());

  // Click outside the stepper to close
  document.addEventListener('click', (e) => {
    if (!ROOT.contains(e.target) && !panel.hidden) closePanel();
  });

  // ── Type-to-filter ───────────────────────────────────────────────────────
  function filterStates(term) {
    const t = term.trim().toLowerCase();
    panel.querySelectorAll('.proto-stepper-group').forEach(group => {
      let anyVisible = false;
      group.querySelectorAll('.proto-stepper-state').forEach(item => {
        const text = item.textContent.toLowerCase();
        const visible = !t || text.includes(t);
        item.parentElement.style.display = visible ? '' : 'none';
        if (visible) anyVisible = true;
      });
      group.style.display = anyVisible ? '' : 'none';
    });
  }
  search.addEventListener('input', (e) => filterStates(e.target.value));

  // ── Global keyboard shortcuts ────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    const target = e.target;
    const inSearch = target === search;
    const inField =
      target instanceof HTMLElement &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

    if (e.key === 'Escape' && !panel.hidden) {
      e.preventDefault();
      closePanel();
      return;
    }

    // Don't hijack typing in form fields (except our own search box)
    if (inField && !inSearch) return;
    // Don't hijack with modifier keys
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === 'ArrowLeft' && prev && !inSearch) {
      e.preventDefault();
      location.href = prev.f;
    } else if (e.key === 'ArrowRight' && next && !inSearch) {
      e.preventDefault();
      location.href = next.f;
    } else if ((e.key === 'i' || e.key === 'I') && !isIndex && !inSearch) {
      e.preventDefault();
      location.href = 'index.html';
    }
  });
}());
