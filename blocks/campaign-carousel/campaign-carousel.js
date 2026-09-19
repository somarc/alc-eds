import addCarousel from '../../scripts/carousel.js';
import { decorateRenditions } from '../../scripts/media-fields.js';

export default function decorate(block) {
  if (block.dataset.decorated) return;
  const slides = [...block.children];
  slides.forEach((slide, i) => {
    slide.classList.add('campaign-slide');
    decorateRenditions(slide);
    slide.querySelectorAll('img').forEach((img) => {
      const rendition = img.closest('.rendition');
      const visible = rendition && getComputedStyle(rendition).display !== 'none';
      img.loading = i === 0 && visible ? 'eager' : 'lazy';
      if (i === 0 && visible) img.setAttribute('fetchpriority', 'high');
    });
  });
  addCarousel(block, slides, 'campaign');
  block.dataset.decorated = 'true';
}
