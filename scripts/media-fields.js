/** Keep each rendition as its own canonical image; never collapse image identity. */
export function decorateRenditions(row) {
  const [desktop, tablet, mobile, action] = row.children;
  [desktop, tablet, mobile].forEach((cell, i) => {
    if (!cell) return;
    cell.classList.add('rendition', ['rendition-desktop', 'rendition-tablet', 'rendition-mobile'][i]);
    // The reference crops native-size campaign art. Keep one canonical <img> while
    // requesting its native pixel width, rather than stretching a 750px fallback.
    cell.querySelectorAll('img[width]').forEach((img) => {
      const width = Math.min(2000, Number(img.getAttribute('width')));
      if (!width) return;
      const sized = (src) => src.replace(/([?&]width=)\d+/, `$1${width}`);
      img.closest('picture')?.querySelectorAll('source').forEach((source) => {
        source.srcset = sized(source.srcset);
      });
      img.src = sized(img.getAttribute('src'));
    });
  });
  action?.classList.add('media-action');
}

/** Role classes live outside the semantic node Canvas reconstructs. */
export function ownField(field, className) {
  const wrapper = field.ownerDocument.createElement('div');
  wrapper.className = className;
  field.before(wrapper);
  wrapper.append(field);
  return wrapper;
}
