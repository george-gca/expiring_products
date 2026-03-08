---
applyTo: "_pages/**/*.md"
---

# Localization Page Instructions

## Purpose of `_pages/` files

Files in `_pages/en-us/main.md` and `_pages/pt-br/main.md` are **not** blog posts or standard Markdown pages. Their content is almost entirely **YAML frontmatter** containing localized UI strings. The Markdown body (below the `---` closing line) is empty or minimal.

## Structure

```yaml
---
page_id: main
layout: base
permalink: / # pt-br uses /, en-us uses /en-us/

add_category: Add Category
add_item: Add item
# ... all other UI strings as key: value pairs
---
```

## Rules when editing these files

1. **Always update both files** when adding or renaming a key — `_pages/en-us/main.md` AND `_pages/pt-br/main.md`. Missing a key in one language will result in empty text in the UI for that language.
2. Keys in both files must match exactly (same key name, different translated value).
3. Templates reference these strings as `{{ page.KEY_NAME }}` in Liquid files.
4. The `permalink` and `layout` frontmatter keys are structural — do not remove them.
5. Do not add Markdown content below the frontmatter — these pages render entirely via `_layouts/base.liquid`.

## Finding where a string is used

To find where a key is used in templates, search for `page.KEY_NAME` in `_includes/` and `_layouts/`.
