# Tracking Page

Customer-facing delivery tracking prototype — the page a booker or recipient opens from a tracking link. Live on `tracking-page-seven.vercel.app`.

## What's in here

```
tracking-page/
├── index.html
├── package.json
├── src/
│   ├── App.tsx                    ← view state, sim loop, booker/receiver mode
│   ├── components/
│   │   ├── HeroStatus.tsx         ← headline + ETA/status line
│   │   ├── RouteMap.tsx           ← Leaflet route map, stop pins, driver
│   │   ├── StopsSection.tsx       ← stop timeline (nodes, payload, PODs)
│   │   ├── DeliveryDetailsCard.tsx, DriverSection.tsx, MessagePanel.tsx,
│   │   ├── RatingPanel.tsx, PodViewer.tsx, MobileContent.tsx, …
│   │   └── DemoControls.tsx       ← floating prototype remote (simulate + view)
│   ├── data/stops.ts              ← route/stop model + single-leg derivation
│   ├── styles/                    ← Curri design tokens (light + dark)
│   ├── index.css
│   └── main.tsx
├── public/                        ← favicon, icons, van marker
├── tsconfig*.json
└── vite.config.ts
```

## Two views

- **Booker view** — the full multi-stop route: every stop, ETAs, payload manifest.
- **Receiver view** — collapsed to a single leg (pickup → your dropoff), route-wide detail hidden.

Toggle between them with the floating **Demo** remote (also simulates the route progressing).

## States

Stops move through `pending → en-route → arrived → delivered`, plus a terminal
`cancelled` state for a stop pulled from the route. A cancelled stop reads as a
dimmed neutral node with a red "Canceled" badge in the list and a muted-grey pin
on the map (hover shows the Curri DS Tooltip); it's skipped by the sim and the
route completes once the remaining stops deliver.

## Run

```bash
npm install
npm run dev      # local dev
npm run build    # production build (run before deploying — Vercel fails silently)
```

## Tokens

Curri design tokens live in `src/styles/`. See `src/styles/TOKENS.md` for the
required token names and how to replace them for another brand.
