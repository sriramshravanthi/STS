# Decisions

Why the site is built the way it is. `README.md` says what it is and how to work on it;
`CLAUDE.md` says the same for a Claude Code session. This file says **why**, and what each choice
rules out — so a later change either inherits the reasoning or overturns it deliberately.

Decisions taken in the originating spec (name, palette, type stack, trust rules, launch checklist)
live in `AI Consulting Company Website Master Prompt.txt` Part B and are not repeated here. This
file records what was decided while building, and what is still open.

---

## 1. No build step, no dependencies

**Decision.** 22 hand-authored `.html` pages at the repo root plus `assets/site.css`,
`assets/site.js`, `assets/boot.js`. No `package.json`, no `node_modules`, no framework, no
bundler. Deployed from `master` by GitHub Pages.

**Why.** The site is concept-stage marketing copy with a handful of self-contained interactive
features. A toolchain would be the largest thing in the repo and would need maintaining before the
company it advertises exists. Anyone can open a file and see the page.

**What it costs.** No partials, so the header, mega menu, mobile drawer and footer are duplicated
verbatim into all 22 pages — a nav change is a 22-file scripted edit plus a re-derivation of the
per-page `is-on` / `aria-current` markers. That cost is accepted; it is paid by scripting the
edit, not by adding a templating layer.

**Consequence.** Verification runs headlessly in jsdom, installed *outside* the repo, because the
repo has to stay dependency-free. The check script is written into the scratchpad each session and
never committed.

---

## 2. Every company-specific fact stays a bracketed placeholder

**Decision.** `[DOMAIN]`, `[COMPANY NAME]`, `[BUSINESS EMAIL]`, `[PHONE]`, `[BUSINESS ADDRESS]`,
`[FOUNDER NAME]`, `[STATE OF INCORPORATION]` stay literal in the repo. Placeholders shown in copy
are wrapped in `<span class="ph">`. `assets/boot.js` resolves `[DOMAIN]` at runtime and deletes any
JSON-LD node still holding a placeholder.

**Why.** The company is a concept. A plausible-looking address or phone number is an invented fact,
and the site's own footer disclosure says it publishes none. The runtime resolver exists so that
refusing to invent does not also produce a broken canonical URL, a broken `og:url`, or an invalid
schema graph in production.

**Rule.** Do not fill a placeholder with a made-up value. Replacing them with real ones is a launch
task, listed in Part B.

---

## 3. The editorial constraints are constraints, not tone

**Decision.** No real clients, employees, certifications, partnerships, awards, testimonials,
revenue figures or office locations. No invented statistics — the commitments band deliberately
occupies the slot where the competitor set puts an invented-stat bar. Case studies carry a visible
illustrative-pattern label. Pricing and durations are labelled indicative planning ranges. The
solve form is front-end only and says so on submit, because it transmits nothing.

**Why.** Every one of these is a claim a reader could act on. The site is the first artefact of a
firm whose product is judgement; publishing an unearned compliance badge or a fabricated client
logo would be the cheapest possible way to establish that its judgement is for sale.

**Rule.** These are stated in the footer disclosure on every page. Changing one means changing the
disclosure too, not quietly diverging from it.

---

## 4. Features degrade through honest tiers rather than showing filler

**Decision.** The AI Briefing (`#briefing`) and the job classifieds (`#classifieds`) each fall
through a fixed ladder and end in an honest empty state:

- **Briefing** — `window.NORTHKEY_NEWS_ENDPOINT` → artifact `db` document `briefing/current` (one
  generation per day, shared by all visitors) → the `#briefSeed` JSON block in the HTML, labelled
  *Editorial*, not *Live* → an empty state that says it is not live.
- **Classifieds** — artifact `db` collection `listings` → `localStorage['nk-classifieds']`,
  labelled as this-browser-only → the `#jobsSeed` JSON block → generated *role patterns*, always
  labelled as patterns and never presented as open positions.

**Why.** Both features would be trivial to fake and the fake would be undetectable. A self-updating
briefing needs a hosted feed or a scheduled job with an API key; neither exists, and dressing
static copy as today's news is precisely the claim §3 says the site will not make. The seed tier
exists so the component is not permanently empty; the label exists so the seed is not mistaken for
a feed.

**Rule.** The empty state and the labels are the feature, not an unfinished edge. The generation
prompt carries an explicit no-invented-news and banned-buzzword rule (`SAMPLE_PROMPT_RULES`) for
the same reason.

---

## 5. `assets/site.js` is one unguarded IIFE — so every entry point is guarded

**Decision.** ~1220 lines in a single `(function(){...})()`, loaded `defer` on all 22 pages,
holding every interactive feature. No per-page routing, no try/catch around the body.

**Why it stays.** Routing or a per-page bundle would reintroduce a build step (§1) for a file that
is fetched once and cached.

**What it costs.** A feature block that dereferences an element absent from the current page throws
and silently kills **every feature defined below it, on every page**. That failure has shipped
twice (`9b05a08`, `d12e911`).

**Rule.** Guard every entry point — `var x = $('#id'); if (x) x.addEventListener(...)` — and after
touching `site.js`, run the jsdom check across *all* pages, not only the one you changed. This is
the constraint most likely to be violated by a correct-looking one-line change.

---

## 6. `assets/site.css` is append-only layers

**Decision.** ~1130 lines in deliberate order, later blocks intentionally overriding earlier ones:
design tokens → base components → v2 components → **vibrant palette** (`--h1`..`--h6`, `--accent`,
`--accent-2`, restated across all four theme selectors) → **vibrant layer** (cycles the six hues
across component families via `:nth-child(6n+k)`, pure CSS, no markup hooks) → mega menu → page
shell → homepage hero and orbit diagram → **ledger layer**.

