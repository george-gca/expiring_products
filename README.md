# Expiring Products

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://expiring-products.netlify.app/)

A smart, offline-first web application to track and manage expiring products in your pantry and medicine cabinet. Built as a Progressive Web App (PWA) with multilingual support (Portuguese and English), it runs entirely in your browser with no server or account required.

**🌐 Live Demo:** [expiring-products.netlify.app](https://expiring-products.netlify.app/)

## Why Use This?

- **🔒 Privacy-First:** All data stays in your browser using IndexedDB
- **📱 Works Offline:** Install as a PWA and use without internet
- **🌍 Multilingual:** Full support for Portuguese (pt-br) and English (en-us)
- **⚡ Smart Tracking:** Automatic expiration warnings and intelligent sorting
- **💾 Backup Ready:** Export/import your data as JSON anytime
- **🎯 No Login Required:** Start using immediately, no account needed

## Quick Start

1. Visit [expiring-products.netlify.app](https://expiring-products.netlify.app/)
2. Click the "+" button to add your first product
3. Enter product name, quantity, and expiration date
4. Optional: Set "duration after opened" for items that expire quickly after opening

Your data is automatically saved in your browser and persists across sessions.

## Features

### Core Functionality

- **Product Management**

  - Add items with name, quantity, and expiration date
  - Separate tabs for Foods and Medicines
  - Auto-complete from product history with saved duration values
  - Mark items as opened, consumed, or discarded

- **Smart Expiration Tracking**

  - Items sorted by expiration date (closest first), then by quantity
  - Visual warnings: Red for expired items, yellow for items expiring within 3 days
  - Automatic expiration date update when items are opened (based on "duration after opened")
  - Daily automatic checks for expired items

- **Data Management**

  - Export entire database as JSON file
  - Import previously exported data
  - Local storage using IndexedDB (no server required)
  - Product history tracking for quick re-entry

- **Progressive Web App**

  - Install on desktop and mobile devices
  - Works completely offline
  - Responsive Bootstrap 5 + MDB UI Kit design
  - Service worker caching for performance

- **Multilingual Support**
  - Portuguese (pt-br) - default
  - English (en-us)
  - Easy language switching in settings

## Installing as PWA

Install the app on your device for offline access and a native app experience. Click the install icon in your browser's address bar (desktop) or use "Add to Home screen" from the browser menu (mobile).

![Desktop Installation](./readme_img/install_pwa_desktop.png)
![Mobile Installation](./readme_img/install_pwa_mobile.jpg)

For detailed installation steps, see the [USER_GUIDE.md](USER_GUIDE.md#installing-as-an-app).

## Technology Stack

- **Jekyll** + Liquid templating - Static site generation
- **Bootstrap 5.3.3** + MDB UI Kit 8.0.0 - UI framework
- **Luxon 3.5.0** - Date/time manipulation
- **IndexedDB** - Client-side data storage
- **Service Worker** - Offline functionality
- **Jekyll Polyglot** - Multi-language support

## Project Structure

```text
├── _includes/          # Liquid partials and embedded JavaScript
│   ├── scripts/        # Core application logic (db, ui, utils)
│   └── *.liquid        # UI components (modals, tabs)
├── _layouts/           # Page layouts
├── _pages/             # Multilingual content (en-us, pt-br)
├── assets/             # Images, JS, service worker
└── _config.yml         # Jekyll configuration
```

## For Developers

Want to contribute or run locally? See **[DEVELOPMENT.md](DEVELOPMENT.md)** for setup instructions, contribution guidelines, and coding standards.

## Documentation

- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete user manual
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Developer setup and contribution guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture details

## Browser Compatibility

Requires modern browsers with IndexedDB, Service Workers, and ES6+ JavaScript support.
Tested on Chrome and Firefox (latest versions).

## Privacy & Data

All data is stored locally in your browser's IndexedDB.
No information is sent to external servers.
Export your data anytime from the Settings tab.

## License

See [LICENSE](LICENSE) file for details.

## Author

Created by [George](https://github.com/george-gca)

## Acknowledgments

- [Bootstrap](https://getbootstrap.com/) & [MDB UI Kit](https://mdbootstrap.com/) - UI components
- [Luxon](https://moment.github.io/luxon/) - Date/time library
- [IndexedDB Backup/Restore utilities](https://gist.github.com/loilo/ed43739361ec718129a15ae5d531095b)
