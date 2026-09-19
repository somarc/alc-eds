import assert from 'node:assert/strict';
import test from 'node:test';
import { allowsBackgroundMotion, resolveVideoSource, selectPlayableVideo } from '../scripts/video-policy.js';

test('authoring, reduced motion and Save-Data suppress automatic video', () => {
  assert.equal(allowsBackgroundMotion(), true);
  for (const key of ['authoring', 'reducedMotion', 'saveData']) {
    assert.equal(allowsBackgroundMotion({ [key]: true }), false);
  }
});

test('a browser without H.264 selects the supplied VP9 alternative', () => {
  const sources = ['https://example.com/film.mp4', 'https://example.com/film.webm'];
  assert.equal(selectPlayableVideo(sources, (type) => (type.includes('vp9') ? 'probably' : '')), sources[1]);
  assert.equal(selectPlayableVideo(sources, () => 'probably'), sources[0]);
  assert.equal(selectPlayableVideo(sources, () => ''), null);
});

test('explicit authored codec rows support VP9 in an MP4 container', () => {
  const sources = [
    { url: 'https://example.com/h264.mp4', type: 'video/mp4; codecs="avc1.64001f"' },
    { url: 'https://example.com/vp9.mp4', type: 'video/mp4; codecs="vp09.00.31.08"' },
  ];
  assert.equal(selectPlayableVideo(sources, (type) => (type.includes('vp09') ? 'probably' : '')), sources[1].url);
});

test('only ordinary HTTP(S) video links become media sources', () => {
  const base = 'https://example.aem.page/how-we-built-this';
  assert.equal(resolveVideoSource('./media_loop.mp4', base), 'https://example.aem.page/media_loop.mp4');
  assert.equal(resolveVideoSource('/film.webm?version=1', base), 'https://example.aem.page/film.webm?version=1');
  for (const value of ['', 'javascript:alert(1)', 'data:video/mp4;base64,test', '/image.jpg', 'https://user:pass@example.com/film.mp4']) {
    assert.equal(resolveVideoSource(value, base), null);
  }
});
