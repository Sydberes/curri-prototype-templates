# Delivery History Template

Admin view: delivery history + live deliveries. Drawer + status vocabulary aligned with the customer tracking page.

## Stack

This template is a **static HTML prototype** wrapped in a minimal Vite shell. The entire UI lives in `index.html` as one file with inline styles and scripts — no React, no build step beyond Vite's static-file serving.

This is intentional: the original prototype (`prototype-deploy-map`) was built as a single HTML file for speed and to keep the spec-driven iteration loop tight. The other Curri prototype templates use Vite + React + TS — this one is the exception.

## Run

```bash
npm install
npm run dev
```

Opens at http://localhost:5173.

## Specs (read before editing)

These markdown files in the folder are the source of truth for the design:

- `alignment-with-tracking-page.md` — cross-prototype alignment with the customer tracking page
- `alignment-followup.md` — additional alignment notes
- `drawer-rebuild-brief.md` — the drawer rebuild rationale and constraints

Claude should read these before any drawer or status changes.

## Live reference

https://prototype-deploy-map.vercel.app
