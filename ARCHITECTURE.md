# Architecture Documentation

Technical architecture and design decisions for the Expiring Products application.

## Overview

Expiring Products is a client-side web application using static site generation with cloud-based data storage.
The architecture follows a serverless model with Firebase providing authentication and real-time database services.

### Key Principles

1. **Cloud-First**: Data stored in Firebase Firestore with real-time synchronization
2. **Privacy-Focused**: User data is isolated and accessible only to authenticated users
3. **Static Generation**: Pre-rendered HTML for fast initial load
4. **Real-Time Sync**: Automatic data synchronization across all devices

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
- Real-time data updates via Firestore listeners

**Progressive Web App**:

- Service Worker caches app shell and assets
- Offline access to cached interface
- Firebase Firestore provides online data persistence
- Automatic sync when connection is restored

## Data Layer

### Firebase Firestore Schema

Firebase Firestore provides the cloud database with real-time synchronization. Data is organized in a hierarchical structure per user.

#### Users Collection

Root collection containing user documents, each identified by Firebase Authentication UID.

```text
users/{userId}/
  ├── categories/       # User's custom categories
  ├── items/            # All items across categories
  ├── item_history/     # Autocomplete suggestions
  └── statistics/       # Consumption and waste stats
```

#### Categories Subcollection (`users/{userId}/categories`)

Stores user-defined product categories with custom names and emojis.

```javascript
{
  key: "foods",              // Unique identifier (lowercase, underscores)
  name: "Foods",             // Display name
  emoji: "🍎",              // Category icon
  order: 0                   // Sort order in tabs
}
```

Default categories: Foods, Medicines (created on first use)

#### Items Subcollection (`users/{userId}/items`)

Stores all product items with category association.

```javascript
{
  name: "Whole Milk",                    // Product name
  category: "foods",                     // Category key reference
  quantity: 2,                           // Current quantity
  expiring_date: "2026-01-15T23:59:59",  // ISO 8601 expiration date
  duration: 7,                           // Days until expiration after opening
  date_opened: "2025-11-23T10:30:00",    // ISO 8601 date when opened (null if unopened)
  opened: false,                         // Boolean: has been opened
  recurring: true                        // Boolean: recurring purchase for shopping mode
}
```

Firestore Indexes:

- `category` + `expiring_date` (ascending) - For sorted category lists
- `category` (for filtering by category)

#### Item History Subcollection (`users/{userId}/item_history`)

Stores autocomplete suggestions with remembered duration values.

```javascript
{
  // Document ID: {category}_{name} (composite key)
  name: "Whole Milk",        // Product name
  category: "foods",          // Category key
  duration: "7",              // Remembered duration
  recurring: true             // Whether it's a recurring purchase
}
```

Purpose: Provide autocomplete suggestions when adding new items, pre-filling duration and recurring status.

#### Statistics Subcollection (`users/{userId}/statistics`)

Single document (`stats`) tracking consumption and waste metrics per category.

```javascript
{
  // Dynamic fields based on categories
  foods_consumed_items: 45,
  foods_consumed_expired_items: 3,
  foods_discarded_items: 2,
  foods_expired_discarded_items: 5,
  foods_expired_opened_items: 1,
  medicines_consumed_items: 12,
  // ... more category-specific stats
}
```

Stats are incremented atomically using `firebase.firestore.FieldValue.increment()`.

### Data Operations

**Real-Time Listeners**:

- Each category has a dedicated Firestore listener
- Listeners automatically update UI when data changes
- Changes from other devices appear instantly
- Sorted queries executed server-side for efficiency

**Transactions**:

- Opening items uses transactions to prevent race conditions
- Ensures atomic updates when splitting item quantities
- Guarantees data consistency across concurrent operations

**Batch Operations**:

- Import/export use batched writes for efficiency
- Database clearing performed in batches

## Application Layer

JavaScript split across three files:

**`db.js.liquid`** - Firestore operations:

