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
