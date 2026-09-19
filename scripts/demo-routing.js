/** Demo navigation is explicit page configuration, not a global click hijack. */
export function normalizeDemoTarget(value, pageURL) {
  if (!value?.startsWith('/') || value.startsWith('//')) return null;
  try {
    const page = new URL(pageURL);
    const target = new URL(value, page);
    if (target.origin !== page.origin || target.search || target.hash) return null;
    return target.pathname;
  } catch {
    return null;
  }
}

export function getDemoTarget(doc = document) {
  const value = doc.querySelector('meta[name="demo-destination"]')?.content.trim();
  return normalizeDemoTarget(value, doc.location.href);
}

export function demoHref(href, target, pageURL) {
  if (!target || !href || href.startsWith('#')) return href;
  try {
    const page = new URL(pageURL);
    const link = new URL(href, page);
    const sameOrigin = link.origin === page.origin;
    const home = ['/', '/index', '/index.html'].includes(link.pathname);
    if (sameOrigin && home && !link.search) return href;
    if (sameOrigin && link.pathname === page.pathname && link.hash
      && link.search === page.search) return href;
  } catch { /* An unparseable off-home destination still belongs in the demo story. */ }
  return target;
}

function linkRole(href, pageURL) {
  try {
    const url = new URL(href, pageURL);
    if (url.pathname.endsWith('/cart.html')) return 'cart';
    if (url.pathname.endsWith('/help-redirect.html')) return 'help';
    if (/(^|\.)facebook\.com$/.test(url.hostname)) return 'facebook';
    if (/(^|\.)instagram\.com$/.test(url.hostname)) return 'instagram';
  } catch { /* No presentation role for malformed destinations. */ }
  return '';
}

/** Preserve canonical DA hrefs in Canvas; change real native links in the demo. */
export function routeDemoLinks(root) {
  const doc = root.ownerDocument || root;
  if (doc.documentElement.getAttribute('quick-edit') === 'true') return 0;
  const target = getDemoTarget(doc);
  if (!target) return 0;
  let changed = 0;
  root.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    const next = demoHref(href, target, doc.location.href);
    if (next === href) return;
    const role = linkRole(href, doc.location.href);
    if (role) link.dataset.demoRole = role;
    link.href = next;
    link.dataset.demoRouted = 'true';
    link.removeAttribute('download');
    changed += 1;
  });
  return changed;
}
