<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ built-in commands (`vp dev`, `vp build`, `vp test`, etc.) always run the Vite+ built-in tool, not any `package.json` script of the same name. To run a custom script that shares a name with a built-in command, use `vp run <script>`. For example, if you have a custom `dev` script that runs multiple services concurrently, run it with `vp run dev`, not `vp dev` (which always starts Vite's dev server).
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## CI Integration

For GitHub Actions, consider using [`voidzero-dev/setup-vp`](https://github.com/voidzero-dev/setup-vp) to replace separate `actions/setup-node`, package-manager setup, cache, and install steps with a single action.

```yaml
- uses: voidzero-dev/setup-vp@v1
  with:
    cache: true
- run: vp check
- run: vp test
```

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->

# Project: health.webry.com

A hub of health-focused tools, each at its own sub-path. Currently contains three tools: **Additives Wiki**, **RFB** (Resonance Frequency Breathing), and **Nutr** (external link). The additives wiki is the most complete — evidence-informed, scored guides (0–10) for sweeteners, preservatives, and emulsifiers, with bilingual support (EN/DE) and an OCR ingredient scanner.

**Agents: keep this file up to date as the project evolves.** When adding new pages, categories, composables, dependencies, or patterns that would affect how an agent should work in this codebase, update the relevant section below.

---

## Tech Stack

- **Vue 3** (Composition API + `<script setup>`) with TypeScript
- **Vue Router 5** — client-side SPA routing
- **vue-i18n 11** — all additives content and UI strings are stored in `src/i18n/index.ts`
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **@vueuse/core** — localStorage, locale detection
- **tesseract.js** — OCR for ingredient photo scanning
- **unplugin-icons** + **@iconify-json/iconamoon** — icon components via `~icons/iconamoon/*`
- **Vite+** — unified toolchain (see above)
- **Vercel** — deployment target; `/nutr` has a server-level redirect to `nutr.webry.com`

---

## Directory Structure

```
src/
  main.ts               # App entry — creates Vue app, registers i18n + router
  App.vue               # Root component — just <RouterView />
  router.ts             # Route definitions (lazy-loaded pages)
  types.ts              # Item interface (name, score, type, positives, negatives, …)
  main.css              # Tailwind CSS entry
  i18n/
    index.ts            # All additives content + UI strings in EN and DE (~29k lines)
  composables/
    useLocale.ts        # Locale toggle (EN/DE), persisted to localStorage
    useSearch.ts        # Fuzzy search with aliases and multi-tier scoring
  pages/
    LandingPage.vue     # Global hub — links to all tools (/), uses BaseLayout, no nav slot
    HomePage.vue        # Additives wiki home (/additives) — links to 3 guides
    SweetenerPage.vue   # Sweeteners guide (/sweeteners)
    PreservativesPage.vue  # Preservatives guide (/preservatives)
    EmulsifiersPage.vue    # Emulsifiers guide (/emulsifiers)
    RFBPage.vue         # Resonance Frequency Breathing app (/rfb)
  components/
    BaseLayout.vue      # Shared shell: dark bg, nav bar with logo, #nav + #nav-extra slots
    AppLayout.vue       # Extends BaseLayout — wiki nav, search, scan modal, i18n toggle
    ItemTable.vue       # Sortable/filterable table with health scores
    ItemModal.vue       # Detail modal (pros/cons, consumption, warnings)
    ScanModal.vue       # Ingredient list parser + OCR (tesseract.js)
    PrinciplesList.vue  # Health principles display
```

---

## Key Patterns

### Data Model

All item data lives in `src/i18n/index.ts` — there is no database or API. Each item follows the `Item` interface from `src/types.ts`:

```ts
interface Item {
  name: string
  score: number // 0–10 health score
  type: string // category subtype (e.g. "natural", "artificial")
  description: string
  positives: string[]
  negatives: string[]
  consumption?: string
  warnings?: string
  notes?: string
}
```

To add a new item, add it to both `en` and `de` message catalogs in `src/i18n/index.ts`, and add its search aliases in `src/composables/useSearch.ts`.

### Layout System

All pages use `BaseLayout` (dark shell + logo in nav). Logo centers automatically when no `#nav` slot is provided.

- `#nav` slot — content placed after the logo in the nav bar
- `#nav-extra` slot — rendered below the main nav row (used by AppLayout for the mobile menu)

`AppLayout` wraps `BaseLayout` and fills the slots with the full wiki nav (links, search, scan, i18n toggle, GitHub link, mobile hamburger). Wiki pages use `AppLayout`; all other pages use `BaseLayout` directly.

### Top-Level Routes

| Path             | Component               | Layout       | Notes                                           |
| ---------------- | ----------------------- | ------------ | ----------------------------------------------- |
| `/`              | `LandingPage.vue`       | `BaseLayout` | No `#nav` slot → logo centered                  |
| `/additives`     | `HomePage.vue`          | `AppLayout`  | Additives wiki home                             |
| `/sweeteners`    | `SweetenerPage.vue`     | `AppLayout`  |                                                 |
| `/preservatives` | `PreservativesPage.vue` | `AppLayout`  |                                                 |
| `/emulsifiers`   | `EmulsifiersPage.vue`   | `AppLayout`  |                                                 |
| `/rfb`           | `RFBPage.vue`           | `BaseLayout` | RFB breathing app                               |
| `/nutr`          | —                       | —            | Router guard + Vercel redirect → nutr.webry.com |

### Additives Categories / Routes

Current categories: `sweeteners`, `preservatives`, `emulsifiers`. Each has a corresponding route in `src/router.ts` and page in `src/pages/`. When adding a new category, you must:

1. Add the route to `src/router.ts`
2. Create the page component in `src/pages/`
3. Add items to `src/i18n/index.ts` (both locales)
4. Add aliases to `src/composables/useSearch.ts`
5. Add a nav entry in `src/components/AppLayout.vue`
6. Update this file

### Search

`useSearch()` composable implements fuzzy multi-tier scoring:

- Exact match → 100 pts
- Prefix match → 80 pts
- Substring (name) → 60 pts
- Alias match → 55 pts
- Full-text → 20 pts

Results are capped at 5, ranked by score. Aliases per item are defined as a flat map in `useSearch.ts`.

### i18n

All strings (UI labels and item content) are in `src/i18n/index.ts` under `en` and `de` keys. The locale composable (`useLocale`) reads/writes to localStorage and falls back to browser preference detection.

### Icons

Icons come from `@iconify-json/iconamoon` via `unplugin-icons`. Import pattern:

```ts
import IconName from '~icons/iconamoon/<icon-name>'
```

The plugin is registered in `vite.config.ts` as `Icons({ compiler: 'vue3' })`. Type declarations are in `env.d.ts` via `/// <reference types="unplugin-icons/types/vue" />`. Do not install other icon sets without removing the unused one.

### Routing & Deep Linking

- `?item=Name` query param opens the detail modal for a specific item
- `#scan=encoded-list` hash shares a pre-filled scan result
- SPA routing handled by Vercel rewrites (`vercel.json`); `/nutr` redirect runs before the catch-all

### Health Score Colors

Scores are color-coded consistently across components:

- 8–10: emerald
- 6–7: yellow
- 4–5: orange
- 0–3: red

---

## Development Workflow

```bash
vp install     # install deps (after pulling changes)
vp dev         # start dev server
vp check       # format + lint + type-check
vp test        # run tests
vp build       # production build
```

Run `vp check` and `vp test` before committing. The `build` script in `package.json` runs `vue-tsc --build` in parallel with `vp build` — both must pass.
