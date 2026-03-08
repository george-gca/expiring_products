# Security

## Secrets and credentials

- **Never commit `.env`** or any Firebase credentials. The file is gitignored.
  Credentials are injected at build time from environment variables.
- **Never hardcode secrets** anywhere in the source tree — no API keys, tokens,
  or passwords in Liquid templates, JavaScript, or `_config.yml`.
- For Netlify production: set all `FIREBASE_*` variables in the dashboard
  (_Site settings → Environment variables_).

## Firestore security rules

Firestore rules enforce that each user can only access their own subtree
(`users/{userId}/**`). Do not design data structures that would require
relaxing this rule (e.g., cross-user references or shared collections at the
root level).

## XSS prevention

All item names, category names, and other user-supplied data are written to
Firestore and later rendered in the DOM. Escape or sanitize user-supplied values
before inserting them via `innerHTML`. Prefer `textContent` for plain-text
insertion, and use DOM APIs (`createElement`, `appendChild`) rather than
string concatenation when building HTML from user data.

## Subresource Integrity (SRI)

Every CDN-loaded script and stylesheet has an `integrity=` attribute in
`_includes/external_scripts.liquid`. The values come from `_config.yml`
under `third_party_libraries`. When upgrading a library version, always
regenerate and update the integrity hash — use <https://www.srihash.org/> if
the library does not publish its own hash.

## Authentication guard

The `currentUser` variable is populated asynchronously after
`auth.onAuthStateChanged` fires. Every Firestore read or write must check:

```javascript
if (!currentUser) return;
```

Avoid initiating any data operation before `onAuthStateChanged` has resolved.
