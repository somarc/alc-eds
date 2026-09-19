import { ownField } from '../../scripts/media-fields.js';
import { getDemoTarget } from '../../scripts/demo-routing.js';

export default function decorate(block) {
  if (block.dataset.decorated) return;
  const [subscribe, social, links, legal] = block.children;
  [subscribe, social, links, legal].forEach((row, i) => row?.classList.add(['footer-subscribe', 'footer-social', 'footer-links', 'footer-legal'][i]));
  if (subscribe?.children[1]) {
    const input = block.ownerDocument.createElement('input');
    input.type = 'email';
    input.placeholder = 'Enter your email address';
    input.setAttribute('aria-label', 'Email subscription is available on the official Atlantic Lottery site');
    input.disabled = true;
    input.title = 'Migration preview: subscription is not connected. Use the Subscribe link to visit alc.ca.';
    if (getDemoTarget(block.ownerDocument)) {
      input.setAttribute('aria-label', 'Demonstration only: email signup is not enabled');
      input.title = 'This demonstration opens the build story instead of collecting email addresses.';
    }
    subscribe.children[1].classList.add('footer-subscribe-action');
    subscribe.children[1].prepend(input);
  }
  if (links) {
    [...links.children].forEach((column) => {
      column.classList.add('footer-column');
      const heading = column.querySelector('h3');
      if (!heading) return;
      const details = block.ownerDocument.createElement('details');
      const summary = block.ownerDocument.createElement('summary');
      const content = block.ownerDocument.createElement('div');
      content.className = 'footer-column-content';
      summary.append(heading);
      content.append(...column.childNodes);
      details.append(summary, content);
      details.open = window.matchMedia('(min-width: 75em)').matches;
      column.append(details);
    });
  }
  if (legal) {
    [...legal.children].forEach((cell, i) => cell.classList.add(['footer-partners', 'footer-policies', 'footer-certifications', 'footer-copyright'][i] || 'footer-extra'));
    [...legal.querySelectorAll(':scope > div > p, :scope > div > h3')].forEach((field) => {
      let role = 'footer-legal-copy';
      if (field.querySelector('img')) role = 'footer-legal-logos';
      else if (field.querySelector('a')) role = 'footer-legal-links';
      else if (field.textContent.startsWith('Migration preview')) role = 'footer-preview-notice';
      const owner = ownField(field, role);
      if (role === 'footer-preview-notice') legal.append(owner);
    });
  }
  block.dataset.decorated = 'true';
}
