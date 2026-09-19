export default function decorate(block) {
  if (!block.firstElementChild || block.dataset.decorated) return;
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    row.classList.add('columns-row');
    [...row.children].forEach((col) => {
      col.classList.add('columns-cell');
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
  if (block.classList.contains('build-nav')) {
    block.setAttribute('role', 'navigation');
    block.setAttribute('aria-label', 'Build story sections');
  }
  block.dataset.decorated = 'true';
}
