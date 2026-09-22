# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

NorthKey AI — a static marketing website for a concept-stage US AI consulting firm. No build step,
no package manager, no dependencies: 22 hand-authored `.html` pages at the repo root plus five
shared files in `assets/` (three of them code). Deployed via GitHub Pages from `master`
(`origin` = `github.com/sriramshravanthi/STS`), so **an edit is invisible on the live site until it
is committed, pushed, and hard-refreshed**.

Every company-specific fact is a bracketed placeholder (`[DOMAIN]`, `[COMPANY NAME]`,
`[BUSINESS EMAIL]`, `[PHONE]`, `[BUSINESS ADDRESS]`, `[FOUNDER NAME]`,
`[STATE OF INCORPORATION]`). These stay literal in the repo on purpose — `assets/boot.js` resolves
`[DOMAIN]` at runtime and deletes any JSON-LD node still holding a placeholder, so canonical, og:url,
og:image and the schema graph stay valid in production without inventing facts. It resolves against
the **directory the page is served from**, not `location.origin`: Pages serves this repo from
`/STS/`, and resolving against the origin pointed every canonical at the account root instead
(`2061e4b`). **`sitemap.xml` and `robots.txt` are the exception** — no script reaches a static file,
so their `[DOMAIN]` does not self-resolve and the sitemap is invalid to crawlers until the domain is
decided and substituted.

Placeholders shown in copy are wrapped in `<span class="ph">`. Do not invent a value to fill one.

## Working on it

Nothing to build or install. Open a file directly, or serve the folder:

```bash
python -m http.server 8000      # then http://localhost:8000
```

**Verification: use jsdom, not a browser.** The Chrome extension does not connect in this
environment. Install jsdom *outside the repo* — the repo must stay dependency-free, so never create
`package.json` or `node_modules` here — and drive the pages headlessly from the scratchpad:

```bash
cd "$SCRATCHPAD" && npm i jsdom
node check.js "C:/Users/home/WORK/STS" [page.html]
```

`check.js` is **not committed** — the repo is dependency-free and stays that way, so write it into
the scratchpad each session.

The check that matters: load a page with `runScripts:'dangerously'`, `eval` the contents of
`assets/boot.js` and `assets/site.js` into the window, dispatch `DOMContentLoaded`, then assert on
uncaught JS errors, dead `.html` hrefs, and the elements a feature expects. This is the only
reliable way to catch the failure mode below.

## Architecture

### Every page carries its own copy of the chrome

`assets/site.css` and `assets/site.js` are shared, but the **header, mega menu, mobile drawer and
footer markup are duplicated verbatim into all 22 pages**. The mega nav is a single ~40KB minified
line — line 45 on subpages, line 91 on `index.html`. The copies are byte-identical except for the
active-page markers: `class="mega-t is-on"` on the owning top-level item, `aria-current="page"` on
the matching deep links.

A nav or footer change therefore means editing all 22 files. Script it (`sed`/`python` over
`*.html`), then re-derive the `is-on` / `aria-current` markers per page. Do not hand-edit one page
and assume the rest followed.

`index.html` is `<body class="is-home">`; every other page is `<body class="is-sub">` and uses the
page shell — `.phead` (breadcrumb, h1, lede), sections, `.rel` (related cards), `.pcta` (inverse
ground CTA). `body:not(.is-home) .sec-num{display:none}`: the running section numbers, assigned by
`site.js`, are a homepage device only.

### `assets/site.js` is one IIFE shared by all pages

~1200 lines, a single `(function(){...})()`, loaded `defer` everywhere. It holds every interactive
feature: theme toggle, mobile nav, `.rv` reveal observer, academy tabs, sample assessment quiz, AI
Advisor, solve form, career ladder, auto section numbering, maturity assessment, industries,
audience switcher, AI Briefing, job classifieds, mega menu.

**The critical constraint:** there is no per-page routing and no try/catch around the body. A
feature block that dereferences an element absent from the current page throws and **silently kills
every feature defined below it, on every page**. That has already been fixed twice (`9b05a08`,
`d12e911`). So:

- Guard every entry point: `var x=$('#id'); if(x) x.addEventListener(...)`.
- After touching `site.js`, run the jsdom check across *all* pages, not just the one you changed.

**There is a second, separate top-level IIFE at the end of the file** — the reading furniture
(progress hairline, back-to-top, section permalinks). It is deliberately *outside* the main one:
because of the constraint above, a block added inside the main IIFE can kill every feature below
it, while one out here can neither be killed by the code above nor kill it. New self-contained
features that need nothing from the main IIFE's scope belong in their own top-level IIFE for the
same reason. Guard the entry points anyway.

### `assets/site.css` is append-only layers

~1210 lines in deliberate order; **later blocks intentionally override earlier ones**, so position
in the file is load-bearing. Top to bottom: design tokens → base components → "v2 components added
after competitor research" → **VIBRANT PALETTE** (`--h1`..`--h6` plus `--accent`/`--accent-2`,
restated across all four theme selectors) → **VIBRANT LAYER** (cycles the six hues across component
families with `:nth-child(6n+k)`, pure CSS, no markup hooks) → mega menu → page shell → homepage
hero and orbit diagram → **LEDGER LAYER** (per-page restyles for `index.html` services and
`method.html` phases) → **REFINEMENT LAYER** (currently last: the AA-corrected `--ink-3` restated
across all four theme selectors, optical sizing and tabular figures, styles for the reading
furniture, and the print stylesheet). The refinement layer is self-contained — deleting the block
returns the site to its previous appearance exactly.

