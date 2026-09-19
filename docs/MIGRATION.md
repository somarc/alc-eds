# ALC → Edge Delivery migration

## Scope and evidence

Reference: https://www.alc.ca/content/alc/en.html, captured 2026-09-18.
This is an independent fidelity/authoring exercise, not the official Atlantic Lottery site.
The initial implementation is the complete English homepage and shared navigation/footer.
It does not claim to migrate the transaction platform or all indexed routes.

The public sitemap lists 3,100 URLs: ALC English 1,408; ALC French 1,402;
Proline Stadium English 145; Proline Stadium French 145. This is an inventory,
not a count of static pages. The sitemap's dates are stale and robots exclusions
include transactional/account/game routes. A migration scope needs a validated
route and locale-pair inventory before bulk import or cutover.

Sampled editorial archetypes: `/content/alc/en/corporate/playwise.html` and
`/content/alc/en/promos/social-purpose.html`. The latter is a useful next slice
for reusable editorial hero, teasers and FAQs. The results hub at
`/content/alc/en/winning-numbers.html` contains ten data-driven result groups.

## Complexity

| Workstream | Assessment | Driver |
| --- | --- | --- |
| Homepage visual migration | Medium–high | Art-directed campaigns, winner carousel, jackpot overlays, responsive main/rail layout |
| Editorial pages | Medium | Repeatable hero, prose, teaser, accordion and media patterns |
| Bilingual and SEO cutover | High | 2,810 ALC URLs, non-identical locale inventories, existing paths/redirects and metadata |
| Gameplay, identity, wallet, payments | Very high / separate program | Regulated transactions, authentication/MFA, age/location verification and vendor integrations |
| Data and martech | High | Live results/jackpots, consent/subscription, analytics, personalization and availability |
| Canvas authoring | Medium–high | Stable canonical fields, responsive image identity, repeated full-body decoration |

These are relative engineering assessments, not a priced estimate. No private
backend, authenticated journey, analytics implementation or production SLA was assessed.

## DOM-derived block contracts

All tables have at most four cells per row. Headings and paragraphs remain real
semantic nodes. The script never imports legacy application scripts or clientlibs.

| Block | Source selector | Canonical row shape |
| --- | --- | --- |
| `campaign-carousel` | `article.fca-carousel-slide-promo` | desktop image · tablet image · mobile image · link |
| `winners` | `.winners-carousel-slides > .slide` | portrait · name/location/CTA · game logo/ribbon · formatted prize |
| `game-cards` | `article.game-tile` | artwork · title/description/draw-reference/CTA · optional overlay |
| `promo-rail` | `.cmp-container--game-tiles + .alc-container .cmp-image` | desktop image · tablet image · mobile image · link |
| `navigation` | `.header-nav ul.yamm > li`, `header.tablet-desktop` | top: brand/search/tools/account; menu: four primary groups with lists |
| `site-footer` | `footer.main-footer` | newsletter row · social row · four link groups · legal/partner region |

The single mobile winning-numbers banner uses `promo-rail (mobile-banner)` with
two cells: mobile artwork and link. Game cards are a mobile carousel and a desktop
grid, as observed in the source runtime. Section headers are ordinary H2 content,
not blocks. Section Metadata owns
full-bleed, colored title bands, and the two-thirds/one-third featured composition.

The captured homepage contains 5 campaign slides, 4 winners, 7 cards and 4 rail
promotions. Campaign/rail rendition boundaries are 768 and 1200 pixels, taken
from the source DOM. Page container tiers additionally include the original
992-pixel transition. Artwork lettering is baked into the original images;
editing that lettering requires replacement artwork, not a text field.

## Fidelity and deliberate boundaries

- Original brand font files and UI decoration were retrieved from the public
  site's clientlib/static assets. Content pictures remain in DA-authored HTML;
  EDS preview handles remote media delivery. No page content is stored as a Git fixture.
- New block code replaces the legacy runtime, not the brand style.
- Carousel controls are manual: no autoplay, hidden clones, global listeners or
  intervals. This keeps the reference capture deterministic and authoring stable.
- Draws, jackpots and winners are visibly labelled as a dated reference snapshot
  in the preview footer, not presented as live data. Production requires an approved
  live-data integration and freshness/error contracts.
- Canonical imported account, gameplay, search and subscription destinations
  remain the original `alc.ca` links in DA. The subsequent two-page demo mode
  routes normal rendered off-home links to `/how-we-built-this`; Canvas retains
  the canonical values. No credentials, payments, subscriptions or player records
  are accepted locally. The newsletter input stays disabled. See
  `docs/DEMO-EXPLAINER.md` for this explicit presentation-layer routing contract.
- The broken source `winners.html.html` URL is normalized to `winners.html`.
- Preview includes `noindex, nofollow` and an independent-migration notice.
- Source art and font rights must be reviewed before any production reuse.

## Canvas contract

Canvas: `https://da.live/canvas?ref=migration-fidelity#/somarc/alc-eds/index`.
The `ref` query is before the hash and selects code only, not another DA document.
Use Layout or Split inside Canvas. `/nav` and `/footer` are separately editable
shared documents; they do not recursively insert the global header/footer.

The site explicitly initializes DA's current `nx/public/plugins/quick-edit`
module with its own exported `loadPage(doc = document)`. This loader awaits all
structural block and shared-fragment work before resolving. It can run after a
full Canvas body replacement and skips already prepared content on repeat calls.

- Keep block roots and authored prose/image nodes intact, exactly once.
- Each responsive rendition stays an independent image field; do not collapse
  three canonical images into one marker-bearing `<picture>`.
- Put role/state classes on generated owners outside editable fields.
- Size `.prosemirror-editor > .ProseMirror` where media owns the geometry.
- Do not rebuild authored rich text to render visual decoration.
- The intentional `.ProseMirror` exception in Stylelint names the editor's real
  external class, not a project naming exemption.

Marker-preservation tests and simulated mounted wrappers are necessary but are
not equivalent to proving a live Canvas edit/save/refresh round trip. Repeated
identical image sources also need real replacement testing against the deployed
DA version; do not assume a local pre-GA image-selection patch is live.

## Workflow and ownership

`da workspace show --format json` resolves the external operational workspace.
`tools/import-homepage.py` reads a captured public source document and writes
only to that external content directory. It rejects output inside this Git repo.
Its only extra local prerequisite is Beautiful Soup; there is no browser/runtime
dependency. It does not upload or publish.

Use da-cli for source preflight/write, preview, audit and code verification, with
QMD journaling on. Review the effective payload digest before committed writes.
The source doc is authoritative after upload; do not rerun import over author
edits without fetching and comparing DA first.

Code follows feature-branch → Code Sync → preview verification → PR. Content
preview and production publication are separate. No live publication is part of
this implementation.
