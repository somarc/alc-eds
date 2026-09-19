import assert from 'node:assert/strict';
import test from 'node:test';
import { allowsBackgroundMotion, resolveVideoSource } from '../scripts/video-policy.js';

test('authoring, reduced motion and Save-Data suppress automatic video', () => {
  assert.equal(allowsBackgroundMotion(), true);
  for (const key of ['authoring', 'reducedMotion', 'saveData']) {
    assert.equal(allowsBackgroundMotion({ [key]: true }), false);
  }
});

test('only ordinary HTTP(S) video links become media sources', () => {
  const base = 'https://example.aem.page/how-we-built-this';
  assert.equal(resolveVideoSource('./media_loop.mp4', base), 'https://example.aem.page/media_loop.mp4');
  assert.equal(resolveVideoSource('/film.webm?version=1', base), 'https://example.aem.page/film.webm?version=1');
  for (const value of ['', 'javascript:alert(1)', 'data:video/mp4;base64,test', '/image.jpg', 'https://user:pass@example.com/film.mp4']) {
    assert.equal(resolveVideoSource(value, base), null);
  }
});