Add new rules as a new labelled block at the end rather than editing an early one, unless you have
checked what the later layers do with the same selector.

### Theming

Three states, and every colour must be defined for all of them or the toggle breaks in one
direction:

- `:root` — light palette (the baseline)
- `@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]) }` — system dark
- `:root[data-theme="dark"]` — explicit choice, persisted to `localStorage['nk-theme']`

`assets/boot.js` is a small blocking script in `<head>` that applies the stored theme before paint.
It must stay synchronous and fast.

### Runtime-capability features (AI Briefing, job classifieds)

Two features degrade through tiers rather than showing filler. Both are written to work as a plain
static page *and* as a published Claude Artifact (`window.claude.use('db')` / `use('sample')`):

- **AI Briefing** (`#briefing`, homepage + themes): endpoint (`window.NORTHKEY_NEWS_ENDPOINT`) →
  artifact `db` document `briefing/current` (one generation per day, shared by all visitors) →
  `#briefSeed` JSON block published in the HTML → an honest empty state.
- **Job classifieds** (`#classifieds`, `ai-careers.html`): artifact `db` collection `listings`
  (shared, live) → `localStorage['nk-classifieds']` (this browser only, labelled as such) →
  `#jobsSeed` JSON block → generated *role patterns*, always labelled as patterns and never
  presented as open positions.

The honest-empty-state and never-fabricate behaviour is the point of these features, not an
oversight — keep it. The generation prompt carries an explicit no-invented-news and
banned-buzzword rule (`SAMPLE_PROMPT_RULES`).

### Directories

- `assets/` — the only shared code: `site.css`, `site.js`, `boot.js`, `favicon.svg`, `og.svg`.
- `layouts/themes/theme-N-*.html` — **current** theme explorations. Each is the real homepage
  linking `../../assets/site.css` and `site.js`, with one `<style>` block overriding tokens, type
  stack and layout, and all links pointing back into the real site. Behaviour comes from the real
  assets, so these are the live site restyled. `layouts/themes/index.html` compares them side by
  side. **They carry their own copy of the homepage markup**, so homepage *content* changes —
  briefing items, classifieds, audience tabs, mega-nav links — have to be replicated into all five
  or the themes quietly fall out of date (`3db01ca`, `6ca6d02`). Each should still hold 7 mega
  panels and link `../../assets/site.css` and `site.js`. `layouts/themes/index.html` describes the
  themes in prose; if a theme changes, that description has to change with it.
- `layouts/layout-N-*.html` and `archive/index-N.html` — **historical** self-contained snapshots
  (~230KB each, all CSS/JS inlined, no link to `assets/`). They do not track the live site; don't
  propagate edits into them.
- `sitemap.xml` and `robots.txt` are hand-maintained — a new page needs its own `<url>` entry.
- `llms.txt` — the first-party summary AI assistants parse when they cite the firm. Hand-maintained
  alongside the sitemap; a new page that matters to a buyer belongs in it. Its links are relative
  on purpose, because the domain is not decided. It restates the editorial rules below so a model
  summarising the site carries the qualifications instead of flattening a concept build into an
  operating consultancy.

## Content source of truth

- `AI Consulting Company Website Master Prompt.txt` — the originating spec, stored verbatim, plus a
  build record of decisions and open items. Authoritative for scope and structure.
- `COMPANY-CONCEPT-AND-STRATEGY.md` — positioning, service definitions, the eight-phase method,
  revenue model, industries. Page copy derives from this.
- `COMPETITOR-RESEARCH.md` — positioning analysis only; no competitor copy, design or code was
  taken. Keep it that way.
- `DECISIONS.md` — the reasoning behind the conventions in this file: why there is no build
  step, why placeholders stay literal, why the degrade-to-empty features are the way they are, and
  what is still open. Consult it before overturning a constraint stated here.
- `README.md` — the human-facing counterpart to this file: same conventions, aimed at someone
  landing on the repo. It overlaps this file deliberately, so a change to the architecture or the
  editorial rules belongs in both.

## Commits

The log is written for a reader who was not here: an imperative subject line, then a body that says
what was wrong and why the change is the right shape, not what the diff already shows. Substantive
commits close with a `Verified:` line naming what was actually checked and across how many files —
that line is a claim, so only write it after running the jsdom check. `master` is the deploy branch
and the remote is occasionally edited directly on GitHub, so `git fetch` and rebase before pushing
rather than assuming a fast-forward.

## Editorial rules the site enforces on itself

Stated in the footer disclosure on every page; these are constraints, not stylistic preferences:

- No real clients, employees, certifications, partnerships, awards, testimonials, revenue figures
  or office locations. Case studies are labelled illustrative patterns.
- No invented statistics. The commitments band deliberately replaces the invented-stat bar the
  competitor set uses.
- Pricing and durations are labelled indicative planning ranges, not quotes.
- The solve form is front-end only and says so on submit — it transmits nothing.
