# Architecture Documentation

Technical architecture and design decisions for the Expiring Products application.

## Overview

Expiring Products is a client-side web application using static site generation.
The architecture is serverless and offline-first with all data stored locally in the browser.

### Key Principles

1. **Offline-First**: Works without internet connectivity
2. **Privacy-Focused**: No server-side data storage or tracking
3. **Static Generation**: Pre-rendered HTML for fast initial load
4. **Client-Side Data**: IndexedDB for structured data persistence

## Architecture Patterns

**Static Site Generation (SSG)** via Jekyll:

- Build-time rendering to static HTML
- Liquid templating with server-side processing
- Multi-language generation (separate HTML per language)
- CDN-friendly static files

**Single Page Application (SPA)** behavior after load:

- No page reloads, dynamic DOM updates
- Client-side tab navigation
- In-memory state management
- No server communication after initial load

**Offline-First**:

- Service Worker caches app shell and assets
- IndexedDB persists all user data locally
- All libraries cached locally
- Optional Firebase sync when online

## Data Layer

### IndexedDB Schema

IndexedDB stores all product data with the following object stores:

#### Foods Table (`foods_table`)

```javascript
{
  keyPath: "id",           // Auto-incrementing primary key
  autoIncrement: true
}
```

Fields:

- `id` (number) - Auto-generated unique identifier
- `name` (string) - Product name
- `quantity` (number) - Current quantity
- `expiring_date` (ISO string) - Expiration date
- `duration` (number) - Days until expiration after opening
- `date_opened` (ISO string | null) - Date when product was opened
- `opened` (boolean) - Whether product has been opened

Indexes:

- `name` - Fast lookup by product name
- `quantity` - Sorting by quantity
- `expiring_date` - Sorting by expiration
- `duration` - History tracking
- `date_opened` - Track opening dates
- `opened` - Filter opened items

#### Medicines Table (`medicines_table`)

Identical schema to Foods Table.

#### History Tables (`foods_history_table`, `medicines_history_table`)

```javascript
{
  keyPath: "name",         // Product name as primary key
  autoIncrement: false
}
```

Fields: `name` (string), `duration` (number)

Purpose: Auto-complete suggestions with remembered duration values.

### LocalStorage

Stores statistics for future analytics:

- `consumed_items`, `consumed_expired_items`
- `expired_discarded_items`, `expired_unopened_items`, `expired_opened_items`

### Data Export/Import

JSON export/import via `assets/js/idb-backup-and-restore.mjs`:

- Export: Iterate stores with cursors → serialize to JSON → downloadable Blob
- Import: Parse JSON → clear database → insert records → refresh UI

## Application Layer

JavaScript split across three files:

**`db.js.liquid`** - IndexedDB operations:

- `addData()`, `editData()`, `deleteData()`, `displayData()`
- Database lifecycle: open → upgradeneeded → success

**`ui.js.liquid`** - Event handlers:

- Modal events, form submissions, data import/export
- `openItem()`, `consumeItem()`, `discardItem()`

**`utils.js.liquid`** - Utilities:

- `sortItems()` - Multi-key sorting
- `checkExpiryDates()` - Visual warnings
- Service Worker registration

### State Management

In-memory JavaScript variables:

```javascript
// In-memory item collections
let db; // IndexedDB database instance
let foodItems = {}; // Foods indexed by ID
let medicineItems = {}; // Medicines indexed by ID
let sortedFoodItems = []; // Foods sorted by expiration
let sortedMedicineItems = []; // Medicines sorted by expiration

// DOM references
const foodsListElement = document.getElementById("foods-list");
const medicinesListElement = document.getElementById("medicines-list");
```

State is ephemeral - rebuilt on each page load from IndexedDB.

## Presentation Layer

### Jekyll + Liquid Templating

Static HTML with embedded JavaScript and localized strings:

```liquid
<!DOCTYPE html>
<html lang="{{ site.active_lang }}">
  <label>{{ page.item_name }}</label>
  const FOODS_TABLE = "foods_table";
  // ... JavaScript with {{ page.variable }} substitutions
</html>
```

### UI Components

Bootstrap 5 + MDB UI Kit providing:

- Tabs (Foods, Medicines, Settings)
- Modals (Add/Edit items)
- List groups with badges
- Floating label forms
- Visual warnings (red/yellow alerts)

Mobile-first responsive design with touch-friendly interactions.

## Progressive Web App

### Service Worker (`assets/js/sw.js`)

Cache-first strategy:

- Install: Cache app shell and assets
- Activate: Clean old caches
- Fetch: Serve from cache, fallback to network

### Web App Manifest

`expiring_products.webmanifest` defines PWA metadata:

- Name, icons, colors
- `display: standalone` for app-like window
- `start_url` for launch

### Offline Flow

1. First visit: Install service worker, cache assets
2. Subsequent visits: Serve from cache, use IndexedDB
3. Install as PWA: Standalone window, app icon

## Internationalization

Jekyll Polyglot generates separate HTML per language:

```yaml
# _config.yml
languages: ["en-us", "pt-br"]
default_lang: "pt-br"
```

Pages in `_pages/en-us/` and `_pages/pt-br/` with localized strings in frontmatter.
Luxon handles date localization: `.setLocale('{{ site.active_lang }}').toRelative()`

## Security & Privacy

- **No server communication**: All data stays in browser
- **Same-origin policy**: IndexedDB isolated per origin
- **No encryption**: Data unencrypted in browser (rely on OS-level security)
- **No tracking**: No analytics, cookies, or external calls

## Design Decisions

**Why IndexedDB?** Structured data, indexing, async operations, larger capacity than LocalStorage.

**Why Static Site Generation?** No server costs, fast loading, simple deployment, no server vulnerabilities.

**Why Vanilla JavaScript?** No build step, smaller bundle, direct control, long-term stability.

**Why Offline-First?** Privacy, reliability, speed, works anywhere.
