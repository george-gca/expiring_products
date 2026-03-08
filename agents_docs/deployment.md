# Deployment

## Netlify (automatic)

Pushing to `main` triggers an automatic Netlify deploy. No manual step is needed.

| Setting           | Value                      |
| ----------------- | -------------------------- |
| Build command     | `bundle exec jekyll build` |
| Publish directory | `_site`                    |
| Ruby version      | 3.x                        |
| Node.js version   | 22.x                       |

## Firebase environment variables

The following variables must be set in the Netlify dashboard under
_Site settings → Environment variables_. They are injected via `jekyll-dotenv`
at build time into the Liquid templates:

```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
```

The build succeeds without these variables (credentials become empty strings),
but the deployed app will not function. Always verify that all six variables are
present before deploying a change that touches Firebase configuration.

## Local `.env` for development

Create a `.env` file at the repo root (gitignored) with the same key names and
your development Firebase project's values. The `jekyll-dotenv` plugin loads it
automatically during `bundle exec jekyll build` and `bundle exec jekyll serve`.