- `addData()`, `editData()`, `deleteData()` - CRUD operations
- `setupRealtimeListener()` - Real-time data synchronization
- `setupCategoriesListener()` - Category management
- `addHistoryData()` - Autocomplete history tracking
- Real-time listeners update UI automatically on data changes

**`ui.js.liquid`** - Event handlers:

- Modal events, form submissions, data import/export
- `openItem()`, `consumeItem()`, `discardItem()` - Item actions with Firestore transactions
- Authentication event handlers (login, signup, logout, password reset)
- Category management (add, edit, delete categories)
- Shopping mode functionality

**`utils.js.liquid`** - Utilities:

- `sortItems()`, `sortItemsBy()` - Multi-key sorting with configurable criteria
- `filterItems()`, `filterItemsByExpiryDistance()` - Filtering logic
- `checkExpiryDates()` - Visual warnings
- Service Worker registration
- Error handling utilities

### Authentication Flow

```javascript
// Firebase Authentication initialization
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let currentUser;

// Authentication state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    // User signed in: show app, setup listeners
    currentUser = user;
    setupCategoriesListener();
  } else {
    // User signed out: show login, cleanup listeners
    currentUser = null;
  }
});
```

**Sign Up**: `auth.createUserWithEmailAndPassword(email, password)`
**Sign In**: `auth.signInWithEmailAndPassword(email, password)`
**Sign Out**: `auth.signOut()`
**Password Reset**: `auth.sendPasswordResetEmail(email)`

### State Management

In-memory JavaScript variables synchronized with Firestore:

```javascript
// Authentication
let currentUser; // Firebase user object

// Dynamic categories system
window.userCategories = []; // Array of category objects
window.itemsByCategory = {}; // Items indexed by category key
window.sortedItemsByCategory = {}; // Sorted arrays per category
window.fuseByCategory = {}; // Fuse.js search instances
window.categoryListeners = {}; // Firestore unsubscribe functions

// User preferences (per category)
window.sortingPreferences = {}; // Sort criteria per category
window.sortingDirections = {}; // Sort direction per category
window.filteringPreferences = {}; // Filter selection per category
window.showHiddenItems = {}; // Show distant items toggle
```

State is synchronized automatically via Firestore real-time listeners.

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

- Dynamic tabs (user-defined categories + Settings)
- Modals (Add/Edit items, authentication)
- List groups with badges
- Floating label forms
- Visual warnings (red/yellow alerts)
- Dropdown menus for sorting and filtering
- Shopping mode toggle

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

1. First visit: Install service worker, cache assets, authenticate
2. Subsequent visits: Serve from cache, sync with Firestore
3. Offline mode: Access cached app shell, queue operations for when online
4. Install as PWA: Standalone window, app icon

Note: Full functionality requires internet connection for Firestore operations.

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

- **Firebase Authentication**: Secure email/password authentication
- **Data Isolation**: Each user's data is completely isolated via Firestore security rules
- **HTTPS Only**: All communication encrypted in transit
- **No Third-Party Tracking**: No analytics, cookies, or external tracking
- **User-Controlled Data**: Users can export and delete their data at any time
- **Server-Side Security Rules**: Firestore rules ensure users can only access their own data

Firestore Security Rules example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Design Decisions

**Why Firebase Firestore?** Real-time synchronization across devices, automatic scaling, offline support with automatic sync when reconnected, strong consistency guarantees, and built-in security rules.

**Why Firebase Authentication?** Industry-standard security, handles password hashing and validation, provides password reset functionality, no server-side code needed, and integrates seamlessly with Firestore.

**Why Static Site Generation?** No server costs for app hosting, fast loading, simple deployment, no server vulnerabilities, CDN-friendly.

**Why Vanilla JavaScript?** No build step complexity, smaller bundle size, direct control over code, long-term stability without framework dependencies.

**Why Dynamic Categories?** Users can organize items according to their needs (e.g., "Refrigerator", "Freezer", "Pantry"), with custom emojis for visual identification.
