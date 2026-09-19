import assert from 'node:assert/strict';
import test from 'node:test';
import { demoHref, normalizeDemoTarget, routeDemoLinks } from '../scripts/demo-routing.js';

const page = 'https://migration-fidelity--alc-eds--somarc.aem.page/';
const target = '/how-we-built-this';

test('demo target must be a same-origin path without query or fragment', () => {
  assert.equal(normalizeDemoTarget(target, page), target);
  [undefined, '', '//other.example/path', 'https://other.example/path', '/story?q=x', '/story#x', '/\\other.example'].forEach((value) => {
    assert.equal(normalizeDemoTarget(value, page), null);
  });
});

test('home and local fragment navigation remain native', () => {
  ['/', '/index', '/index.html', '#main', '/#main', page].forEach((href) => {
    assert.equal(demoHref(href, target, page), href);
  });
});

test('off-home links point at the single explainer', () => {
  ['/games', '/nav', 'https://www.alc.ca/content/alc/en.html', 'https://www.facebook.com/atlanticlottery', 'mailto:test@example.com', '?q=search'].forEach((href) => {
    assert.equal(demoHref(href, target, page), target);
  });
});

test('same-page story anchors remain in-page and rewriting is idempotent', () => {
  const story = new URL(target, page).href;
  assert.equal(demoHref(`${story}#proof`, target, story), `${story}#proof`);
  assert.equal(demoHref(target, target, page), target);
  assert.equal(demoHref('/games', null, page), '/games');
});

test('canonical hero media links are not navigation even on a demo-routed page', () => {
  const doc = {
    documentElement: { getAttribute: () => null },
    querySelector: () => ({ content: target }),
    location: { href: page },
  };
  const link = {
    getAttribute: () => '/media/film.mp4',
    closest: () => ({}),
    set href(value) { assert.fail(`Media source was rewritten to ${value}`); },
  };
  assert.equal(routeDemoLinks({ ownerDocument: doc, querySelectorAll: () => [link] }), 0);
});
