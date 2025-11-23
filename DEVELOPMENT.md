# Development Guide

This guide provides detailed information for developers who want to contribute to or understand the Expiring Products application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Build and Deployment](#build-and-deployment)
- [Code Style](#code-style)
- [Common Tasks](#common-tasks)

## Prerequisites

### Required Software

- **Ruby** (version 2.7 or higher)
  - Install via [rbenv](https://github.com/rbenv/rbenv) or [RVM](https://rvm.io/)
- **Bundler** - Ruby dependency manager
  - Install: `gem install bundler`
- **Node.js** (version 14 or higher) and npm
  - Required for Firebase and development tools
- **Git** - Version control

### Optional Tools

- **VS Code** or another code editor with Liquid syntax support
- **Markdownlint** - For validating Markdown files

## Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/george-gca/expiring_products.git
cd expiring_products
```

### 2. Install Dependencies

Install Ruby gems:

```bash
bundle install
```

Install Node.js packages:

```bash
npm install
```

### 3. Verify Installation

Check that Jekyll is installed correctly:

```bash
bundle exec jekyll --version
```

## Project Architecture

### Technology Stack

**Static Site Generation:**

- Jekyll 4.x - Ruby-based static site generator
- Liquid - Templating language for HTML generation
- Jekyll Polyglot - Multi-language support

**Frontend:**

- Vanilla JavaScript (ES6+) embedded in Liquid templates
- Bootstrap 5.3.3 - CSS framework
- MDB UI Kit 8.0.0 - Material Design components
- Luxon 3.5.0 - Date/time manipulation
- Font Awesome 6.6.0 - Icon library

**Data Layer:**

- IndexedDB - Client-side database
- Web Storage API - Statistics tracking
- Firebase 12.3.0 - Optional cloud sync (configured separately)

**PWA Features:**

- Service Worker - Offline caching
- Web App Manifest - Installation metadata

### Directory Structure

```text
expiring_products/
├── _config.yml              # Jekyll configuration
├── _includes/               # Reusable components
│   ├── add_item_modal.liquid
│   ├── edit_item_modal.liquid
│   ├── external_scripts.liquid
│   ├── foods_tab.liquid
│   ├── medicines_tab.liquid
│   ├── settings_tab.liquid
│   ├── head.liquid
│   ├── language_toggle.liquid
│   ├── github_corner.liquid
│   ├── metadata.liquid
│   ├── script.liquid
│   └── scripts/            # JavaScript modules
│       ├── db.js.liquid    # IndexedDB operations
│       ├── ui.js.liquid    # Event handlers
│       └── utils.js.liquid # Utilities
├── _layouts/
│   └── base.liquid         # Base page layout
├── _pages/                 # Content pages
│   ├── en-us/
│   │   └── main.md
│   └── pt-br/
│       └── main.md
├── assets/
│   ├── img/               # Images and icons
│   └── js/
│       ├── idb-backup-and-restore.mjs
│       └── sw.js          # Service worker
├── readme_img/            # Documentation images
├── _site/                 # Generated site (gitignored)
├── Gemfile                # Ruby dependencies
├── package.json           # Node.js dependencies
└── expiring_products.webmanifest  # PWA manifest
```

## Development Workflow

### Running Development Server

Start Jekyll with live reload:

```bash
bundle exec jekyll serve
```

The site will be available at `http://localhost:4000`.

Options:

- `--livereload` - Automatically refresh browser on changes
- `--drafts` - Include draft posts
- `--incremental` - Only rebuild changed files (faster)

Example:

```bash
bundle exec jekyll serve --livereload
```

### Watch for Changes

Use the provided script to auto-rebuild on file changes:

```bash
./run_on_code_changed.sh
```

This script watches for changes in `_includes/`, `_layouts/`, `_pages/`, and `assets/` directories.

### Building for Production

Generate optimized static site:

```bash
bundle exec jekyll build
```

Output is placed in `_site/` directory.

## Testing

### Manual Testing

1. Start development server
2. Test in multiple browsers (Chrome, Firefox, Safari, Edge)
3. Test both languages (pt-br and en-us)
4. Test PWA installation on desktop and mobile

### Testing Checklist

- [ ] Add new item (foods and medicines)
- [ ] Edit item quantities
- [ ] Mark items as opened/consumed/discarded
- [ ] Visual warnings for expiring/expired items
- [ ] Export database to JSON
- [ ] Import database from JSON
- [ ] Language switching
- [ ] Offline functionality (service worker)
- [ ] PWA installation

### Browser Testing

Test in:

- Chrome/Edge (Chromium)
- Firefox
- Safari (macOS/iOS)

Required browser features:

- IndexedDB API
- Service Workers
- ES6+ JavaScript
- Fetch API
- LocalStorage

### Validating Markdown

Run Markdownlint on documentation:

```bash
npx markdownlint *.md
```

Fix common issues automatically:

```bash
npx markdownlint --fix *.md
```

## Build and Deployment

### Build Process

Jekyll build steps:

1. Read configuration from `_config.yml`
2. Process Liquid templates
3. Generate pages for each language (Polyglot)
4. Minify HTML, CSS, JavaScript (Jekyll Minifier)
5. Output to `_site/` directory

### Environment Variables

For production deployment, configure:

- `JEKYLL_ENV=production` - Enables optimizations
- Firebase credentials (if using cloud sync)

### Deployment to Netlify

The project is configured for Netlify deployment:

1. Connect GitHub repository to Netlify
2. Build command: `bundle exec jekyll build`
3. Publish directory: `_site`
4. Environment: Ruby 2.7+, Node.js 14+

### Service Worker Updates

When updating `assets/js/sw.js`, increment the cache version:

```javascript
const cacheName = "expiring-products-v2"; // Increment version
```

This ensures users get the latest cached assets.

## Code Style

### JavaScript

- Use modern ES6+ syntax
- Prefer `const` and `let` over `var`
- Use arrow functions for callbacks
- Descriptive variable names
- Comments for complex logic

Example:

```javascript
// Good
const APP_CONSTANTS = {
  DB_NAME: "expiring_products_db",
  STORE_NAME: "items"
};

function sortItemsBy(items, sortBy = "date", direction = "asc") {
  const multiplier = direction === "desc" ? -1 : 1;
  // Implementation...
}

// Avoid
var x = "expiring_products_db";
function doSort(a, b, x) { ... }
```

### Liquid Templates

- Use meaningful include names
- Keep logic minimal in templates
- Extract complex logic to JavaScript
- Add comments for non-obvious template code

### CSS

- Follow Bootstrap conventions
- Use utility classes when possible
- Custom styles in separate files
- Mobile-first responsive design

### Markdown Documentation

- Use ATX-style headers (`#`)
- Include code blocks with language identifiers
- One sentence per line for better diffs
- Add blank lines around lists and code blocks

## Common Tasks

### Adding a Feature

1. Create Liquid include for UI (if needed) in `_includes/`
2. Add JavaScript logic to appropriate script file
3. Update IndexedDB schema if storing new data
4. Test in both languages
5. Update documentation
6. Update service worker cache if needed

### Modifying IndexedDB Schema

To add a new field to items:

1. Update schema in `_includes/scripts/db.js.liquid`:

   ```javascript
   foodsObjectStore.createIndex("new_field", "new_field", { unique: false });
   ```

2. Increment database version:

   ```javascript
   const openRequest = window.indexedDB.open("expiring_dates_db", 2); // Increment
   ```

3. Handle migration in `upgradeneeded` event
4. Update export/import logic in `assets/js/idb-backup-and-restore.mjs`

### Updating Dependencies

Update Ruby gems:

```bash
bundle update
```

Update npm packages:

```bash
npm update
```

Check for security vulnerabilities:

```bash
npm audit
npm audit fix
```

### Debugging

**Jekyll Build Issues:**

```bash
bundle exec jekyll build --verbose
bundle exec jekyll build --trace
```

**JavaScript Debugging:**

- Use browser DevTools Console
- Check IndexedDB in Application tab
- Monitor Network tab for service worker
- Check Service Worker status in Application > Service Workers

**Common Issues:**

- **IndexedDB not opening**: Check browser compatibility
- **Service worker not updating**: Clear cache or hard reload (Ctrl+Shift+R)
- **Build fails**: Check Ruby/gem versions with `bundle exec jekyll doctor`
- **Polyglot issues**: Ensure all language pages have same frontmatter keys

## Performance Optimization

### Jekyll Build Time

- Use `--incremental` flag during development
- Exclude unnecessary files in `_config.yml`
- Minimize plugin usage

### Runtime Performance

- Lazy load images
- Minimize DOM manipulations
- Use event delegation
- Cache IndexedDB queries
- Optimize service worker cache strategy

## Getting Help

- Check [Jekyll documentation](https://jekyllrb.com/docs/)
- Review [IndexedDB API docs](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- See [Luxon documentation](https://moment.github.io/luxon/)
- Open an issue on GitHub for bugs

## Contributing

### How to Contribute

1. Fork the repository on GitHub
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the code style guidelines above
4. Test thoroughly (multiple browsers, both languages)
5. Commit with clear messages: `git commit -m "feat: add feature"`
6. Push and create a Pull Request

### Commit Message Format

```text
type: short description

Optional longer explanation.

Fixes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

### Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Tested in Chrome, Firefox, and Safari
- [ ] Tested both languages (pt-br and en-us)
- [ ] No JavaScript console errors
- [ ] Markdown linting passes (`npx markdownlint *.md`)
- [ ] Documentation updated if needed
- [ ] Commit messages are clear

### Reporting Bugs

Open a GitHub issue with:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Browser, OS, and device information
- Console errors (if any)

### Suggesting Features

Open a GitHub issue describing:

- The problem or need
- Your proposed solution
- Alternative approaches considered
- Whether you can help implement it

### Adding a New Language

1. Add language code to `_config.yml`: `languages: ["en-us", "pt-br", "es-es"]`
2. Create directory: `mkdir -p _pages/es-es`
3. Copy and translate: `cp _pages/en-us/main.md _pages/es-es/main.md`
4. Update PWA manifest with translated strings
5. Test thoroughly and submit PR

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what's best for the project
- Accept constructive criticism gracefully
- No harassment, discrimination, or offensive behavior

Thank you for contributing! 🎉
