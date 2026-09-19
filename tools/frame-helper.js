import { loadPage } from '../scripts/scripts.js';
import decorateVideoHero from '../blocks/video-hero/video-hero.js';

// Loaded only by the local validation harness, never by a published page.
window.alcTestLoadPage = loadPage;
window.alcDecorateVideoHero = decorateVideoHero;
