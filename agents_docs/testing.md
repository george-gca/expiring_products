# Testing

There is no automated test suite. All validation is manual in the browser.

## Minimum checks before every PR

```bash
bundle exec jekyll build   # must complete with no errors
```

Then open `http://localhost:4000` (after `bundle exec jekyll serve`) and
exercise any code paths touched by your change. Always test both language URLs:
`/` (pt-br default) and `/en-us/`.

## Feature checklist

Run the relevant sections below for the area you changed.

### Authentication

- Sign up with a new email/password
- Log in and log out
- Forgot password flow

### Items

- Add an item (set name, category, quantity, expiration date, duration)
- Edit item fields
- Open, consume, and discard an item
- Verify expiration date adjusts on open when duration is set
- Confirm visual warnings appear for expired and near-expiry items

### Categories

- Add a category with a name and emoji
- Rename and reorder a category
- Delete a category (verify its items are also removed)

### UI / filtering

- Shopping mode toggle
- Sort by date, name, quantity — ascending and descending
- Filter by opened / unopened
- Hide distant expiry items toggle
- Search within a category

### Data portability

- Export database to JSON
- Import a JSON backup (verify items are restored correctly)

### Real-time sync

Open the same account in two browser tabs simultaneously. Make a change in one
tab and confirm it appears in the other tab without a page reload.

### Multilingual

Check that new UI strings render correctly at both `/` (pt-br) and `/en-us/`.
A missing frontmatter key will render as empty text — easy to spot during a
quick visual scan.
