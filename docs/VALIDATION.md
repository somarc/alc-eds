# Validation — first ALC fidelity slice

Validated 2026-09-19 UTC against public source content captured 2026-09-18.
Scope: English homepage, shared navigation/footer, and the six custom block types.
This is not validation of the 3,100-URL inventory or of transactional functionality.

## Delivered result

- Preview: https://migration-fidelity--alc-eds--somarc.aem.page/
- Canonical DA documents: `/somarc/alc-eds/index.html`, `nav.html`, `footer.html`.
- Code branch: `migration-fidelity`.
- Canvas: https://da.live/canvas?ref=migration-fidelity#/somarc/alc-eds/index
- No production content publication or merge to `main` was performed.

## Checks completed

| Check | Result |
| --- | --- |
| `npm run lint` | JS and CSS pass |
| `npm test` | 5 importer-boundary regression tests pass |
| `da audit full /index.html` | 0 errors, 0 warnings; 156 media candidates checked, none broken |
| `da audit contracts --prefix / --verify-code` | All 3 documents scanned; all 6 custom blocks have JS/CSS HTTP 200; no missing assets |
| `da preview explain /index.html` | One effective metadata channel; only expected Metadata/Section Metadata lifting |
| `da code verify` | Current page-loader text and accessible-heading style confirmed in delivered assets |
| Git/DA boundary | Audit found no tracked authored content or operational state |
| QMD | Commands recorded/indexed in `da-ecosystem`; the site-create receipt was retrieved independently as `#57dd6b` |

The first full audit caught a missing H1. A visually hidden, semantic H1 was
added in DA without changing the painted layout. The original page's JavaScript-
assigned title was extracted as a string literal (not executed) and preserved
in DA Metadata instead of its raw HTML title, `Home`.

## Responsive browser matrix

Tests ran in the Studio Chromium browser using same-origin, explicitly sized
iframes loading the actual EDS runtime and previewed DA content. This varies the
real document viewport, not a scaled screenshot or an alternate mockup.

Widths: **320, 375, 390, 767, 768, 991, 992, 1199, 1200, 1440 px**.

At all ten widths:

- no document horizontal overflow;
- exactly one appropriate desktop/mobile brand image is visible;
- all homepage blocks finish loading;
- campaign next/previous and winner-next controls change the intended item;
- all 7 cards and 4 promotional items remain in the document;
- the newsletter input is disabled rather than collecting data without a backend.

At mobile widths, the game cards become a carousel and the mobile navigation
opens/closes. The source's 768/992/1200-pixel boundaries are covered on both sides.
At 320px, card copy can grow from 220 to 236px rather than clip longer content.

## Matched-source geometry

Source measurements came from the real ALC page in a same-origin browser iframe,
reloaded at each reference width so its one-time responsive JavaScript ran at the
correct viewport. EDS measurements used the same widths. Browser scrollbars
account for the 15px difference between viewport width and document client width.

| Landmark | Source | EDS |
| --- | ---: | ---: |
| 1440px: hero top | 140.844px | 140.836px |
| 1440px: hero height | 525px | 525px |
| 1440px: winner band height | 245px | 245px |
| 1440px: first card-image width | 356.656px | 356.664px |
| 1440px: first card-image top | 1014.438px | 1014.430px |
| 390px: mobile hero top / height | 145px / 375px | 145px / 375px |
| 390px: winner band height | 427.344px | 427.352px |
| 390px: card-image top / width | 1050.938px / 355px | 1050.945px / 355px |
| 390px: game-carousel control top | 1515.938px | 1515.945px |
| 390px: footer start | 2627.984px | 2628.016px |

These are specific layout measurements, **not a whole-page pixel-diff score**.
Original art, fonts, image crops and content were retained. The visible migration
notice, disabled subscription integration, manual carousels, and some shared-
chrome behavior are deliberate differences. A complete production visual,
accessibility and browser-matrix certification has not been claimed.

## Authoring identity tests

The local harness stamps the delivered semantic DOM, calls the actual exported
`loadPage(doc)`, verifies original node identity/cardinality, repeats decoration,
and mounts representative `.prosemirror-editor > .ProseMirror` wrappers.

| Document | Prose fields | Images | Block roots | Result |
| --- | ---: | ---: | ---: | --- |
| Homepage, final with H1 | 52 | 44 | 5 | All preserved exactly once; repeat-safe |
| Navigation | 8 | 17 | 1 | All preserved exactly once; repeat-safe |
| Footer | 14 | 5 | 1 | All preserved exactly once; repeat-safe |

The homepage card-copy region stays 220px before and after wrapper mounting at
390/1200px; no mounted-wrapper overflow was observed. The final H1 pass was rerun
at 1200px. The earlier mobile pass covered the same visible blocks before the
hidden H1 was added.

A real defect was corrected: two winner rows referenced the same canonical logo
source. Perry's copy now has a separate DA asset path. Deployed DA source was
inspected to verify that Canvas `SET_BODY` serializes canonical source paths,
not the content-addressed `.plain.html` media hashes. Identical published media
hashes therefore do not collapse these now-distinct canonical source identities.

## Published-preview interaction checks

Native Studio browser clicks and keyboard events on the delivered preview proved:

- campaign Next followed by Enter advances from slide 1 to slide 3;
- the first pagination control restores slide 1;
- the Play Online disclosure opens its actual menu;
- Escape closes it and restores/retains focus on its disclosure button;
- all 21 currently visible images finish loading with nonzero intrinsic width;
- the final title and semantic H1 are present and the visible brand image is correct.

## Still pending / deliberately excluded

**Live Canvas Layout/Split edit → save → refresh and image-drop round trips are
not yet verified.** The Studio browser reaches an Adobe/Okta sign-in timeout.
CLI authentication is valid but is not a substitute for browser authentication.
No cookies or tokens were copied between them. The Canvas bootstrap is wired;
complete browser sign-in, then verify a reversible edit on a draft before merge.

Other gaps: authenticated account/wallet/gameplay, current jackpot/results feeds,
subscription/consent, geo/age verification, analytics, French content, editorial
routes, redirects/indexing/cutover, production rights review, and Lighthouse/CWV.
The inherited development-tool dependency audit also reports advisories; no
runtime framework or production dependency was introduced.

## Reproduction

```sh
npm ci
npm run lint
npm test
da up --mode runtime --port 3008 --url https://migration-fidelity--alc-eds--somarc.aem.page
```

Open `http://localhost:3008/tools/validate.html` and run `runMatrix()` or
`runMarkers(1200)` in its console. These tools are excluded from Code Sync by
`.hlxignore`; no maintained page-content fixtures are stored in Git.
