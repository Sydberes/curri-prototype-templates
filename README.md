# Changelog Component

In-app changelog notification and modal for the Curri app. Surfaces product updates from a Notion database.

## Links

- **Demo**: https://changelog-component-lyart.vercel.app
- **Mockup** (in-app placement): https://changelog-component-lyart.vercel.app/mockup
- **Figma**: https://www.figma.com/design/fKjY6fv5uXyXNYp53ZAC8C/1.-Curri-UI-Library-v1.3?node-id=1517-75
- **Releases page** (live): https://www.curri.com/blog?category=updates

## What to integrate

These are the only files that go into the Curri app:

| File | Purpose |
|------|---------|
| `src/components/changelog/ChangelogNotification.tsx` | Sidebar notification (text-only and with-image variants) |
| `src/components/changelog/ChangelogPanel.tsx` | Modal that opens on click |
| `src/components/changelog/ChangelogFeatureCard.tsx` | Feature card inside the modal |
| `src/components/changelog/types.ts` | Shared TypeScript types |
| `src/hooks/useChangelog.ts` | Manages seen state via localStorage |
| `src/lib/changelog.server.ts` | Fetches entries from Notion (server-side) |

Everything else in this repo is demo scaffolding.

## How it works

1. `fetchChangelogEntries()` queries a Notion database and maps rows to `ChangelogEntry[]`
2. The Curri app exposes this via an API route (see `src/app/api/changelog/route.ts`)
3. `useChangelog` fetches from that route, tracks the last-seen entry ID in localStorage, and exposes `isNotifVisible`, `openPanel`, and `dismissNotification`
4. `ChangelogNotification` renders in the sidebar — use the `withPreview` prop for the image variant
5. Clicking opens `ChangelogPanel`; dismissing hides the notification until a newer entry is published

## Notion setup

The fetch logic expects these environment variables:

```
NOTION_TOKEN=your_notion_integration_token
NOTION_CHANGELOG_DATABASE_ID=your_database_id
```

See `src/lib/changelog.server.ts` for the full query. Uses `@notionhq/client` v5 — note that v5 uses `notion.dataSources.query()`, not `databases.query()`.

## Design tokens

Components use curri-styles tokens. See `src/app/globals.css` for the full token reference — in the Curri app these resolve automatically via curri-styles, no extra setup needed.

## Placement

Notification sits at the bottom of the main nav sidebar, above the divider that separates nav items from utility links (Theme, Help & support, Log out).
