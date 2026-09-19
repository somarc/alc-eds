export function allowsBackgroundMotion({ authoring, reducedMotion, saveData } = {}) {
  return !authoring && !reducedMotion && !saveData;
}

export function resolveVideoSource(value, baseURL) {
  if (!value) return null;
  try {
    const url = new URL(value, baseURL);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    return /\.(mp4|webm|ogg)$/i.test(url.pathname) ? url.href : null;
  } catch {
    return null;
  }
}

export function selectPlayableVideo(sources, canPlayType) {
  const types = {
    mp4: 'video/mp4; codecs="avc1.64001f"',
    webm: 'video/webm; codecs="vp9"',
    ogg: 'video/ogg; codecs="theora"',
  };
  return sources.find((source) => {
    const extension = new URL(source).pathname.split('.').at(-1).toLowerCase();
    return types[extension] && !!canPlayType(types[extension]);
  }) || null;
}
