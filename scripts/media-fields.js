/** Keep each rendition as its own canonical image; never collapse image identity. */
export function decorateRenditions(row) {
  const [desktop, tablet, mobile, action] = row.children;
  [desktop, tablet, mobile].forEach((cell, i) => {
    if (!cell) return;
    cell.classList.add('rendition', ['rendition-desktop', 'rendition-tablet', 'rendition-mobile'][i]);
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
