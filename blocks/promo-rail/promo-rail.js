import { decorateRenditions } from '../../scripts/media-fields.js';

export default function decorate(block) {
  if (block.dataset.decorated) return;
  [...block.children].forEach((row) => {
    row.classList.add('promo-item');
    decorateRenditions(row);
  });
  block.dataset.decorated = 'true';
}
