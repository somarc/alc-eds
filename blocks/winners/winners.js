import addCarousel from '../../scripts/carousel.js';
import { ownField } from '../../scripts/media-fields.js';

export default function decorate(block) {
  if (block.dataset.decorated) return;
  const slides = [...block.children];
  slides.forEach((row) => {
    row.classList.add('winner-slide');
    const [portrait, bio, game, prize] = row.children;
    [portrait, bio, game, prize].forEach((cell, i) => {
      cell?.classList.add(['winner-portrait', 'winner-bio', 'winner-game', 'winner-prize'][i]);
    });
    if (bio) {
      [...bio.children].forEach((field) => {
        if (field.querySelector('a')) ownField(field, 'winner-action');
        else if (field.tagName === 'P') {
          ownField(field, 'winner-location');
          const province = field.textContent.trim().match(/,\s*(PE|NS|NB|NL)$/)?.[1];
          if (province) row.classList.add(`province-${province.toLowerCase()}`);
        }
      });
    }
    if (game) {
      [...game.children].forEach((field) => ownField(field, field.querySelector('img') ? 'winner-logo' : 'winner-ribbon'));
    }
  });
  addCarousel(block, slides, 'winner');
  block.dataset.decorated = 'true';
}
