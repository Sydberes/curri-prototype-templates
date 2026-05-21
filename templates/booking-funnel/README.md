# Design System Template

A ready-to-fork scaffold for a design system interactions site. Forks the structure of `core-intelligence` / `design-system-interactions` — sidebar nav, theme toggle, search, Overview grid, AtomDetail with live demo + collapsible source + usage snippet (with optional multi-language tab strip) + usage markdown.

## What's in here

```
template/
├── index.html                        ← page title (replace)
├── package.json                      ← name + dependencies
├── src/
│   ├── App.tsx                       ← shell, registries, brand constants
│   ├── components/
│   │   ├── Button.tsx                ← example production component
│   │   └── Logo.tsx                  ← swap for your brand mark
│   ├── explorations/                 ← one file per documented component
│   ├── styles/
│   │   ├── TOKENS.md                 ← required token names + how to replace
│   │   └── *.css                     ← PLACEHOLDER tokens — swap these in
│   ├── index.css                     ← Tailwind layers + token imports
│   └── main.tsx
├── tsconfig*.json
└── vite.config.ts
```

## First-run checklist

1. **Rename the project**
   ```bash
   # in package.json
   "name": "<your-product>-design-system",
   ```
   And update the page title in `index.html`.

2. **Replace tokens** — see `src/styles/TOKENS.md`. The placeholder tokens are Curri's; replace with yours (package, JSON, or Figma export).

3. **Swap branding**
   - `src/components/Logo.tsx` — replace the placeholder SVG and adjust spacing.
   - `src/App.tsx` top — set `PRODUCT_NAME`, `PAGE_TITLE`, `PAGE_TAGLINE`.

4. **Configure languages** (optional)
   - `src/App.tsx` → `LANGUAGES` array. Uncomment / add entries for each platform (React, Android, iOS, Flutter…).
   - When more than one language is configured, every Atom's `snippet` should be a `Record<string, string>` keyed by language id.

5. **Add your first atom**
   - Create `src/explorations/<Name>.tsx`, export both `<Name>` and `<NameDemo>`.
   - Register in `App.tsx`:
     ```ts
     import { NameDemo } from './explorations/Name'
     import NameSource from './explorations/Name.tsx?raw'

     demoRegistry['name-id']    = <NameDemo />
     previewRegistry['name-id'] = <NamePreview />
     sourceRegistry['name-id']  = NameSource
     ```
   - Add an entry to the `categories` array with `id: 'name-id'`.

6. **Run it**
   ```bash
   npm install
   npm run dev
   ```

7. **Deploy** (optional)
   ```bash
   npx vercel --prod --yes
   ```
   First run creates the Vercel project; subsequent runs deploy to the same stable alias.

## What this template guarantees

- The shell layout (top bar, sidebar, Overview spotlight, AtomDetail flow) is **already done** and matches `core-intelligence` / `design-system-interactions` 1:1.
- The Snippet component has the multi-language tab strip wired but **inactive by default** (only shows when `LANGUAGES.length > 1`).
- All Tailwind / Vite / TypeScript / Base UI / framer-motion / Phosphor / cva / clsx dependencies are pre-configured.
- Theme toggle (light / dark) works as long as your tokens define both themes.

## What this template does NOT include

- Actual design tokens (placeholder Curri tokens are bundled — replace them).
- Any components beyond `Button` (which is a production-style example).
- Vercel project linking (`.vercel/` folder excluded — first `vercel` run will create one).
- Git history (run `git init` after forking).

## Working with an AI agent

This template was designed to be used alongside the **PROMPT.md** in the parent `Design System Kit` folder. Hand both to Claude (or another coding agent) and it'll know how to scaffold components into the right registries with the right conventions.
