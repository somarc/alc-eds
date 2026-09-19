import { ownField } from '../../scripts/media-fields.js';

export default function decorate(block) {
  if (block.dataset.decorated) return;
  const doc = block.ownerDocument;
  const [top, menu] = block.children;
  if (!top || !menu) return;
  top.classList.add('navigation-top');
  [...top.children].forEach((cell, i) => cell.classList.add(['nav-brand', 'nav-search', 'nav-tools', 'nav-account'][i] || 'nav-extra'));
  const brand = top.querySelector('.nav-brand');
  // aem.js can wrap two delivered image-only pictures in one unmarked paragraph.
  // Canvas retains the two authored, marked paragraphs; never unwrap those.
  const generated = brand?.firstElementChild;
  if (generated?.tagName === 'P' && !generated.hasAttribute('data-prose-index')
    && !generated.textContent.trim() && generated.querySelectorAll('img').length === 2) {
    generated.replaceWith(...generated.children);
  }
  if (brand?.children.length === 2) {
    brand.classList.add('has-compact');
    [...brand.children].forEach((field, i) => ownField(field, i ? 'nav-brand-compact' : 'nav-brand-wide'));
  }
  menu.classList.add('navigation-menu');
  const shell = doc.createElement('nav');
  shell.className = 'navigation-bar';
  shell.setAttribute('aria-label', 'Primary');
  menu.before(shell);
  shell.append(menu);
  const mobileButton = doc.createElement('button');
  mobileButton.type = 'button';
  mobileButton.className = 'navigation-toggle';
  mobileButton.setAttribute('aria-label', 'Toggle navigation');
  mobileButton.setAttribute('aria-expanded', 'false');
  mobileButton.addEventListener('click', () => {
    const expanded = block.classList.toggle('menu-open');
    mobileButton.setAttribute('aria-expanded', expanded);
  });
  top.prepend(mobileButton);
  const search = top.querySelector('.nav-search');
  if (search) {
    const input = doc.createElement('input');
    input.type = 'search';
    input.placeholder = 'enter search here';
    input.setAttribute('aria-label', 'Search Atlantic Lottery');
    search.prepend(input);
    const submit = () => {
      if (doc.documentElement.getAttribute('quick-edit') === 'true') return;
      const destination = search.querySelector('a');
      if (!destination) return;
      const url = new URL(destination.href);
      if (destination.dataset.demoRouted !== 'true') url.searchParams.set('q', input.value);
      window.location.assign(url);
    };
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); submit(); }
    });
    search.querySelector('a')?.addEventListener('click', (event) => {
      if (doc.documentElement.getAttribute('quick-edit') === 'true') return;
      const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      if (event.button !== 0 || modified) return;
      event.preventDefault();
      submit();
    });
  }
  const entries = [...menu.children];
  entries.forEach((cell) => {
    cell.classList.add('navigation-item');
    const [title, ...fields] = cell.children;
    if (title) ownField(title, 'navigation-title');
    if (!fields.length) return;
    cell.classList.add('has-submenu');
    const submenu = doc.createElement('div');
    submenu.className = 'navigation-submenu';
    submenu.append(...fields);
    const toggle = doc.createElement('button');
    toggle.type = 'button';
    toggle.className = 'navigation-expand';
    toggle.setAttribute('aria-label', `Show ${title.textContent.trim()} menu`);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      const open = !cell.classList.contains('is-open');
      entries.forEach((entry) => {
        entry.classList.remove('is-open');
        entry.querySelector('.navigation-expand')?.setAttribute('aria-expanded', 'false');
      });
      cell.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    cell.append(toggle, submenu);
  });
  block.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = menu.querySelector('.is-open');
    open?.classList.remove('is-open');
    const toggle = open?.querySelector('.navigation-expand');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.focus();
    block.classList.remove('menu-open');
    mobileButton.setAttribute('aria-expanded', 'false');
  });
  block.dataset.decorated = 'true';
}
