# Atlantic Lottery — EDS fidelity migration

Greenfield Adobe Edge Delivery Services implementation of the public ALC homepage,
with Document Authoring as the content source of truth. This is a migration study,
not the official Atlantic Lottery site.

- [Reference site](https://www.alc.ca/content/alc/en.html)
- [Feature preview](https://migration-fidelity--alc-eds--somarc.aem.page/)
- [How we made this site — the themed engineering story](https://migration-fidelity--alc-eds--somarc.aem.page/how-we-built-this)
- [Canvas / homepage](https://da.live/canvas?ref=migration-fidelity#/somarc/alc-eds/index)
- [DA content](https://da.live/#/somarc/alc-eds)
- [Assessment, block shapes and boundaries](docs/MIGRATION.md)
- [Validation evidence and remaining Canvas sign-in gate](docs/VALIDATION.md)
- [Two-page demo and explainer contract](docs/DEMO-EXPLAINER.md)

The homepage is the migration. Normal off-home navigation opens the DA-authored
engineering story instead of an unmigrated lottery journey. Canonical source
links remain in DA and are not rewritten in Canvas authoring mode.

## Development

```sh
npm ci
npm run lint
da --org somarc --repo alc-eds --branch migration-fidelity site pin-target
da up --mode runtime --port 3008 --url https://migration-fidelity--alc-eds--somarc.aem.page
```

`da up --mode runtime` uses the official AEM CLI, local code and previewed DA
content. Hydrated documents and operation receipts belong in the external
workspace returned by `da workspace show`, never in this checkout.

## Initial scope

Complete English homepage, desktop/mobile shared chrome, five original campaign
slides, four winners, seven cards, four promotional-rail items, and Canvas-aware
block decoration. Content is a dated reference snapshot. Transactional and live
data functionality remains on the original site.

Original brand art/fonts remain subject to their rights holders. The Apache
license applies to boilerplate and implementation code, not a relicensing of
Atlantic Lottery assets. No production publication is implied by an EDS preview.
