# CLAUDE.md

Guidance for Claude Code when working in this repository.

## 1. Project overview

A small e-commerce storefront. Users can:

1. Browse featured products on the home page
2. Look through a product listing filtered by category
3. Open a product detail page
4. Manage a cart

All product data comes from the [DummyJSON API](https://dummyjson.com/). Each developer builds their own version in their own repository and deploys to their own Vercel URL.

**Work proceeds one feature at a time.** Do not scaffold ahead of the current phase. If asked to build the product listing, do not also build the cart. See [§15 Feature phases](#15-feature-phases).

## 2. Technical stack

Original requirements, unchanged:

| Layer                  | Choice                             | Constraint notes                                                 |
| ---------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| Front end              | React + Vite                       | Use JavaScript, not TypeScript                                   |
| State management       | Zustand                            | Use Zustand, not Redux, and name it clearly                      |
| Components and styling | [Ply CSS](https://www.plycss.com/) | No other UI libraries                                            |
| Data source            | DummyJSON API                      | This is the only product data source; no custom product database |
| Database               | Firestore                          | Only for cart persistence if you reach the Cart phase            |
| Auth                   | Firebase Auth                      | Stretch only; skip it unless you have already covered it         |
| Deployment             | Vercel                             | Auto-deploy from GitHub; production tracks main                  |

### Additions to the original table

These were not in the original requirements and were decided separately:

| Layer             | Choice                   | Rationale                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routing           | React Router v8          | The table named no router but the app needs four pages. Category filter lives in a URL search param so filtered views are shareable. Install `react-router` — **not** `react-router-dom`, which is deprecated and removed in v8. Import `BrowserRouter`, `Routes`, `Route`, `Link` from `react-router`; DOM-only APIs come from `react-router/dom`. Requires Node ≥22.22 and React ≥19.2.7. |
| Testing           | Vitest, store only       | Cart logic is where bugs hide. UI is verified manually.                                                                                                                                                                                                                                                                                                                                     |
| Lint / format     | ESLint + Prettier        | IDE integration for VSCode. See [§8](#8-linting-and-formatting).                                                                                                                                                                                                                                                                                                                            |
| Production branch | `production`, not `main` | **Deliberate deviation** from the table's "production tracks main". See [§11](#11-branching-and-release-process).                                                                                                                                                                                                                                                                           |

## 3. Hard constraints

These are the rules most likely to be violated. Do not violate them.

- **JavaScript only.** No TypeScript, no `.ts`/`.tsx` files, no type annotations, no `tsconfig.json`.
- **Zustand for shared state.** No Redux, no Redux Toolkit, no React Context used as a store.
- **Ply CSS only.** No Tailwind, MUI, Bootstrap, Chakra, styled-components, or any other UI/CSS framework. Ply is explicitly a standalone framework and must not be combined with another. Custom CSS is allowed only for gaps Ply genuinely does not cover — keep it minimal and put it in `src/index.css`.
- **DummyJSON is the only product data source.** No local product JSON fixtures, no seeded product database, no scraped data.
- **Firestore is for cart persistence only**, and only once the Cart phase is reached. Do not add it earlier and do not use it for product data.
- **Firebase Auth is a stretch goal.** Skip it entirely unless explicitly asked.

## 4. Project structure

The shape to grow into — not a tree to create up front. Add files as their phase arrives.

```
src/
  main.jsx                 entry; imports ply-css/dist/css/ply.min.css
  App.jsx                  router + layout shell
  index.css                minimal custom CSS only
  api/dummyjson.js         all DummyJSON fetches, single BASE_URL
  store/cartStore.js       useCartStore
  store/productStore.js    useProductStore
  components/              Ply-classed presentational components
  pages/
    Home.jsx
    ProductList.jsx
    ProductDetail.jsx
    Cart.jsx
```

Routes: `/` → Home, `/products` → ProductList, `/products/:id` → ProductDetail, `/cart` → Cart.

Category filtering uses a search param — `/products?category=beauty` — not a separate route, so filtered views can be linked and bookmarked.

## 5. State management conventions

Store names are explicit, per the "name it clearly" constraint:

- **`useCartStore`** (`src/store/cartStore.js`) — `items`, `add(product, qty)`, `remove(id)`, `setQuantity(id, qty)`, `clear()`.
- **`useProductStore`** (`src/store/productStore.js`) — `products`, `categories`, `selectedCategory`, `loading`, `error`, and the actions that populate them.

Rules:

- **Select narrow slices.** `useCartStore(s => s.items)`, never `const store = useCartStore()`. Destructuring the whole store re-renders the component on every unrelated change.
- **Keep fetching out of components.** HTTP lives in `src/api/dummyjson.js`; store actions call it. Components call store actions.
- **Derive, don't store.** Item count and subtotal are computed from `items`, never held as separate state that can drift.
- **Keep the store importable without React.** Vitest exercises `cartStore.js` directly, so no hooks or component imports at module scope, and provide a way to reset state between tests.

## 6. Ply CSS

Version pinned in `package.json`, bundled by Vite — no CDN dependency.

```bash
npm install ply-css
```

```js
// src/main.jsx
import 'ply-css/dist/css/ply.min.css'
```

**Ply is standalone.** Do not add another CSS framework alongside it.

### Verified class reference

Use these. Do not invent class names — if something is needed that isn't here, check the docs or the bundled snippets rather than guessing.

**Layout / grid**

- `units-container` — wrapper, max-width 1200px, centered
- `units-row` — flex row
- `unit-10`, `unit-12`, `unit-20`, `unit-25`, `unit-30`, `unit-33`, `unit-35`, `unit-38`, `unit-40`, `unit-50`, `unit-60`, `unit-62`, `unit-65`, `unit-66`, `unit-70`, `unit-75`, `unit-80`, `unit-88`, `unit-90`, `unit-100`, `unit-auto`
- Responsive prefixes: `phone-unit-*` (≤480px), `large-phone-unit-*` (≤650px), `tablet-unit-*` (≤767px), `small-desktop-unit-*` (≤1024px), `large-screen-unit-*` (≥1400px), `x-large-screen-unit-*` (≥1800px), `forever-unit-*` (never collapses)
- Row modifiers: `gap-xs`, `gap-sm`, `gap`, `gap-lg`, `gap-xl`, `gap-xxl`, `equal-height`, `centered-content`, `stacked`, `reverse-direction`, `joined`
- Unit modifiers: `unit-push-*`, `unit-centered`
- Block helpers: `blocks-2` … `blocks-6`, `blocks-mobile-50`, `blocks-mobile-33`
- `fill-width` — edge-to-edge

**Buttons** — base `btn`, plus:

- `btn-primary`, `btn-secondary`, `btn-primary-outline`, `btn-secondary-outline`, `btn-ghost`, `btn-outline`
- Colors: `btn-blue`, `btn-red`, `btn-green`, `btn-yellow`, `btn-black`
- Sizes: `btn-lg`, `btn-sm`, `btn-xs`
- States: `btn-active`, `btn-disabled`
- `btn-icon`, `btn-group`, `btn-single`

Ply also ships forms, navigation, modals, labels, loaders, and notifications.

### On-disk markup reference

After `npm install`, real examples live at `node_modules/ply-css/snippets/`:

`card.html`, `navbar-page.html`, `pricing-cards.html`, `two-column-layout.html`, `contact-form.html`, `data-table.html`, `login-page.html`, `dashboard.html`, `notifications.html`, `starter-page.html`, `responsive-header.html`, `custom-theme.html`, `accessible-drag-and-drop.html`

**Read the relevant snippet before hand-writing a component.** Ply generates accessible, WCAG-compliant markup by default and the snippets show the structure that achieves it.

## 7. DummyJSON API

Base URL: `https://dummyjson.com`. All fetches go in `src/api/dummyjson.js` with a single `BASE_URL` constant.

| Endpoint                       | Returns                            |
| ------------------------------ | ---------------------------------- |
| `GET /products?limit=&skip=`   | `{ products, total, skip, limit }` |
| `GET /products/:id`            | a single product object            |
| `GET /products/categories`     | `[{ slug, name, url }]`            |
| `GET /products/category/:slug` | `{ products, total, skip, limit }` |
| `GET /products/search?q=`      | `{ products, total, skip, limit }` |

**Verified product fields:** `id`, `title`, `description`, `category`, `price`, `discountPercentage`, `rating`, `stock`, `tags[]`, `brand`, `sku`, `weight`, `dimensions`, `warrantyInformation`, `shippingInformation`, `availabilityStatus`, `reviews[]`, `returnPolicy`, `minimumOrderQuantity`, `meta`, `thumbnail`, `images[]`.

Notes:

- Use `thumbnail` for cards, `images[]` for the detail page gallery.
- Paginate with `limit` + `skip`.
- Category dropdowns use `slug` as the value and `name` as the label. `/products/categories` returns objects — do not treat it as an array of strings.
- No API key, no auth. It's a public read-only API.

## 8. Linting and formatting

**ESLint handles correctness. Prettier handles formatting. They do not overlap.**

Dev dependencies:

```bash
npm install -D eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals prettier eslint-config-prettier
```

`eslint.config.js` uses **flat config** (ESLint 10). It is hand-written — `npm create vite@latest` no longer scaffolds an ESLint config. As of create-vite v9 the React template ships **`oxlint`** instead, which phase 0 removed (`.oxlintrc.json` deleted, `oxlint` devDependency dropped). Do not reintroduce it; §2 commits this project to ESLint.

The config composes, in order:

- `js.configs.recommended`, then `eslint-plugin-react-hooks` via `configs['recommended-latest']` and `eslint-plugin-react-refresh` via `configs.vite`.
- A `files: ['**/*.{js,jsx}']` block with `globals.browser` and JSX parsing enabled.
- A `files: ['**/*.test.js']` block with Vitest globals so store tests don't trip `no-undef` (`vite.config.js` sets `test.globals = true`).
- `eslint-config-prettier/flat` **last**, so it disables stylistic rules that would fight Prettier.

**Do not install `eslint-plugin-prettier`.** Running Prettier as an ESLint rule is discouraged and makes lint runs slower. Keep the two tools separate.

Also create `.prettierrc` and `.prettierignore` (ignore `dist`, `node_modules`, `.vercel`, `coverage`).

Scripts in `package.json`:

```json
{
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

## 9. VSCode setup

Both files are committed so the editor config travels with the repo.

`.vscode/extensions.json`:

```json
{
  "recommendations": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]
}
```

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
  "eslint.validate": ["javascript", "javascriptreact"],
  "files.eol": "\n"
}
```

`files.eol` is pinned to `\n` because this is a Windows machine and Prettier's `--check` will fail on CRLF in CI otherwise.

That setting only governs the editor. `core.autocrlf` is `true` on this machine, so git itself would still check files out with CRLF and break `format:check` locally. `.gitattributes` closes that gap:

```
* text=auto eol=lf
```

## 10. Git worktree subagent workflow

Each feature phase is built by a subagent in its own git worktree on branch `feat/<phase>`.

**Creating one:** use Claude Code's `EnterWorktree` / `ExitWorktree` tools, or the Agent tool's `isolation: "worktree"` option. Manual fallback:

```bash
git worktree add ../Agentic-worktrees/feat-product-list -b feat/product-list
```

**Gotchas that will bite otherwise:**

- **`EnterWorktree` creates worktrees inside the repo**, at `.claude/worktrees/<name>`, and names the branch `worktree-<name>` — rename it to `feat/<phase>` to match this convention. That directory is gitignored so the nested worktree's files don't show up as untracked in the parent.
- **`node_modules` is not shared across worktrees.** Every new worktree needs its own `npm ci` before anything runs.
- **`.env.local` is gitignored, so it does not appear in a new worktree.** Copy it in manually if the phase needs Firebase config.
- **Remove finished worktrees** with `git worktree remove <path>` so stale directories don't pile up. `git worktree list` shows what exists.

**Pre-PR gate.** Before opening a PR the subagent must have all four green in its worktree:

```bash
npm run lint
npm run format:check
npm test
npm run build
```

**Subagents open PRs. Subagents never merge.** Merging is always a human decision.

## 11. Branching and release process

Two long-lived branches. `main` is the integration branch; `production` is what Vercel deploys live.

```
feat/<phase>          git worktree, one per feature phase
  │                   local gate: lint · format:check · test · build
  ▼  PR ──────────►  main
                      · Vercel posts a preview URL on the PR
                      · GitHub Actions ci: lint · format:check · test · build
                      · HUMAN review, then squash merge
  ▼
main (integration)    push → Vercel preview deploy
  │  release PR ────►  production
  ▼
production            Vercel Production Branch → live URL
```

- Feature PRs target `main`. Squash merge, then delete the branch.
- Releasing is a PR from `main` → `production`. Never commit to `production` directly.
- Recommended: GitHub branch protection on both branches requiring a PR and passing checks. Availability depends on repo visibility and GitHub plan.

**Known trade-off of this model:** `main` does not reflect what is live, and every release costs an extra merge. This deviates from the original brief's "production tracks main" — the deviation is intentional. The benefit is that merging a reviewed feature and publishing it are separate decisions, so a half-finished sequence of features never lands on the public URL. Vercel documents this multi-branch pattern under "multiple preview phases".

## 12. CI pipeline

GitHub Actions runs checks. **It does not deploy** — deployment is entirely Vercel's GitHub integration (see [§13](#13-deployment)).

**`.github/workflows/ci.yml`** — on `pull_request` targeting `main` or `production`, and on push to both. Node 24, `npm ci`, then in order: `npm run lint`, `npm run format:check`, `npm test`, `npm run build`.

Node 24, not 20: React Router v8 requires Node ≥22.22 and Vite 8 requires ≥22.12, so a Node 20 runner fails to install. `package.json` pins the same floor via `"engines": { "node": ">=22.22" }`. Set the Vercel project's Node.js version to 24 as well so all three agree.

Note: a workflow file must exist on a branch for a push to that branch to trigger it. Since `main` merges into `production`, the workflows land there with the first release.

**`.github/workflows/claude.yml`** — `anthropics/claude-code-action@v1`, triggered by `@claude` mentions in issue and PR comments. Install with `/install-github-app` from Claude Code (needs repo admin); it installs the Claude GitHub App and adds the `ANTHROPIC_API_KEY` secret.

```yaml
name: Claude
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

**Why on-demand rather than automatic review:** this workflow already has a human PR review as the gate, and the worktree subagent reviews its own work before opening the PR. Automatic review would be a third pass on the same diff, billed per push.

To switch to automatic review on every PR later, add a second workflow:

```yaml
name: Code Review
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          plugin_marketplaces: 'https://github.com/anthropics/claude-code.git'
          plugins: 'code-review@claude-code-plugins'
          prompt: '/code-review:code-review ${{ github.repository }}/pull/${{ github.event.pull_request.number }}'
```

## 13. Deployment

Vercel's GitHub integration, which auto-deploys every push and every PR with no deploy YAML and no `VERCEL_TOKEN`. Framework preset: Vite. Output directory: `dist`.

**One-time manual setup (dashboard work — an agent cannot do this):**

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. **Set the Production Branch to `production`**: Project Settings → Environments → Production → Branch Tracking. This is the step that makes the two-branch model work; skipping it leaves `main` deploying to production.
3. Create the `production` branch: `git branch production` and push it.
4. When the Cart phase arrives, add `VITE_`-prefixed Firebase env vars in Project Settings → Environment Variables.
5. Optional: assign a staging domain to the `main` branch for a stable pre-production URL.

Notes:

- Only `VITE_`-prefixed env vars are exposed to client code by Vite. Anything in the browser bundle is public — never put a secret there.
- `.env` and `.env.local` stay out of git.
- Reverting a commit on `production` restores the previous deployment instantly.

## 14. Vercel MCP

Optional but useful locally:

```bash
claude mcp add --transport http vercel https://mcp.vercel.com
```

Then `/mcp` to authorize via OAuth.

**Use it for:** checking deployment status, pulling build logs to triage a failed deploy, querying Web Analytics, and searching Vercel docs.

**It cannot be used from CI.** Vercel MCP is OAuth-only and restricted to Vercel-approved interactive clients — there is no service-token or headless mode, so a GitHub Actions runner cannot authenticate to it. Don't try to wire it into a workflow. If a pipeline ever needs to talk to Vercel programmatically, that's the Vercel CLI with a `VERCEL_TOKEN` secret, not MCP.

## 15. Feature phases

One PR each, independently shippable:

| #   | Phase        | Contents                                                                                                    |
| --- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| 0   | Scaffold     | Vite React JS, Ply CSS, Zustand, React Router, ESLint/Prettier, `.vscode/`, CI workflows, Vercel connection |
| 1   | Layout shell | Ply navbar, `units-container` layout, routes wired to placeholder pages                                     |
| 2   | Home         | Featured products from `/products?limit=N`                                                                  |
| 3   | Listing      | `/products` with category filter via `?category=` search param                                              |
| 4   | Detail       | `/products/:id` with `images[]` gallery                                                                     |
| 5   | Cart         | `useCartStore` + Vitest coverage of the store                                                               |
| 6   | Persistence  | Firestore cart persistence                                                                                  |
| 7   | Stretch      | Firebase Auth — only if explicitly asked                                                                    |

## 16. Commands

All available after phase 0.

```bash
npm run dev
npm run build
npm run preview
npm test
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## 17. Environment

Windows 10, PowerShell as the primary shell. PowerShell 5.1 does not support `&&` chaining — use `;` for unconditional sequencing or `cmd; if ($?) { next }` for conditional. A Bash tool is also available for POSIX syntax when needed.

Line endings are pinned to LF (see [§9](#9-vscode-setup)) so Prettier's `--check` passes in CI.
