import { decorateRenditions } from '../../scripts/media-fields.js';

export default function decorate(block) {
  if (block.dataset.decorated) return;
  [...block.children].forEach((row) => {
    row.classList.add('promo-item');
    if (block.classList.contains('mobile-banner')) {
      row.children[0]?.classList.add('rendition', 'rendition-mobile');
      row.children[1]?.classList.add('media-action');
    } else decorateRenditions(row);
  });
  block.dataset.decorated = 'true';
}
