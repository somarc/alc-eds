import { ownField } from '../../scripts/media-fields.js';
import {
  allowsBackgroundMotion, resolveVideoSource, selectPlayableVideo,
} from '../../scripts/video-policy.js';

/** Canonical media/link/copy nodes stay intact; the player is a disposable enhancement. */
export default function decorate(block, options = {}) {
  if (block.dataset.decorated) return;
  const doc = block.ownerDocument;
  const win = doc.defaultView;
  const rows = [...block.children];
  const links = [...block.querySelectorAll('a[href]')]
    .filter((a) => resolveVideoSource(a.getAttribute('href'), doc.location.href));
  const sourceRows = rows.filter((row) => links.some((link) => row.contains(link)));
  const codecs = {
    h264: 'video/mp4; codecs="avc1.64001f"',
    vp9: 'video/mp4; codecs="vp09.00.31.08"',
  };
  const sources = links.map((link) => {
    const row = sourceRows.find((item) => item.contains(link));
    const url = resolveVideoSource(link.getAttribute('href'), doc.location.href);
    if (row.children.length === 1) return url;
    const codec = row.firstElementChild.textContent.toLowerCase().replace(/[^a-z0-9]/g, '');
    return { url, type: codecs[codec] };
  });
  const posterRow = rows.find((row) => row.querySelector('img'));
  const copyRow = rows.find((row) => row.querySelector('h1')) || rows.at(-1);
  if (sourceRows.length) {
    const sourceGroup = doc.createElement('div');
    sourceGroup.className = 'video-sources';
    sourceRows[0].before(sourceGroup);
    sourceRows.forEach((row) => {
      row.classList.add('video-source');
      sourceGroup.append(row);
    });
  }
  posterRow?.classList.add('video-poster');
  copyRow?.classList.add('video-copy');
  const poster = posterRow?.querySelector('img');
  if (poster) {
    poster.loading = 'eager';
    poster.fetchPriority = 'high';
    const cell = posterRow.firstElementChild;
    [...cell.children].forEach((field) => ownField(field, 'video-poster-field'));
  }
  let seenTitle = false;
  [...(copyRow?.firstElementChild?.children || [])].forEach((field) => {
    let role = 'video-description';
    if (field.tagName === 'H1') { role = 'video-title'; seenTitle = true; } else if (!seenTitle) role = 'video-eyebrow';
    else if (field.querySelector('a')) role = 'video-actions';
    else if (field.querySelector('em')) role = 'video-note';
    ownField(field, role);
  });
  block.dataset.decorated = 'true';
  block.dataset.playback = 'static';
  const authoring = doc.documentElement.getAttribute('quick-edit') === 'true';
  if (authoring || !links.length || !poster) return;
  const probe = doc.createElement('video');
  const source = selectPlayableVideo(
    sources,
    (type) => probe.canPlayType(type),
  );
  if (!source) {
    block.dataset.playback = 'unavailable';
    block.dataset.videoError = 'unsupported-codec';
    return;
  }
  block.dataset.videoFormat = new URL(source).pathname.split('.').at(-1);

  const motion = options.motion || win.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = options.connection ?? win.navigator.connection;
  const controller = new win.AbortController();
  const { signal } = controller;
  const state = {
    reducedMotion: motion.matches,
    ready: false,
    userPaused: false,
    blocked: false,
    visible: false,
    failed: false,
    destroyed: false,
  };
  let video;
  let intersection;
  let lifecycle;
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'video-motion-control';
  button.textContent = 'Play animation';
  button.hidden = true;
  block.append(button);
  const permitted = () => allowsBackgroundMotion({
    authoring, reducedMotion: state.reducedMotion, saveData: connection?.saveData,
  });
  const updateButton = () => {
    button.hidden = !state.ready || !permitted() || state.failed;
    const playing = video && !video.paused;
    button.textContent = playing ? 'Pause animation' : 'Play animation';
    button.setAttribute('aria-label', playing ? 'Pause background animation' : 'Play background animation');
  };
  const removeVideo = () => {
    const old = video;
    video = undefined;
    if (old) {
      old.pause();
      old.removeAttribute('src');
      old.load();
      old.remove();
    }
    block.classList.remove('video-has-frame');
  };
  const cleanup = () => {
    state.destroyed = true;
    controller.abort();
    intersection?.disconnect();
    lifecycle?.disconnect();
    removeVideo();
  };
  const reconcile = () => {
    if (state.destroyed) return;
    if (!block.isConnected) { cleanup(); return; }
    if (!permitted() || state.failed) {
      removeVideo();
      block.dataset.playback = state.failed ? 'unavailable' : 'static';
      updateButton();
      return;
    }
    if (!state.ready || !state.visible || doc.hidden || state.userPaused) {
      video?.pause();
      updateButton();
      return;
    }
    if (!video) {
      const player = doc.createElement('video');
      player.className = 'video-motion';
      player.muted = true;
      player.defaultMuted = true;
      player.loop = true;
      player.playsInline = true;
      player.preload = 'none';
      player.setAttribute('aria-hidden', 'true');
      player.addEventListener('playing', () => {
        if (video !== player) return;
        block.classList.add('video-has-frame');
        block.dataset.playback = 'playing';
        updateButton();
      }, { signal });
      player.addEventListener('pause', () => {
        if (video !== player) return;
        block.dataset.playback = 'paused';
        updateButton();
      }, { signal });
      player.addEventListener('error', () => {
        if (video !== player) return;
        block.dataset.videoError = String(player.error?.code || 'unknown');
        state.failed = true;
        reconcile();
      }, { signal });
      video = player;
      block.append(player);
      player.src = source;
    }
    if (!state.blocked && video.paused) {
      const player = video;
      player.play().catch((error) => {
        if (video !== player || state.destroyed) return;
        // Visibility/user pauses can interrupt buffering; that is not an autoplay denial.
        if (error.name === 'AbortError') return;
        state.blocked = true;
        block.dataset.playback = 'paused';
        updateButton();
      });
    }
    updateButton();
  };
  button.addEventListener('click', () => {
    if (video && !video.paused) state.userPaused = true;
    else { state.userPaused = false; state.blocked = false; }
    reconcile();
  }, { signal });
  motion.addEventListener('change', (event) => {
    state.reducedMotion = event.matches;
    reconcile();
  }, { signal });
  connection?.addEventListener?.('change', reconcile, { signal });
  doc.addEventListener('visibilitychange', reconcile, { signal });
  intersection = new win.IntersectionObserver(([entry]) => {
    state.visible = entry.isIntersecting;
    reconcile();
  }, { threshold: 0.01 });
  intersection.observe(block);
  lifecycle = new win.MutationObserver(() => { if (!block.isConnected) cleanup(); });
  lifecycle.observe(doc.documentElement, { childList: true, subtree: true });
  // The canonical poster gets the first paint; the film starts only afterward.
  Promise.all([poster.decode().catch(() => {}), doc.fonts.ready]).then(() => {
    win.requestAnimationFrame(() => win.requestAnimationFrame(() => {
      if (state.destroyed) return;
      state.ready = true;
      reconcile();
    }));
  });
}
