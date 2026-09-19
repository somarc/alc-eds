# Themed engineering explainer and demo navigation

## Product contract

The homepage remains the ALC presentation migration. This repository is an
illustration, not a commitment to migrate all source routes. Off-home navigation
from the homepage leads to one real DA-authored page: `/how-we-built-this`.

The explainer uses the same Proxima Nova/Ubuntu fonts, blue/lime palette, prize
plates, promotion-card geometry and pill CTAs. Its "winning opportunities for
Adobe" are engineering outcomes and explicitly labelled next checks—not invented
ROI, live prizes or claims of production readiness.

The detailed blueprint includes models and delegation, measured initial-build
counts, actual da-cli command shapes, QMD's demonstrated role, corrections,
validation and a bounded scale path. All numerical execution claims refer to the
initial build through `8889b16`; this explainer and later activity are excluded.

## Content ownership and shapes

Content lives at `/somarc/alc-eds/how-we-built-this.html` in DA. No authored HTML
fixture is stored in Git. Metadata selects `Template: build-story`.

- Default content owns the section headings, body prose and ordinary links.
  The later cinematic `video-hero` owns the live H1/hero copy and canonical media
  fields; see `docs/VIDEO-HERO.md` for the current media and playback contract.
- Existing `columns` has `build-masthead`, `build-nav`, `build-metrics`,
  `build-team`, `build-flow`, `build-ticket`, `build-receipts`, `build-lessons`
  and `build-evidence` variants. Each row has at most four cells.
- `game-cards (engineering)` reuses the migrated promotion-card shell. Its
  media cell contains authored prize text rather than an image; the other
  cells retain the title/body/CTA and optional status-bar contracts.
- `build-blueprint`: each row is [heading/explanation] [PRE commands/notes].
  The decorator adds stable role classes and an optional copy button; it does
  not replace authored fields. The copy action reads the current PRE so it
  does not retain a stale reference after editor mounting.
- `styles/build-story.css` owns the template's direct default content and
  section composition. Block CSS owns the internals of columns, cards and
  blueprint rows.

## Demo-routing contract

Homepage Metadata declares `Demo Destination: /how-we-built-this`.

A small shared `demo-routing.js` helper rewrites actual DOM hrefs, not click
behavior. Canonical imported destinations remain in DA as the migration record.
This supports ordinary, modified, middle-click and open-in-new-tab navigation.

- Preserve same-origin `/`, `/index`, `/index.html`, skip links and same-page
  fragments. The story's return-home links stay `/`.
- Restrict the configured destination to a same-origin path without query/hash.
- Route main links before block loading and shared-chrome links before their
  loading completes; perform a final idempotent pass over the body.
- Preserve cart/help/social presentation with explicit runtime semantic roles.
  Original href selectors remain as the Canvas/non-demo fallback.
- Skip routing entirely in quick-edit mode so authored hrefs and markers remain
  intact. The Canvas host owns preventing navigation during author editing.
- Search in demo mode navigates to the story without forwarding the typed query.
  Modified link activation remains native.
- The newsletter input stays disabled and its description explains demo behavior.
- The 404 document sends browser navigation to the story. If the story itself is
  unavailable, or quick edit is active, it leaves an explicit fallback instead of
  creating a redirect loop. This does not turn missing assets into successful
  resources; the underlying missing response remains 404. The `/index` alias
  returns to canonical `/` instead of being treated as an unmigrated destination.

The story uses a minimal themed masthead instead of repeating the lottery
transaction-navigation shell. Its section links stay within the story. Explicit
repository/PR links are real engineering references, not simulated ALC routes.

## Acceptance criteria

- The story is a served DA/EDS content page, not a local explainer artifact.
- Every rendered off-home homepage anchor points to `/how-we-built-this`.
- Cart/help/social icons and homepage geometry remain unchanged.
- Carousels, menu disclosures, footer details and skip navigation still work.
- A homepage CTA opens the story; its return-home CTA restores the homepage.
- Story copy remains legible and bounded on mobile, tablet and desktop; code
  blocks and tables do not cause document-wide horizontal overflow.
- Story block/prose identities survive decoration and simulated editor mounting.
- Command copy controls work in normal view and are absent in Canvas view.
- Direct unknown-page navigation reaches the story without a redirect loop.
- JS/CSS lint, importer/routing tests and DA/code audits pass.
- Original-build metrics remain scoped; no live Canvas round-trip, pixel-perfect,
  CWV, whole-site migration or production-publication claim is introduced.

## Verified initial two-page version on 2026-09-19

This section records the pre-film extension through `015089e`. The subsequent
cinematic enhancement and its updated counts are verified in `docs/VIDEO-HERO.md`.

- The story was uploaded to DA and previewed through da-cli. Its rendered EDS
  document and block assets returned HTTP 200.
- The rendered homepage has 110 anchors: 107 off-home links target the story;
  the remaining links are Home and Skip to main content. Canonical DA hrefs
  remain unchanged in quick-edit instrumentation tests.
- Native Studio browser clicks proved a homepage game-card CTA → story →
  masthead Back to homepage round trip. The command-copy button reported Copied.
- The isolated runtime journey also passed search → story without forwarding
  the typed query, unknown-page → story, campaign advancement and disabled signup.
- The homepage passed all ten existing viewport widths with no overflow, one
  visible brand image, 7 cards, 4 promotions and functioning tested controls.
  Its 390/1440px hero/card landmarks remained at the earlier measured geometry.
- The story passed 320, 390, 768, 1200 and 1440px checks: no document overflow,
  all blocks loaded, all six metrics and command-copy controls present, and
  opportunity-card CTAs remained within their cards.
- At 390/1200px, story instrumentation preserved 175 prose nodes and 11 block
  roots; mounted wrappers retained the 256px card-copy region. Homepage tests
  retained 52 prose nodes, 44 images, 5 roots and 220px card-copy regions. Neither
  page overflowed after simulated editor mounting. Shared nav/footer checks
  also preserved their original markers and links.
- The story and homepage each passed `da audit full` with 0 errors and warnings.
  Contracts scanned all 4 DA documents: 8 authored block types had JS/CSS HTTP
  200, with no missing assets or errors.
- New opportunity-plate foreground/background endpoint pairs were checked at
  5.39:1 or better; command-copy and chapter links have 44px minimum targets.
  This is a focused check, not full accessibility certification.

`runDemoJourney()` and the updated `runMarkers()` are available in the local
validation harness. The latter loads `/` for the homepage while fetching
`/index.plain.html` for source; treating `/index` as a rendered page could
otherwise follow the demo fallback and test against the wrong template.

Real authenticated Canvas editing/saving/image replacement remains a separate
gate. No production publication or merge to main was performed.
