import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  const fragment = await loadFragment('/nav');
  if (fragment) block.append(...fragment.children);
}
