# Shell Template

Generic starter for Curri product surfaces that don't fit booking, delivery history, or route planner. Includes:

- Top chrome — Curri lockup (left), search (center), light/dark toggle (right)
- Left sidebar — placeholder nav (Overview, Deliveries, Routes, Reports, Settings)
- Main content area — centered, max-width container with a "Replace me" starter

## Stack

React 19 + Vite + Tailwind v4 + Curri tokens. Base UI + Phosphor icons available. No app-specific dependencies — add what you need.

## Run

```bash
npm install
npm run dev
```

## Customize

1. Edit `src/App.tsx` to change the nav, top chrome, or starter content.
2. Replace `Curri` text in the header with the appropriate brand mark.
3. Tokens live in `src/styles/` — same as every Curri prototype. Do not edit token values; reference them via CSS custom properties.

## What this template intentionally does NOT include

- No data layer, routing, or state management. Add `react-router-dom`, `zustand`, etc. when needed.
- No table, drawer, or modal components. Those come from `curri-components` (read-only reference) — re-build inside the prototype using tokens.
- No specific domain content. Start blank, build only the surface you're prototyping.
