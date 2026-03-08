# Architecture

Jekyll generates static HTML at build time. After load the app behaves as a
single-page application — no page reloads, DOM updated dynamically. All runtime
data comes from Firebase (no backend server).

## Directory map

```
_config.yml                    # Jekyll config, plugins, ALL CDN URLs & SRI hashes
Gemfile / Gemfile.lock         # Ruby gem dependencies
package.json                   # Node.js dep (Firebase SDK only)
expiring_products.webmanifest  # PWA manifest

_layouts/base.liquid           # Single page layout: auth UI, tab shell, all includes
_includes/
  head.liquid                  # <head>: meta tags, CSS links
  external_scripts.liquid      # CDN <script> tags — do not hardcode URLs here
  script.liquid                # Firebase init, auth observer, window.* globals
  settings_tab.liquid          # Options/Settings tab HTML
  add_item_modal.liquid        # Add item modal HTML
  edit_item_modal.liquid       # Edit item modal HTML
  scripts/
    db.js.liquid               # Firestore CRUD, real-time listeners, transactions
    ui.js.liquid               # UI events, auth flow, item actions, category mgmt
    utils.js.liquid            # Sorting, filtering, Fuse.js search, SW registration

_pages/en-us/main.md           # English UI strings — YAML frontmatter only
_pages/pt-br/main.md           # Portuguese UI strings — YAML frontmatter only

_sass/layout.scss              # Custom SCSS (Bootstrap-first, mobile-responsive)
assets/css/main.scss           # SCSS entry point
assets/js/sw.js                # Service Worker (cache-first PWA caching strategy)
assets/js/backup-and-restore-data.mjs  # Firestore JSON export/import (ES module)

.env                           # Firebase credentials — gitignored, never commit
.github/workflows/prettier.yml # CI: Prettier runs on push/PR to main
.pre-commit-config.yaml        # Pre-commit: Prettier on staged files

_site/                         # Generated output — NEVER edit, fully gitignored
```

## Firestore data path

All user data lives under `users/{userId}/`. Sub-collections:

- `categories` — user-defined category objects `{key, name, emoji, order}`
- `items` — all product items across categories
- `item_history` — autocomplete suggestions with remembered duration values
- `statistics` — single doc (`stats`) with per-category consumption/waste counters

Never write Firestore data outside the `users/{userId}/` path. Firestore security rules enforce per-user isolation and will reject any attempt to write elsewhere.

## Global state (`window.*`)

All globals are initialised in `_includes/script.liquid` and consumed across all
script includes. Do not introduce new global state without updating `script.liquid`.

| Global                         | Type     | Contents                           |
| ------------------------------ | -------- | ---------------------------------- |
| `window.userCategories`        | `Array`  | `[{key, name, emoji, order}]`      |
| `window.itemsByCategory`       | `Object` | `{[categoryKey]: [item, …]}`       |
| `window.sortedItemsByCategory` | `Object` | sorted copy of itemsByCategory     |
| `window.fuseByCategory`        | `Object` | `{[categoryKey]: FuseInstance}`    |
| `window.categoryListeners`     | `Object` | `{[categoryKey]: unsubscribeFn}`   |
| `window.sortingPreferences`    | `Object` | sort criteria per category         |
| `window.sortingDirections`     | `Object` | sort direction per category        |
| `window.filteringPreferences`  | `Object` | filter selection per category      |
| `window.showHiddenItems`       | `Object` | distant-expiry toggle per category |

## Real-time listeners

Each category tab has a dedicated Firestore listener registered in
`window.categoryListeners`. Always call the stored unsubscribe function and
delete the key before removing a category, to avoid memory leaks and ghost updates.

## Transactions

Item open/split operations use Firestore transactions (`db.runTransaction()`) to
prevent race conditions when splitting quantities. Use transactions for any write
sequence that must be atomic across multiple documents.

## Third-party library versions

All CDN URLs, versions, and SRI integrity hashes live in `_config.yml` under
`third_party_libraries`. Reference them in Liquid as:

```liquid
{{ site.third_party_libraries.LIBNAME.url.js }}
{{ site.third_party_libraries.LIBNAME.integrity.js }}
```

Never hardcode CDN URLs in template files. When upgrading a library, update
both the `version` and the `integrity` hash in `_config.yml`.

## Service Worker cache versioning

When modifying `assets/js/sw.js` or adding new cached assets, increment
`CACHE_NAME` (currently `"expiring-products-v3"`) to force cache invalidation
for existing users.

## Internationalization

Jekyll Polyglot builds a separate HTML file per language. The
`_pages/[lang]/main.md` frontmatter provides all UI strings via `{{ page.KEY }}`.
See [localization-pages.instructions.md](../.github/instructions/localization-pages.instructions.md)
for editing rules.

## Further reading

- `ARCHITECTURE.md` — Firestore schema detail, auth flow diagrams, full state management reference
- `DEVELOPMENT.md` — Developer setup guide and common task walkthroughs
