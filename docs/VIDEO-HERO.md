# Cinematic story hero

The video belongs only to `/how-we-built-this`. The homepage remains the
migration-fidelity proof. All public story copy is project-neutral; do not add
named references to other migration projects.

## Authored contract

One `video-hero` block inside the existing `story-cover, cinematic` section:

1. `H.264` label cell and canonical H.264 MP4 link cell.
2. Optional `VP9` label cell and canonical VP9-in-MP4 link cell.
3. One canonical decorative poster image.
4. The live eyebrow, H1, lede, CTA and independent-demo/film-credit note.

Codec labels are explicit authored configuration, not inferred from file names
or marketing link text. The single-source, one-cell legacy form remains valid.

Media is uploaded through da-cli to DA's content bus under
`/media/build-story/`. No generated image/video or page-content fixture is in Git.
The film and poster use versioned paths; the first on-site version is `v1`.

The video anchor is the site-relative preview route, not a direct
`content.da.live` URL (which requires authentication for an ordinary browser
request). Binary preview creates a 301 to content-addressed media. The CLI
records that redirect as unverified rather than following it; a separate public
check followed the same-origin redirect and proved MP4 `206` byte-range delivery
and WebP `200` delivery at the expected lengths. The poster's authored DA image
URL is handled by EDS image processing.

The decorator adds classes/wrappers without replacing authored nodes. It never
removes the canonical video link; that row is exposed in quick-edit mode.
The generated video and pause/play button are disposable enhancement nodes.
Demo routing explicitly excludes the hero's media-source anchor. The story does
not itself carry the homepage's Demo Destination setting, but source integrity
must also hold if the reusable block is placed on a routed page.

## Production evidence

- Four distinct Grok Imagine still studies were generated, one operation per
  headless invocation. The selected three-ball composition was refined once to
  replace an ambiguous physical ribbon with a light arc.
- The first six-second motion pass was not promoted: sampled frames revealed
  invented floor debris and a visible reset.
- A second pass used the same canonical first/last image with
  `reference_to_video`. Sampled frames preserved the empty floor, rigid blank
  lottery balls and dark type zone. Its loop-boundary image difference was below
  the clip's 95th-percentile adjacent-frame difference. That is a diagnostic, not
  a frame-identical or photosensitivity certification.
- Native corrected film: 1280×720, 24fps, 6.041667 seconds, H.264, 3,340,768 bytes.
- Web delivery is a separately retained H.264 CRF20 derivative, without audio
  and with fast-start metadata: 2,224,471 bytes. Average SSIM against the native
  film was 0.992149; this is not a subjective-quality score.
- A VP9 web encode is 2,308,715 bytes with average SSIM 0.985948. Actual playback
  testing found that Studio's open-source Chromium cannot decode H.264; actual
  DA preview testing rejected the WebM container with HTTP 415. The VP9 packets
  were therefore losslessly remuxed into a real MP4 container (`vp09` sample
  entry), 2,309,165 bytes—not renamed or MIME-disguised. Codec-qualified selection
  keeps H.264 for browsers that support it and selects the supplied VP9 alternative
  where supported. Only the selected source is requested. The unserved WebM is
  retained as production evidence, not linked from the page.
- Poster: first decoded frame, WebP quality 88, 53,942 bytes.
- Original generations, prompts, receipts, reviews, hashes and lineage remain
  in the Studio production package. Model-private reasoning is not included in
  the deliverable receipts.

## Runtime and fallback policy

- Eager block-scoped geometry/poster styles reserve the stage before player
  enhancement. Video is absolutely positioned and does not own page geometry.
- Canonical poster loads eagerly; video is considered only after poster decode,
  fonts and the first paint opportunity.
- Canvas quick edit, reduced motion and Save-Data suppress creation of a video
  source. Static poster and live content remain.
- Muted, inline looping playback starts only while the hero/document is visible.
  Scrolling away or hiding the document pauses it. A user's explicit pause is
  retained when scrolling back.
- An autoplay rejection leaves the poster and a manual Play action. A media
  error removes the generated player and preserves the poster and copy.
- An expected AbortError from pausing during buffering is not misclassified as
  an autoplay denial. Unsupported codecs and actual media errors retain a
  diagnostic code instead of losing the failure meaning during player cleanup.
- The visible control has a 44px minimum target and an action-accurate Play/Pause
  accessible name. There is no audio stream in the delivery file.
- Abortable listeners and a removal observer clean up the player, observers and
  sources when the block or its containing body is replaced.

`video-policy.js` contains the testable policy and URL gate. The decorator's
optional motion/connection inputs support isolated browser policy tests; normal
page use always reads the real browser preferences.

## Validation gates

Check media MIME/bytes/range delivery, actual playback and pause/resume, viewport
crop and overflow, canonical field identity, repeated decoration, mounted-editor
geometry, reduced-motion/Save-Data source suppression, media-error/autoplay-failure
fallback and detached-player cleanup. Test a no-script source view separately.
Do not infer real Canvas edit/save/image-drop success from wrapper simulation.

No live publication or merge to main is part of this enhancement.

## Verified on 2026-09-19

- Both MP4 routes redirect to the expected content-addressed media and return
  `206` for ranged requests; poster delivery returns `200` with `image/webp`.
- The actual hosted page played the VP9-in-MP4 source in Studio Chromium 150 at
  1280×720, muted, inline and looping. Native pointer Pause held time stationary;
  Enter on the same control resumed playback.
- In that observed navigation, the poster response completed at 493ms and the
  film request began at 836ms. This proves the ordering in that run, not a CWV or
  general network-speed claim.
- The real-runtime viewport matrix passed 320, 390, 768, 1200 and 1440px: full
  available width, no document overflow, loaded poster, active playback, and
  unchanged 831px hero geometry in the 900px test viewport.
- Controlled browser policy cases passed: reduced motion and Save-Data create no
  player/source assignments; media error preserves poster/copy; autoplay denial
  exposes a working manual Play action; expected play interruption recovers;
  live motion-preference changes unload/recreate the player; removal clears the
  detached player's source and pauses it. These use isolated injected browser
  primitives, not a claim that every OS/browser setting was manually exercised.
- At 390/1200px, two decoration passes preserved 180 instrumented prose nodes,
  one poster image, 12 block roots and all authored links. Simulated editor
  wrappers retained hero/card geometry without overflow; no player exists in
  authoring mode. Real Canvas editing/saving remains unverified.
- A conservative all-white-frame calculation at the actual text rectangles
  passed contrast intent at all five widths: large heading at least 3.69:1;
  body/eyebrow/note at least 4.74:1. This is a hero-specific bound from the
  implemented scrim, not full accessibility certification.
- A script-free snapshot of the actual served HTML retained its loaded poster,
  white live H1 and 820px stage, with zero video elements/film requests and no
  horizontal overflow. It is a verification artifact, not the authored page.
- Final DA full audit: 0 errors, 0 warnings, all 4 poster media candidates valid.
  Code contracts scanned all four DA documents with no missing assets/errors.
- The homepage/return journey passed again. At 320, 390 and 1440px the original
  hero/card landmarks, one visible brand, seven cards, four promotions and tested
  controls remained intact. Its 107 off-home links still target this story.

Local harness entry points: `runVideoMatrix()`, `runVideoPolicyCase(kind)` and
`runMarkers(width, '/how-we-built-this')`. The policy cases are `reduced-motion`,
`save-data`, `media-error`, `autoplay-rejected`, `play-interrupted`, `motion-change`
and `cleanup`.
