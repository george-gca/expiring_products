# Coding Conventions

## JavaScript

All JavaScript is **vanilla ES6+**, inlined into pages via `_includes/scripts/*.js.liquid`.
There are no bundlers, no transpilers, and no npm-installed UI libraries.

### Firebase SDK — compat mode only

The project uses Firebase **9.6.7 in compat mode**. Always use the global namespace:

```javascript
// ✅ Correct
firebase.firestore();
firebase.auth();
db.collection("users").doc(uid).collection("items").add(data);

// ❌ Wrong — do not use the modular API
import { getFirestore, collection } from "firebase/firestore";
```

### Error handling

Never let Firebase or async operations fail silently. Always wrap in `try/catch` and
surface errors to the user:

```javascript
try {
  await db
    .collection("users")
    .doc(currentUser.uid)
    .collection("items")
    .add(item);
} catch (error) {
  console.error("Failed to add item:", error);
  // show user-facing error message
}
```

### Auth guard

`currentUser` is `null` until `auth.onAuthStateChanged` fires. Every Firestore
read or write must guard against this:

```javascript
if (!currentUser) return;
```

## Liquid templates

See [liquid-templates.instructions.md](../.github/instructions/liquid-templates.instructions.md)
for the full rule set. The critical rules are:

- **Never use `{{` or `}}` inside JavaScript string literals** in `.liquid` files —
  they are interpreted as Liquid tags at build time and will break the build.
- All UI strings must come from `{{ page.KEY }}` — never hardcode English or
  Portuguese text directly in a template.
- CDN URLs must come from `{{ site.third_party_libraries.LIBNAME.url.js }}` —
  never hardcoded.

## SCSS / CSS

- Use Bootstrap utility classes before writing custom CSS.
- Custom styles go in `_sass/layout.scss`; the SCSS entry point is `assets/css/main.scss`.
- Do not add `<style>` blocks to Liquid templates — all styles must go through the SCSS pipeline.
