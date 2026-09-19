const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
const report = (result) => {
  document.querySelector('#results').textContent = JSON.stringify(result, null, 2);
  return result;
};

async function renderAt(width, path = '/') {
  document.querySelector('#view').replaceChildren();
  const frame = document.createElement('iframe');
  frame.style.cssText = `width:${width}px;height:900px;border:0;background:white;display:block;`;
  const loaded = new Promise((resolve) => {
    frame.addEventListener('load', resolve, { once: true });
  });
  frame.src = path;
  document.querySelector('#view').append(frame);
  await loaded;
  for (let i = 0; i < 150 && !frame.contentDocument.body.dataset.pageReady; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await wait(100);
  }
  if (!frame.contentDocument.body.dataset.pageReady) throw new Error(`Page not ready at ${width}`);
  await frame.contentDocument.fonts.ready;
  return frame;
}

function geometry(frame) {
  const doc = frame.contentDocument;
  const css = frame.contentWindow.getComputedStyle.bind(frame.contentWindow);
  const box = (selector) => {
    const node = doc.querySelector(selector);
    if (!node) return null;
    const {
      x, y, width, height,
    } = node.getBoundingClientRect();
    return {
      x, y, width, height,
    };
  };
  return {
    viewport: frame.contentWindow.innerWidth,
    overflow: doc.documentElement.scrollWidth > doc.documentElement.clientWidth,
    documentHeight: doc.documentElement.scrollHeight,
    hero: box('.campaign-carousel'),
    winners: box('.winners'),
    card: box('.game-card'),
    cardMedia: box('.game-card-media'),
    cardCopy: box('.game-card-copy'),
    rail: box('.promo-rail:not(.mobile-banner)'),
    gridColumns: css(doc.querySelector('.game-cards')).gridTemplateColumns,
    sectionColumns: css(doc.querySelector('.featured-layout')).gridTemplateColumns,
    visibleCampaigns: [...doc.querySelectorAll('.campaign-slide')].filter((e) => !e.hidden).length,
    visibleWinners: [...doc.querySelectorAll('.winner-slide')].filter((e) => !e.hidden).length,
    visibleRendition: [...doc.querySelector('.campaign-slide').querySelectorAll('.rendition')].find((e) => css(e).display !== 'none')?.className,
    blocks: [...doc.querySelectorAll('main .block')].map((e) => ({ name: e.dataset.blockName, status: e.dataset.blockStatus })),
  };
}

async function runMatrix(widths = [320, 375, 390, 767, 768, 991, 992, 1199, 1200, 1440]) {
  const results = [];
  for (let index = 0; index < widths.length; index += 1) {
    const width = widths[index];
    // eslint-disable-next-line no-await-in-loop
    const frame = await renderAt(width);
    const doc = frame.contentDocument;
    const result = geometry(frame);
    doc.querySelector('.campaign-carousel .carousel-next').click();
    result.campaignNext = doc.querySelector('.campaign-carousel').dataset.selectedSlide === '1';
    doc.querySelector('.campaign-carousel .carousel-previous').click();
    result.campaignPrevious = doc.querySelector('.campaign-carousel').dataset.selectedSlide === '0';
    doc.querySelector('.winners .carousel-next').click();
    result.winnerNext = doc.querySelector('.winners').dataset.selectedSlide === '1';
    result.cardCount = doc.querySelectorAll('.game-card').length;
    result.railCount = doc.querySelectorAll('.promo-rail:not(.mobile-banner) .promo-item').length;
    result.newsletterDisabled = doc.querySelector('.footer-subscribe input').disabled;
    result.visibleBrandImages = [...doc.querySelectorAll('.nav-brand img')]
      .filter((img) => img.getBoundingClientRect().width > 0).length;
    if (width < 768) {
      const cards = doc.querySelector('.game-cards');
      cards.querySelector('.carousel-next').click();
      result.mobileCardsNext = cards.dataset.selectedSlide === '1';
      cards.querySelector('.carousel-previous').click();
      const menu = doc.querySelector('.navigation-toggle');
      menu.click();
      result.mobileMenu = menu.getAttribute('aria-expanded') === 'true';
      menu.click();
    }
    results.push(result);
  }
  return report(results);
}

