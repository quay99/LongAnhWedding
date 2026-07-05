import fs from 'fs';
import path from 'path';
import vm from 'vm';

// Mock minimal DOM environment
global.window = {
  location: {
    search: '?to=TestGuest&side=nhatrai',
    pathname: '/nhatrai',
    origin: 'http://localhost'
  },
  history: {
    replaceState: () => {}
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  innerHeight: 800,
  innerWidth: 1200,
  scrollY: 0,
  getComputedStyle: () => ({ display: 'block' }),
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  matchMedia: () => ({ matches: false })
};

global.document = {
  title: '',
  body: {
    appendChild: () => {},
    style: {}
  },
  addEventListener: (event, callback) => {
    if (event === 'DOMContentLoaded') {
      global.triggerDOMContentLoaded = callback;
    }
  },
  removeEventListener: () => {},
  getElementById: (id) => {
    console.log(`[DOM] getElementById: ${id}`);
    if (id === 'dyn-groom-photo') return { src: '', setAttribute: () => {} };
    if (id === 'dyn-bride-photo') return { src: '', setAttribute: () => {} };
    if (id === 'bg-music') return { setAttribute: () => {}, play: () => Promise.resolve() };
    if (id === 'dyn-browser-title') return {};
    if (id === 'dyn-hero-couple-names') return {};
    if (id === 'dyn-footer-names') return {};
    if (id === 'dyn-hero-bg') return { style: {} };
    if (id === 'dyn-hero-wedding-date') return {};
    if (id === 'dyn-groom-name') return {};
    if (id === 'dyn-groom-fb') return {};
    if (id === 'dyn-bride-name') return {};
    if (id === 'dyn-bride-fb') return {};
    if (id === 'dyn-vuquy-time') return {};
    if (id === 'dyn-vuquy-lunar') return {};
    if (id === 'dyn-vuquy-venue') return {};
    if (id === 'dyn-vuquy-address') return {};
    if (id === 'dyn-vuquy-map-link') return {};
    if (id === 'dyn-vuquy-cal-link') return {};
    if (id === 'dyn-thanhhon-time') return {};
    if (id === 'dyn-thanhhon-lunar') return {};
    if (id === 'dyn-thanhhon-venue') return {};
    if (id === 'dyn-thanhhon-address') return {};
    if (id === 'dyn-thanhhon-map-link') return {};
    if (id === 'dyn-thanhhon-cal-link') return {};
    if (id === 'dyn-story-1-date') return {};
    if (id === 'dyn-story-1-title') return {};
    if (id === 'dyn-story-1-desc') return {};
    if (id === 'dyn-story-2-date') return {};
    if (id === 'dyn-story-2-title') return {};
    if (id === 'dyn-story-2-desc') return {};
    if (id === 'dyn-story-3-date') return {};
    if (id === 'dyn-story-3-title') return {};
    if (id === 'dyn-story-3-desc') return {};
    if (id === 'dyn-story-4-date') return {};
    if (id === 'dyn-story-4-title') return {};
    if (id === 'dyn-story-4-desc') return {};
    if (id === 'dyn-gallery-grid') return { innerHTML: '', appendChild: () => {} };
    if (id === 'personalized-greeting') return { style: {} };
    if (id === 'greeting-guest-name') return {};
    if (id === 'rsvp-name') return {};
    if (id === 'calendar-days-grid') return { innerHTML: '' };
    if (id === 'calendar-header-month') return {};
    if (id === 'cd-days') return {};
    if (id === 'cd-hours') return {};
    if (id === 'cd-minutes') return {};
    if (id === 'cd-seconds') return {};
    if (id === 'music-player-btn') return { addEventListener: () => {} };
    if (id === 'theme-switcher') return { addEventListener: () => {} };
    if (id === 'theme-toggle-btn') return { addEventListener: () => {} };
    if (id === 'particle-toggle-btn') return { addEventListener: () => {} };
    if (id === 'falling-canvas') return { getContext: () => ({}) };
    if (id === 'custom-lightbox') return {};
    if (id === 'lightbox-img') return { setAttribute: () => {} };
    if (id === 'wedding-rsvp-form') return { addEventListener: () => {} };
    if (id === 'wishes-wrapper') return { innerHTML: '', appendChild: () => {} };
    return null;
  },
  querySelector: (sel) => {
    console.log(`[DOM] querySelector: ${sel}`);
    if (sel === '.hero-countdown') return { innerHTML: '' };
    if (sel === '.lightbox-close') return {};
    if (sel === '.lightbox-btn-prev') return {};
    if (sel === '.lightbox-btn-next') return {};
    if (sel === '.nav-indicator') return { style: {} };
    return null;
  },
  querySelectorAll: (sel) => {
    console.log(`[DOM] querySelectorAll: ${sel}`);
    if (sel === '.theme-option') return [];
    if (sel === '.reveal') return [];
    if (sel === '.filter-btn') return [];
    if (sel === '.gallery-item') return [];
    if (sel === '.nav-item') return [];
    return [];
  },
  createElement: () => ({ style: {} })
};

global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

global.URLSearchParams = class {
  constructor() {
    this.params = { to: 'Guest', side: 'nhatrai' };
  }
  get(key) { return this.params[key]; }
  has(key) { return !!this.params[key]; }
  delete(key) { delete this.params[key]; }
};

global.IntersectionObserver = class {
  observe() {}
};

global.DEFAULT_WEDDING_CONFIG = {
  wedding_date: "2026-02-08T10:00:00.000Z",
  music_url: "https://files.catbox.moe/n121p0.mp3",
  groom_name: "Đình Long",
  groom_fullname: "Lê Đình Long",
  groom_photo: "CD ANH/Page.jpg",
  bride_name: "Trần Ánh",
  bride_fullname: "Trần Thị Ánh",
  bride_photo: "CD ANH/pw1.jpg",
  gallery_images: []
};

// Load scripts
console.log('Loading js/config.js...');
const configCode = fs.readFileSync('js/config.js', 'utf8');
vm.runInThisContext(configCode);

console.log('Loading js/script.js...');
const scriptCode = fs.readFileSync('js/script.js', 'utf8');

try {
  vm.runInThisContext(scriptCode);
  console.log('Script parsed successfully!');
  
  if (global.triggerDOMContentLoaded) {
    console.log('Triggering DOMContentLoaded...');
    global.triggerDOMContentLoaded();
    console.log('DOMContentLoaded triggered successfully!');
  } else {
    console.log('DOMContentLoaded listener not registered.');
  }
} catch (err) {
  console.error('CRITICAL RUNTIME ERROR:', err);
}
