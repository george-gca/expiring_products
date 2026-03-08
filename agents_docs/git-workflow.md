# Git Workflow

## Commit messages

Follow the style used throughout this repo — past-tense verb, capital first
letter, no trailing period, no conventional-commit prefix:

```
Added support for push notifications
Fixed button not changing label when hiding items
Updated documentation
Removed unused helper function
```

- Keep the subject line under 72 characters.
- If the reason for the change is not self-evident, add a blank line followed
  by a short explanatory paragraph.

## Pull requests

- Always target `main`.
- The Prettier CI workflow (`.github/workflows/prettier.yml`) runs automatically
  on push and will auto-format any style issues. Do not merge a PR that fails CI.
- For UI changes, note in the PR description which features to test and whether
  both language routes (`/` and `/en-us/`) were checked.
- Reference any relevant TODO from `README.md` if the PR closes one.
