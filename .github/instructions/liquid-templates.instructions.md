---
applyTo: "_includes/**/*.liquid,_layouts/**/*.liquid"
---

# Liquid Template Instructions

## JavaScript embedded in Liquid

Files in `_includes/scripts/*.js.liquid` contain **vanilla JavaScript with Liquid interpolation**. Jekyll processes `{{ }}` and `{% %}` tags at build time before outputting plain JavaScript. Follow these rules to avoid breaking the build:

- **Do not use `{{` or `}}` in JavaScript string literals** — they will be interpreted as Liquid tags and cause build errors. Use string concatenation or template literals with single braces if you need brace characters in output.
- **Liquid tags render at build time** — any `{{ page.VAR }}` or `{{ site.env.VAR }}` is replaced with a static string in the built output.
- `{{ page.VARIABLE }}` — injects localized strings (defined in `_pages/[lang]/main.md` frontmatter)
- `{{ site.env.VARIABLE }}` — injects environment variables from `.env` (e.g., Firebase credentials)
- `{{ site.third_party_libraries.LIBNAME.url.js }}` — injects CDN URLs from `_config.yml`
- `{{ site.active_lang }}` — current language (`en-us` or `pt-br`)

## Script file responsibilities

- `_includes/script.liquid` — Firebase app init, `auth.onAuthStateChanged`, all `window.*` global state setup
- `_includes/scripts/db.js.liquid` — All Firestore CRUD, real-time listeners, transactions
- `_includes/scripts/ui.js.liquid` — UI events, auth flow (login/signup/logout), item actions (open/consume/discard), category management
- `_includes/scripts/utils.js.liquid` — Sorting, filtering, Fuse.js search, Service Worker registration

## Adding new UI strings

Any string shown in the UI must be defined as a Liquid variable from the page frontmatter. Never hardcode English text directly; instead:

1. Add the key to `_pages/en-us/main.md` frontmatter
2. Add the translated key to `_pages/pt-br/main.md` frontmatter
3. Reference it in templates as `{{ page.YOUR_KEY }}`

## Firebase SDK usage

The project uses Firebase SDK **9.6.7 in compat mode** (not the modular SDK). Use the `firebase.firestore()` and `firebase.auth()` global namespace — not `import { getFirestore }` style imports. The `currentUser` variable holds the authenticated Firebase user.

## Firestore data path

All user data lives under `users/{currentUser.uid}/`. Sub-collections: `categories`, `items`, `item_history`, `statistics`.

## Global state (`window.*`)

These globals are initialized in `script.liquid` and used across all script files:

- `window.userCategories` — `[{key, name, emoji, order}]`
- `window.itemsByCategory` — `{[categoryKey]: [item, ...]}`
- `window.sortedItemsByCategory` — sorted copy of above
- `window.fuseByCategory` — `{[categoryKey]: FuseInstance}`
- `window.categoryListeners` — `{[categoryKey]: unsubscribeFn}`
- `window.sortingPreferences`, `window.sortingDirections`, `window.filteringPreferences`, `window.showHiddenItems`
