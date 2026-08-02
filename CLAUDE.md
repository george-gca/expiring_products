# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack reality check (read this first)

This repo is mid-migration. The **active codebase is the React + TypeScript + Vite app in `src/`** (added in commit `3a0e7a3 feat: add React + Vite + TypeScript PWA alongside Jekyll app`). It runs *alongside*, not in place of, a legacy Jekyll + vanilla-JS PWA that still lives in `_includes/`, `_layouts/`, `_pages/`, `assets/`, `_config.yml`, `Gemfile`.

- `README.md`, `ARCHITECTURE.md`, `DEVELOPMENT.md`, `USER_GUIDE.md`, and all three files in `.github/agents/` describe the **old Jekyll/vanilla-JS stack** (Firebase, MDB UI Kit, Fuse.js, Jekyll Polyglot, etc.). They are stale with respect to `src/` and should not be trusted as a guide for React work — treat them as documentation of the legacy app being replaced, not of current architecture.
- Unless a task explicitly targets the legacy Jekyll app, work in `src/`. `eslint.config.js` deliberately ignores `assets/`, `_site/`, `public/`, and `vendor/` as legacy/generated.
- If you touch the legacy app, note it still uses Firebase and Jekyll Polyglot per `.github/agents/developer.agent.md`; that agent file is otherwise a good reference for the old stack's conventions.

## Commands (React app in `src/`)

```bash
npm install --legacy-peer-deps   # required — see gotcha below
npm run dev                      # Vite dev server
npm run build                    # tsc -b && vite build (type-check + production build)
npm run lint                     # eslint .
npm test                         # vitest run (all tests, single run)
npm run preview                  # preview production build
```

Run a single test file: `npx vitest run src/test/components/ItemCard.test.tsx`
Run tests matching a name: `npx vitest run -t "renders modal fields"`

**`npm install` gotcha:** plain `npm install` fails with an ERESOLVE conflict — `@typescript-eslint/eslint-plugin@7.x` peer-depends on `eslint@^8.56`, but `package.json` pins `eslint@^9.6.0`. Always use `--legacy-peer-deps`.

There is no CI workflow that runs lint/test/build (only `.github/workflows/prettier.yml`, which auto-formats PRs). Run `npm run lint`, `npm test`, and `npm run build` yourself before considering work done.

## Architecture (`src/`)

**Data flow:** IndexedDB (via `idb`) → `src/db/index.ts` (CRUD functions, one IDB singleton opened lazily via `getDb()`) → `src/hooks/useItems.ts` (SWR read) / `src/hooks/useItemMutations.ts` (writes) → components.

- There is no query-invalidation wiring between SWR and the DB layer. Every mutation in `useItemMutations` calls `bump()` on `useItemsStore` (`src/store/itemsStore.ts`), a Zustand store holding only a `revalidateKey` counter. `useItems` includes that counter in its SWR key, so bumping it forces a refetch. If you add a new mutation, call `bump()` or reads will go stale.
- Two parallel object stores, `foods_os` and `medicines_os`, share the identical `Item` schema (`src/types/index.ts`) and are selected at runtime via an `ItemCategory` (`'foods' | 'medicines'`) parameter threaded through `db/index.ts`, hooks, and components — there's no shared "items" store. `foods_history_os`/`medicines_history_os` store remembered `duration` values per product `name`, used for autocomplete in `AddItemModal`.
- `getDb()` in `src/db/index.ts` is a module-level singleton — don't call `openDB` elsewhere. In tests, the whole `../db` module is replaced by the in-memory fake at `src/test/mocks/db.ts` via `vi.mock`, so the singleton and real IndexedDB never run in tests.
- Quantity-changing operations (`openItem`, `consumeItem`, `discardItem` in `useItemMutations.ts`) take the *current* item list as a parameter rather than re-reading from the DB, because `EditItemModal` may chain several of these calls in one submit and needs to pass a synthetic item reflecting the not-yet-persisted remaining quantity between calls (see the comment in `EditItemModal.tsx`'s `handleSubmit`).
- Dates are ISO strings on `Item`, manipulated via Luxon through `src/utils/dateUtils.ts` and `src/utils/sortUtils.ts` — don't reach for `Date` directly. `appLocaleToLuxonLocale()` maps the app's `Language` type (`'en-US' | 'pt-BR'`) to a Luxon locale string.
- Settings (currently just `language`) live in `src/store/settingsStore.ts`, a Zustand store persisted to localStorage under key `expiring-products-settings`.
- i18n (`src/i18n/index.ts`) reads the initial language synchronously from `useSettingsStore.getState()` at module load, before React mounts — resources are the two JSON files in `src/i18n/locales/`. Both locale files must stay in key-sync; add new keys to both when adding UI text.
- No routing library — `App.tsx` is a single component switching between `foods` / `medicines` / `settings` tabs via local `useState`, and holds add/edit modal visibility state that's passed down to `AddItemModal`/`EditItemModal`.

## Testing

- Tests live in `src/test/`, run under `jsdom` via Vitest, configured in `vitest.config.ts` (setup file `src/test/setup.ts`).
- Component tests mock the DB layer per-file with `vi.mock('../../db', () => import('../mocks/db'))`, pointing at the in-memory fake in `src/test/mocks/db.ts` (not real IndexedDB, not the `fake-indexeddb` package).
- `react-i18next` and `useItemsStore` are typically mocked inline per test file too (see `src/test/components/AddItemModal.test.tsx`) rather than relying on the real i18n init or Zustand store.
- MSW (`src/test/mocks/handlers.ts`) is wired into `setup.ts` but currently has no handlers registered — it's scaffolding, not yet exercised by any test.
