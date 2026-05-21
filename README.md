# Curri Prototype Templates

Starter templates for prototyping Curri product surfaces with Claude Code. The companion skill `curri-prototyping-setup` (in `teamcurri/ai-skills`) clones from here and scaffolds a working prototype based on which surface you're designing.

## What's in this repo

```
.
├── templates/
│   ├── booking-funnel/        ← booking flow (multi-step funnel, vehicle selector)
│   ├── delivery-history/      ← admin delivery history + live deliveries
│   ├── route-planner/         ← dispatcher planner (swimlanes + exceptions)
│   └── shell/                 ← generic sidenav + chrome shell for custom surfaces
└── changelog-component/       ← in-app changelog notification (separate concern, see below)
```

## Templates

Each template is a standalone project that runs with `npm install && npm run dev`. They share a stack — React 19 + Vite + Tailwind v4 + Curri tokens — and a set of common dependencies (Base UI, Phosphor icons, framer-motion, class-variance-authority).

| Template | Live reference | Source prototype |
|---|---|---|
| `booking-funnel` | https://ai-booking-experience.vercel.app | `Brain/Projects/ai-booking-experience` |
| `delivery-history` | https://prototype-deploy-map.vercel.app | `Brain/prototype-deploy-map` (static HTML wrapped in Vite) |
| `route-planner` | https://route-planner-exceptions.vercel.app | `Brain/Projects/route-planner-exceptions` |
| `shell` | https://core-intelligence-seven.vercel.app | `Brain/Projects/core-intelligence` (stripped) |

## How to use a template directly

```bash
gh repo clone Sydberes/curri-prototype-templates
cp -r curri-prototype-templates/templates/<name> ~/Workspace/<your-prototype-name>
cd ~/Workspace/<your-prototype-name>
npm install
npm run dev
```

Better: install the `curri-prototyping-setup` skill from `teamcurri/ai-skills` and let it walk you through.

## Changelog Component (separate)

This repo also contains the in-app Changelog Component used inside the Curri app. It lives at `changelog-component/` and deploys to https://changelog-component-lyart.vercel.app. It's unrelated to the templates — same repo for historical reasons.

For changelog-specific docs, see `changelog-component/README.md`.

## Maintainer

Sydney Beres • Product Designer III, Curri • sydney.beres@curri.com
