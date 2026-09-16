# NorthKey AI — website

Static marketing site for **NorthKey AI**, a concept-stage US AI consulting firm. Hand-authored
HTML: no build step, no package manager, no dependencies. 22 pages at the repo root plus three
shared files in `assets/`.

Live via GitHub Pages from `master`. An edit is invisible on the site until it is committed,
pushed, and hard-refreshed.

## Run it locally

Open any `.html` file directly, or serve the folder so relative paths and `location.origin`
behave the way they do in production:

```bash
python -m http.server 8000      # http://localhost:8000
```

Nothing to install. **Do not add `package.json` or `node_modules` to this repo** — it stays
dependency-free. If you need a headless check (jsdom or similar), install it outside the repo.

## Pages

| Nav group | Pages |
| --- | --- |
| *(no group)* | `index.html`, `404.html` |
| Consulting | `ai-consulting.html`, `method.html`, `pricing.html`, `case-studies.html`, `maturity-assessment.html`, `solve.html` |
| Solutions | `ai-solutions.html`, `technology.html` |
| Agents | `ai-agents.html` |
| Industries | `industries.html` |
| Academy | `ai-training.html`, `ai-assessments.html`, `resources.html`, `ai-careers.html` |
| Talent | `ai-talent.html`, `contract-services.html` |
| Company | `about.html`, `contact.html`, `faq.html`, `ai-advisor.html` |

Grouping is the page's own `class="mega-t is-on"` marker — which top-level nav item highlights
when you're on it. The mega menu itself cross-links freely between groups.

`sitemap.xml` and `robots.txt` are hand-maintained — a new page needs its own `<url>` entry.

## Layout

```
assets/        the only shared code
  site.css     ~1130 lines, append-only layers (later blocks override earlier ones)
  site.js      one IIFE holding every interactive feature, loaded `defer` on every page
  boot.js      blocking <head> script: applies stored theme before paint, resolves [DOMAIN]
  favicon.svg  og.svg
layouts/themes/   current theme explorations — the real homepage restyled, linking ../../assets/
layouts/          layout-N-*.html   historical self-contained snapshots
archive/          index-N.html      historical self-contained snapshots
```

`layouts/layout-N-*.html` and `archive/index-N.html` inline all their CSS/JS and do **not** track
the live site. Don't propagate edits into them.

## Conventions that will bite you

**The chrome is duplicated into every page.** Header, mega menu, mobile drawer and footer markup
are byte-identical across all 22 files, differing only in the active-page markers
(`class="mega-t is-on"` on the owning top-level item, `aria-current="page"` on matching deep
links). A nav or footer change means editing all 22 files — script it, then re-derive the markers
per page.

**`assets/site.js` has no per-page routing and no try/catch.** A feature block that dereferences
an element absent from the current page throws and silently kills every feature defined below it,
on every page. Guard every entry point (`var x = $('#id'); if (x) …`), and re-check *all* pages
after touching it, not just the one you changed.

**`assets/site.css` is ordered layers.** Position in the file is load-bearing: design tokens →
base components → v2 components → vibrant palette → vibrant layer → mega menu → page shell →
homepage hero → ledger layer. Add a new labelled block at the end rather than editing an early
one, unless you've checked what the later layers do with the same selector.

**Theming has three states**, and every colour must be defined for all three or the toggle breaks
in one direction:

- `:root` — light palette (baseline)
- `@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]) }` — system dark
- `:root[data-theme="dark"]` — explicit choice, persisted to `localStorage['nk-theme']`

**Placeholders stay literal.** Every company-specific fact is a bracketed placeholder —
`[DOMAIN]`, `[COMPANY NAME]`, `[BUSINESS EMAIL]`, `[PHONE]`, `[BUSINESS ADDRESS]`,
`[FOUNDER NAME]`, `[STATE OF INCORPORATION]`. `assets/boot.js` resolves `[DOMAIN]` at runtime and
strips any JSON-LD node still holding a placeholder, so canonical, `og:url` and the schema graph
stay valid in production without inventing facts. Placeholders shown in copy are wrapped in
`<span class="ph">`. Do not fill one in with a made-up value.

## Editorial rules the site enforces on itself

Stated in the footer disclosure on every page. These are constraints, not preferences:

- No real clients, employees, certifications, partnerships, awards, testimonials, revenue figures
  or office locations. Case studies are labelled illustrative patterns.
- No invented statistics.
- Pricing and durations are labelled indicative planning ranges, not quotes.
- The solve form is front-end only and says so on submit — it transmits nothing.

Two features (the AI Briefing on the homepage, the job classifieds on `ai-careers.html`) degrade
through tiers — live endpoint → shared store → seeded JSON in the HTML → an honest empty state —
rather than showing filler. That behaviour is the point of them, not an oversight.

## Source of truth for content

- `AI Consulting Company Website Master Prompt.txt` — the originating spec, verbatim, plus a build
  record. Authoritative for scope and structure.
- `COMPANY-CONCEPT-AND-STRATEGY.md` — positioning, service definitions, the eight-phase method,
  revenue model, industries. Page copy derives from this.
- `COMPETITOR-RESEARCH.md` — positioning analysis only. No competitor copy, design or code was
  taken; keep it that way.
- `CLAUDE.md` — working notes for Claude Code sessions on this repo.
