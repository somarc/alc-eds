/** Shared manual controls; no clones, autoplay, global listeners or stale timers. */
export default function addCarousel(block, slides, label) {
  if (!slides.length || block.querySelector(':scope > .carousel-controls')) return;
  const doc = block.ownerDocument;
  const controls = doc.createElement('div');
  controls.className = 'carousel-controls';
  const dots = doc.createElement('div');
  dots.className = 'carousel-dots';
  const buttons = [];
  let selected = 0;
  const select = (index) => {
    selected = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== selected; });
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', i === selected));
    block.dataset.selectedSlide = String(selected);
  };
  const button = (text, className, action) => {
    const el = doc.createElement('button');
    el.type = 'button';
    el.className = className;
    el.setAttribute('aria-label', text);
    el.addEventListener('click', action);
    return el;
  };
  slides.forEach((slide, i) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
    const dot = button(`${label} ${i + 1}`, 'carousel-dot', () => select(i));
    dot.textContent = String(i + 1);
    buttons.push(dot);
    dots.append(dot);
  });
  controls.append(
    button(`Previous ${label}`, 'carousel-previous', () => select(selected - 1)),
    dots,
    button(`Next ${label}`, 'carousel-next', () => select(selected + 1)),
  );
  block.append(controls);
  select(0);
}
