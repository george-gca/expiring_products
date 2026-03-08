# Copilot Instructions — Expiring Products

## Project Summary

Expiring Products is a Jekyll-based Progressive Web App (PWA) for tracking pantry items with expiration dates. It uses Firebase Firestore for real-time cloud synchronization and Firebase Authentication (email/password) for user accounts. The app is multi-language (Portuguese pt-br default, English en-us) via Jekyll Polyglot. It is deployed to Netlify from the `_site/` build output.

**Stack:** Ruby 3.4.5, Jekyll 4.4.1, Bundler 2.7.2, Node.js 22.x, npm 11.x. Frontend is vanilla JavaScript (ES6+) embedded in Liquid templates, Bootstrap 5.3.3, MDB UI Kit 8.0.0, Luxon 3.5.0, Fuse.js 7.1.0, Font Awesome 6.6.0, Firebase SDK 9.6.7 (compat). No test framework — all testing is manual via browser.

---

## Bootstrap & Build

Always run these steps in order when setting up or after dependency changes:

```bash
bundle install   # Install Ruby gems (required first)
npm install      # Install Node.js dependencies (Firebase SDK)
```

Build the static site (output goes to `_site/`):

```bash
bundle exec jekyll build
```

Build completes in under 1 second. Non-fatal warnings about `Jekyll Minifier: Filtering out legacy 'harmony' option` are expected and harmless — do not treat them as errors.

Start the development server (available at `http://localhost:4000`):

```bash
bundle exec jekyll serve --livereload
```

**Never edit files in `_site/` directly.** It is gitignored and fully regenerated on every build.

### Environment variables

Firebase credentials are loaded from a `.env` file at repo root via the `jekyll-dotenv` plugin. The file is gitignored. The build succeeds without it (empty Liquid substitutions), but Firebase will not function at runtime without valid values:

```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

---

## Linting & CI

### Prettier (CI + pre-commit)

A GitHub Actions workflow (`.github/workflows/prettier.yml`) runs on every push and PR to `main`. It auto-formats changed files using Prettier. Targeted file types: `css, html, js, json, md, scss, yaml, yml`. Ignore patterns are in `.prettierignore` (excludes map files, minified files, `.jekyll-cache/`).

The pre-commit hook (`.pre-commit-config.yaml`) also runs Prettier on staged files of those types via `run_on_code_changed.sh`. Prettier is not a local `package.json` dependency — it runs via `npx`.

To manually check formatting:

```bash
npx prettier --check "**/*.{css,html,js,json,md,scss,yaml,yml}"
```

To auto-fix formatting:

```bash
npx prettier --write "**/*.{css,html,js,json,md,scss,yaml,yml}"
```

### Markdownlint

Documentation files (`*.md`) can be validated with:

```bash
npx markdownlint-cli2 *.md
```

Use `markdownlint-cli2`, not `markdownlint` (the latter is not resolvable via npx in this repo). To auto-fix:

```bash
npx markdownlint-cli2 --fix *.md
```

---

## Architecture & Key File Locations

```
_config.yml                    # Jekyll config: plugins, library CDN URLs/versions, i18n
Gemfile / Gemfile.lock         # Ruby gem dependencies
package.json                   # Node.js deps (Firebase SDK only)
expiring_products.webmanifest  # PWA manifest
.env                           # Firebase credentials (gitignored)
.pre-commit-config.yaml        # Pre-commit: Prettier on staged files
.github/workflows/prettier.yml # CI: Prettier on PRs/pushes to main

_layouts/
  base.liquid                  # Single base layout: auth UI, tab skeleton, includes

_includes/
  script.liquid                # Firebase init, auth state observer, global JS state
  external_scripts.liquid      # CDN <script> tags for all third-party libraries
  settings_tab.liquid          # Settings/Options tab HTML
  add_item_modal.liquid        # Add item modal HTML
  edit_item_modal.liquid       # Edit item modal HTML
  head.liquid                  # <head> section
  scripts/
    db.js.liquid               # Firestore CRUD, real-time listeners, transactions
    ui.js.liquid               # UI event handlers, auth flow, item actions
    utils.js.liquid            # Sorting, filtering, Service Worker registration

_pages/
  en-us/main.md                # English localized strings (frontmatter only)
  pt-br/main.md                # Portuguese localized strings (frontmatter only)

_sass/
  layout.scss                  # Custom SCSS (Bootstrap-first, mobile-responsive)

assets/
  css/main.scss                # Main stylesheet entry
  js/sw.js                     # Service Worker (cache-first PWA caching)
  js/backup-and-restore-data.mjs  # Firestore JSON export/import (ES module)

_site/                         # Generated output — never edit, fully gitignored
```

### Third-party library versions

All CDN URLs, versions, and SRI integrity hashes are defined in `_config.yml` under `third_party_libraries`. Reference them in Liquid as `{{ site.third_party_libraries.LIBNAME.url.js }}`. Always update versions there, not in template files.

### JavaScript embedded in Liquid templates

Files in `_includes/scripts/*.js.liquid` contain vanilla JavaScript with Liquid interpolation. Jekyll processes `{{ }}` and `{% %}` tags first at build time, then outputs plain JavaScript. Firebase credentials, locale strings, and library URLs are injected this way. Use `{{ page.VARIABLE }}` for localized strings and `{{ site.env.VARIABLE }}` for environment variables. Be careful not to accidentally create Liquid syntax conflicts when editing these files.

### Global state

The following `window.*` globals are set in `_includes/script.liquid` and consumed across all script includes:

- `window.userCategories` — array of category objects
- `window.itemsByCategory` — items indexed by category key
- `window.sortedItemsByCategory` — sorted arrays per category
- `window.fuseByCategory` — Fuse.js instances per category
- `window.categoryListeners` — Firestore unsubscribe functions
- `window.sortingPreferences`, `window.sortingDirections`, `window.filteringPreferences`, `window.showHiddenItems`

### Internationalization

Always update both `_pages/en-us/main.md` and `_pages/pt-br/main.md` when adding new UI strings. New strings go in the frontmatter of both files. Template references use `{{ page.YOUR_KEY }}`.

### Service Worker cache versioning

When modifying `assets/js/sw.js` or adding new cached assets, increment the cache version string (e.g., `"expiring-products-v2"`) to force cache refresh for existing users.

---

## Validation Checklist

After making changes, run these to validate:

1. `bundle exec jekyll build` — must complete without errors (warnings about harmony are OK)
2. `npx prettier --check "**/*.{css,html,js,json,md,scss,yaml,yml}"` — must report no issues
3. Manual browser test at `http://localhost:4000` with `bundle exec jekyll serve`
4. Test both language URLs: `/` (pt-br default) and `/en-us/`

Trust these instructions. Only search the codebase if information here appears incomplete or incorrect.
