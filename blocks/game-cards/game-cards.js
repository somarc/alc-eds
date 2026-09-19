import { ownField } from '../../scripts/media-fields.js';
import addCarousel from '../../scripts/carousel.js';

export default function decorate(block) {
  if (block.dataset.decorated) return;
  const cards = [...block.children];
  cards.forEach((row) => {
    row.classList.add('game-card');
    const [media, copy, overlay] = row.children;
    media?.classList.add('game-card-media');
    if (media && block.classList.contains('engineering')) {
      [...media.children].forEach((field, i) => ownField(field, i ? 'engineering-label' : 'engineering-value'));
    }
    copy?.classList.add('game-card-copy');
    if (copy) {
      const fields = [...copy.children];
      fields.forEach((field, i) => {
        let role = 'game-card-detail';
        if (/^H[1-6]$/.test(field.tagName)) role = 'game-card-title';
        else if (i === 1) role = 'game-card-description';
        else if (field.querySelector('strong a')) role = 'game-card-action';
        ownField(field, role);
      });
    }
    if (overlay) {
      overlay.classList.add('game-card-overlay');
      if (overlay.textContent.trim() === 'New') overlay.classList.add('new-flag');
      else if (overlay.children.length) {
        overlay.classList.add('jackpot');
        [...overlay.children].forEach((field, i) => ownField(field, i ? 'jackpot-extra' : 'jackpot-amount'));
      }
      media?.append(overlay);
    }
  });
  // CSS owns mobile-carousel/desktop-grid visibility; no resize listener or hidden desktop cards.
  addCarousel(block, cards, 'featured game', { hideInactive: false });
  block.dataset.decorated = 'true';
}
