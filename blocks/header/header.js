import { loadFragment } from '../fragment/fragment.js';
import { routeDemoLinks } from '../../scripts/demo-routing.js';

export default async function decorate(block) {
  const fragment = await loadFragment('/nav');
  if (fragment) block.append(...fragment.children);
  routeDemoLinks(block);
}