async function runMarkers(width = 1200, path = '/index') {
  // /index.plain.html is valid source, but the rendered homepage is canonical at /.
  const frame = await renderAt(width, path === '/index' ? '/' : path);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  const source = await (await fetch(`${path}.plain.html`)).text();
  doc.body.innerHTML = `<header></header><main>${source}</main><footer></footer>`;
  doc.documentElement.setAttribute('quick-edit', 'true');
  const main = doc.querySelector('main');
  const fields = [...main.querySelectorAll('h1,h2,h3,h4,h5,h6,p,ul,ol,pre,blockquote')]
    .filter((e) => !e.parentElement.closest('h1,h2,h3,h4,h5,h6,p,ul,ol,pre,blockquote')
      && !e.closest('.section-metadata,.metadata'));
  fields.forEach((e, i) => { e.dataset.proseIndex = String(i + 1); });
  const images = [...main.querySelectorAll('img')];
  images.forEach((e, i) => { e.dataset.imageIndex = String(i + 1001); });
  const blocks = [...main.querySelectorAll(':scope > div > div[class]')]
    .filter((e) => !e.matches('.section-metadata,.metadata'));
  blocks.forEach((e, i) => { e.dataset.blockIndex = String(i + 2001); });
  const sourceImages = images.map((e) => e.getAttribute('src'));
  const sourceLinks = [...main.querySelectorAll('a[href]')]
    .map((link) => ({ link, href: link.getAttribute('href') }));
  const repeatedImageSources = sourceImages.filter((src, i) => sourceImages.indexOf(src) !== i);
  const helper = doc.createElement('script');
  helper.type = 'module';
  helper.nonce = 'aem';
  helper.src = '/tools/frame-helper.js';
  const helperLoaded = new Promise((resolve, reject) => {
    helper.addEventListener('load', resolve, { once: true });
    helper.addEventListener('error', reject, { once: true });
  });
  doc.head.append(helper);
  await helperLoaded;
  await win.alcTestLoadPage(doc);
  const unique = (attribute, count) => {
    const values = [...main.querySelectorAll(`[${attribute}]`)].map((e) => e.getAttribute(attribute));
    return values.length === count && new Set(values).size === count;
  };
  const before = {
    proseCount: fields.length,
    imageCount: images.length,
    blockCount: blocks.length,
    prosePreserved: fields.every((e) => main.contains(e)) && unique('data-prose-index', fields.length),
    imagesPreserved: images.every((e) => main.contains(e)) && unique('data-image-index', images.length),
    blocksPreserved: blocks.every((e) => main.contains(e)) && unique('data-block-index', blocks.length),
    authorLinksPreserved: sourceLinks.every(({ link, href }) => link.getAttribute('href') === href),
    duplicateDeliveredImageSources: repeatedImageSources,
  };
  await win.alcTestLoadPage(doc);
  before.repeatProsePreserved = fields.every((e) => main.contains(e));
  before.repeatBlockCount = main.querySelectorAll('[data-block-index]').length;
  const cardBefore = main.querySelector('.game-card-copy')?.getBoundingClientRect().height;
  fields.forEach((field) => {
    const owner = doc.createElement('div');
    owner.className = 'prosemirror-editor';
    owner.dataset.proseIndex = field.dataset.proseIndex;
    const editor = doc.createElement('div');
    editor.className = 'ProseMirror';
    editor.contentEditable = 'true';
    const semantic = field.cloneNode(true);
    semantic.removeAttribute('class');
    semantic.removeAttribute('id');
    semantic.removeAttribute('data-prose-index');
    semantic.querySelectorAll('[data-image-index]').forEach((e) => e.removeAttribute('data-image-index'));
    editor.append(semantic);
    owner.append(editor);
    field.replaceWith(owner);
  });
  const cardAfter = main.querySelector('.game-card-copy')?.getBoundingClientRect().height;
  const editors = [...main.querySelectorAll('.prosemirror-editor')];
  return report({
    ...before,
    simulatedMountedEditors: editors.length,
    cardHeightBefore: cardBefore,
    cardHeightAfter: cardAfter,
    cardGeometryPreserved: cardBefore === cardAfter,
    overflowAfterMount: doc.documentElement.scrollWidth > doc.documentElement.clientWidth,
    caveat: 'Wrapper simulation only. Real Canvas typing, canonical persistence, selection and refresh require separate testing.',
  });
}

async function runDemoJourney(width = 1200) {
  const frame = await renderAt(width);
  let doc = frame.contentDocument;
  const links = [...doc.querySelectorAll('a[href]')];
  const result = {
    anchors: links.length,
    routed: doc.querySelectorAll('[data-demo-routed="true"]').length,
    destinations: [...new Set(links.map((link) => link.getAttribute('href')))],
    icons: ['cart', 'help', 'facebook', 'instagram'].every((role) => (
      !!doc.querySelector(`[data-demo-role="${role}"]`)
    )),
    newsletterDisabled: doc.querySelector('.footer-subscribe input')?.disabled,
  };
  doc.querySelector('.campaign-carousel .carousel-next').click();
  result.campaignNext = doc.querySelector('.campaign-carousel').dataset.selectedSlide === '1';
  const activate = async (action) => {
    const loaded = new Promise((resolve) => {
      frame.addEventListener('load', resolve, { once: true });
    });
    action();
    await loaded;
    for (let i = 0; i < 150 && !frame.contentDocument.body.dataset.pageReady; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await wait(100);
    }
    doc = frame.contentDocument;
  };
  await activate(() => doc.querySelector('.game-card-action a').click());
  result.homeToStory = frame.contentWindow.location.pathname === '/how-we-built-this'
    && !!doc.querySelector('.build-blueprint');
  await activate(() => doc.querySelector('.build-masthead a[href="/"]').click());
  result.returnHome = frame.contentWindow.location.pathname === '/'
    && !!doc.querySelector('.campaign-carousel');
  const search = doc.querySelector('.nav-search input');
  search.value = 'demo query must not leave the site';
  await activate(() => search.dispatchEvent(new frame.contentWindow.KeyboardEvent('keydown', {
    key: 'Enter', bubbles: true, cancelable: true,
  })));
  result.searchToStory = frame.contentWindow.location.pathname === '/how-we-built-this';
  result.searchQueryOmitted = frame.contentWindow.location.search === '';
  const missing = await renderAt(width, '/not-a-migrated-page');
  result.unknownRouteToStory = missing.contentWindow.location.pathname === '/how-we-built-this'
    && !!missing.contentDocument.querySelector('.build-blueprint');
  result.caveat = 'Isolated real runtime; link activation is programmatic, not a full native gesture matrix.';
  return report(result);
}
window.renderAt = renderAt;
window.geometry = geometry;
window.runMatrix = runMatrix;
window.runMarkers = runMarkers;
window.runDemoJourney = runDemoJourney;
