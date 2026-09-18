import addCarousel from '../../scripts/carousel.js';
import { decorateRenditions } from '../../scripts/media-fields.js';

export default function decorate(block) {
  if (block.dataset.decorated) return;
  const slides = [...block.children];
  slides.forEach((slide, i) => {
    slide.classList.add('campaign-slide');
    decorateRenditions(slide);
    slide.querySelectorAll('img').forEach((img) => {
      img.loading = i === 0 ? 'eager' : 'lazy';
      if (i === 0) img.setAttribute('fetchpriority', 'high');
    });
  });
  addCarousel(block, slides, 'campaign');
  block.dataset.decorated = 'true';
}