**Why.** The file grew by successive restyles over markup that had already shipped. Re-cutting it
into a flat system each time would have meant re-verifying 22 pages for a cosmetic gain; layering
let each restyle be a bounded, reversible block.

**Rule.** Add a new labelled block at the end. Position is load-bearing — before editing an early
rule, check what the later layers do with the same selector. The ledger layer (`5690a81`)
deliberately sets *no* colour on `.n`, `.lnk` or `::after`, because the vibrant layer owns those.

---

## 7. Theming has three states, and all three must define every colour

**Decision.** `:root` (light baseline); `@media (prefers-color-scheme:dark){
:root:not([data-theme="light"]) }` (system dark); `:root[data-theme="dark"]` (explicit choice,
persisted to `localStorage['nk-theme']`). `assets/boot.js` is a small blocking `<head>` script that
applies the stored theme before paint.

**Why.** A colour defined in only two of the three breaks the toggle in one direction — usually the
direction the author was not testing. `boot.js` blocks on purpose: applying the theme any later is
a flash of the wrong palette on every load.

**Rule.** `boot.js` stays synchronous and stays small. Every new colour is declared in all three
places.

---

## 8. Palette: Bone light, Obsidian dark

**Decision.** Five colour directions were built as full theme concepts (`336170a`), then the pair
that read best was ported into the design tokens (`d599f1d`): warm bone paper with forest green in
light, near-black with electric mint in dark. Two structural devices from the Bone concept followed
— the services block as a print-style ruled contents index, the eight method phases as a ruled
timeline (`5690a81`) — and the asymmetric hero with the orbit diagram came from Obsidian
(`580bf7f`).

**Why.** Choosing a direction from written descriptions is choosing blind. Building the candidates
as real, running pages made the comparison honest, and porting only the devices that won kept the
rest of the site from being rewritten to match a mood.

**Note.** The orbit diagram draws entirely from design tokens, so it recolours with the theme. It
is `aria-hidden`, drops its motion under `prefers-reduced-motion`, and is hidden below 560px where
it would cost scroll depth above the buttons. The hero's five equal-weight CTAs were cut to two
buttons plus a quieter link row; all five destinations survive, only the weighting changed.

---

## 9. `layouts/themes/` are live restyles; `layouts/` and `archive/` are frozen

**Decision.** The five files in `layouts/themes/` are the **real** homepage markup linking
`../../assets/site.css` and `site.js`, with one `<style>` block overriding tokens, type stack and
layout. `layouts/layout-N-*.html` and `archive/index-N.html` are self-contained historical
snapshots (~230KB each, everything inlined) that do not track the live site.

**Why.** The theme concepts began as standalone landing pages, and comparing those against the real
homepage was comparing unlike things (`6ca6d02`). Rebuilding them on the real assets made each one
the actual site restyled. They were later differentiated on three axes — palette, typography and
layout — because varying only colour made "five designs" an overstatement (`3c2ded3`).

**What it costs.** Each theme carries its own copy of the homepage markup, so homepage *content*
changes — briefing items, classifieds, audience tabs, mega-nav links — have to be replicated into
all five or the themes quietly fall out of date (`3db01ca`, `6ca6d02`). Each should still hold
seven mega panels and link `../../assets/site.css` and `site.js`. `layouts/themes/index.html`
describes the themes in prose, so a theme change is also an edit to that description.

**Rule.** Do not propagate edits into `layouts/layout-N-*.html` or `archive/`. They are history.

---

## 10. Verification is jsdom, not a browser

**Decision.** Load a page with `runScripts:'dangerously'`, `eval` `assets/boot.js` and
`assets/site.js` into the window, dispatch `DOMContentLoaded`, then assert on uncaught JS errors,
dead `.html` hrefs, and the elements the touched feature expects. Run it across all 22 pages.

**Why.** The Chrome extension does not connect in this environment, and the failure mode in §5 is
invisible to anything that does not execute the script and listen for the throw. Looking at the
page you edited will not show you that a feature on another page stopped working.

**Rule.** A `Verified:` line in a commit message is a claim about what was actually run. Only write
it after running the check, and name what was checked and across how many files.

---

## 11. Commits are written for someone who was not here

**Decision.** Imperative subject line, then a body saying what was wrong and why the change is the
right shape — not what the diff already shows. Substantive commits close with a `Verified:` line.

**Why.** Most of the constraints on this list were discovered by hitting them. The commit body is
where that discovery survives; the diff records only the outcome.

**Note.** `master` is the deploy branch and the remote is occasionally edited directly on GitHub,
so `git fetch` and rebase before pushing rather than assuming a fast-forward. An edit is invisible
on the live site until it is committed, pushed, and hard-refreshed.

---

## Still open

Tracked in full in `AI Consulting Company Website Master Prompt.txt` §B.6. The items that bear on
the code:

- Clear the name — `NORTHKEY AI` is a proposal, not a cleared name — and replace every bracketed
  placeholder with a real value.
- Wire the solve form to a backend or CRM. A honeypot is in place — the `website` field, checked in
  `assets/site.js` — but rate limiting is server-side work that does not exist yet. Until then the
  form must keep saying it transmits nothing.
- Stand up `NORTHKEY_NEWS_ENDPOINT`, or a scheduled job with an API key, so the briefing can reach
  its top tier instead of resting on the editorial seed.
- Replace the rule-based AI Advisor with an LLM-backed one once a backend exists — keeping the
  human-review disclaimer either way.
- Replace the illustrative case studies with real, client-approved ones, or leave them labelled.
- Custom domain, HTTPS, CDN, and privacy-first analytics.

Nothing in this repo is legal, tax, or financial advice.
