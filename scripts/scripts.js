import {
  decorateSections, decorateBlocks, loadSections, loadHeader, loadFooter, loadCSS,
} from './aem.js';

// Keep the boilerplate's Trusted Types boundary for DA's serialized HTML.
if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const inner = window.trustedTypes.createPolicy('tt-inner', { createHTML: (s) => s });
  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      const parsed = new DOMParser().parseFromString(inner.createHTML(input), 'text/html');
      parsed.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        parsed.querySelectorAll('script').forEach((el) => el.remove());
      }
      return parsed.body.innerHTML;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/** Metadata is configuration, never an editable content surrogate. */
function prepareMetadata(main) {
  main.querySelectorAll(':scope > div > .section-metadata').forEach((metadata) => {
    [...metadata.children].forEach((row) => {
      const [key, value] = row.children;
      if (key?.textContent.trim().toLowerCase() === 'style') {
        value?.textContent.trim().split(/[\s,]+/).filter(Boolean)
          .forEach((name) => metadata.parentElement.classList.add(name));
      }
    });
    metadata.remove();
  });
  // EDS lifts this remotely. Also support the exact DA source in the local runtime.
  main.querySelectorAll(':scope > div > .metadata').forEach((metadata) => {
    const section = metadata.parentElement;
    metadata.remove();
    if (!section.children.length) section.remove();
  });
}

export function decorateMain(main) {
  if (!main || main.dataset.prepared) return;
  prepareMetadata(main);
  decorateSections(main);
  decorateBlocks(main);
  main.dataset.prepared = 'true';
}

/** Canvas calls this same, fully-awaited path after each full body replacement. */
export async function loadPage(doc = document) {
  doc.documentElement.lang = 'en';
  const main = doc.querySelector('main');
  if (!main) return;
  decorateMain(main);
  doc.body.classList.add('appear');
  await Promise.all([
    loadSections(main),
    loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`),
  ]);

  if (!doc.body.dataset.chromeLoaded) {
    doc.body.dataset.chromeLoaded = 'true';
    // The shared documents are independently editable, without recursive chrome.
    const isSharedDocument = main.querySelector('.navigation, .site-footer');
    if (!isSharedDocument) {
      await Promise.all([
        doc.querySelector('body > header') && loadHeader(doc.querySelector('body > header')),
        doc.querySelector('body > footer') && loadFooter(doc.querySelector('body > footer')),
      ]);
    }
  }
  doc.body.dataset.pageReady = 'true';
}

const params = new URLSearchParams(window.location.search);
if (['on', 'true'].includes(params.get('quick-edit'))) {
  document.documentElement.setAttribute('quick-edit', 'true');
  // No credentials: Canvas supplies its parent-controlled MessageChannel.
  // eslint-disable-next-line import/no-unresolved
  const { default: loadQuickEdit } = await import('https://da.live/nx/public/plugins/quick-edit/quick-edit.js');
  await loadQuickEdit(undefined, loadPage);
}
await loadPage();
