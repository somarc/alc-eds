import { loadPage } from '../scripts/scripts.js';

// Loaded only by the local validation harness, never by a published page.
window.alcTestLoadPage = loadPage;
