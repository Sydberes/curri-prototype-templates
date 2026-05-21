# Route Planner Exceptions

Prototype exploring how exceptions surface inside Curri's Route Planner.

## Scope

- **Driver-side** — late, no-show, off-route
- **Route-side** — over-capacity, infeasible stop, time window conflict
- **Stop-side** — stop-related issues

## Views

1. **Exceptions list** — table/list of all active exceptions
2. **Tracking** — live route view with inline exception notifications that let the user resolve issues in-place or jump to the exceptions list for details

## Stack

React 19 + Vite + Tailwind v4 + Curri tokens. Auto-deploys to Vercel.

## Dev

```
npm install
npm run dev
```

## Deploy

```
npx vercel --prod --yes
```
