# AGENTS.md — Expiring Products

Jekyll-based Progressive Web App for tracking pantry item expiration dates, using Firebase Firestore (real-time database) and Firebase Authentication. Multi-language (pt-br default, en-us). Deployed to Netlify.

## Build

```bash
bundle install && npm install        # first-time setup or after dependency changes
bundle exec jekyll build             # → _site/  (completes in < 1 second)
bundle exec jekyll serve --livereload  # dev server at http://localhost:4000
```

Warnings about `Jekyll Minifier: Filtering out legacy 'harmony' option` are expected and harmless. **Never edit `_site/`** — it is fully regenerated on every build.

## Validate before committing

```bash
bundle exec jekyll build                                            # must succeed
npx prettier --write "**/*.{css,html,js,json,md,scss,yaml,yml}"  # auto-fix formatting
```

The GitHub Actions CI workflow (`.github/workflows/prettier.yml`) also auto-formats on push/PR to `main`. `npx markdownlint-cli2 --fix *.md` validates doc Markdown (use `markdownlint-cli2`, not `markdownlint`).

## Reference

| Topic                                                      | File                                                                                                               |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Directory map, Firestore schema, SPA pattern, global state | [agents_docs/architecture.md](agents_docs/architecture.md)                                                         |
| JS, Liquid, SCSS coding conventions                        | [agents_docs/coding-conventions.md](agents_docs/coding-conventions.md)                                             |
| Localization / i18n (`_pages/`)                            | [.github/instructions/localization-pages.instructions.md](.github/instructions/localization-pages.instructions.md) |
| Liquid template rules                                      | [.github/instructions/liquid-templates.instructions.md](.github/instructions/liquid-templates.instructions.md)     |
| Security                                                   | [agents_docs/security.md](agents_docs/security.md)                                                                 |
| Manual testing checklist                                   | [agents_docs/testing.md](agents_docs/testing.md)                                                                   |
| Commit style & pull requests                               | [agents_docs/git-workflow.md](agents_docs/git-workflow.md)                                                         |
| Netlify deployment                                         | [agents_docs/deployment.md](agents_docs/deployment.md)                                                             |
