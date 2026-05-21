# Drawer ↔ Tracking-page alignment spec

A live tracking page now exists at `Brain/Projects/tracking-page/` (deployed to
`https://tracking-page-seven.vercel.app`). It's the **destination** of the
"Track" button in your drawer header — a recipient or booker opens the drawer
in delivery history, taps Track, and lands on the tracking page.

Right now the two surfaces use slightly different vocabulary for the same
delivery data. This doc is the contract for getting them in lockstep, so a
record looks like the same record on both surfaces.

The drawer is the **canonical pattern source** for most visual atoms — section
titles, status badges, field rows. The tracking page is the canonical pattern
source for **data shape extensions** — order numbers per stop, a finer-grained
status model, and the photo lightbox header.

---

## 1. Status state model

The drawer brief uses `delivered | active | en-route | pending | canceled`.
The tracking page uses `delivered | arrived | en-route | pending`. The
mismatch is **"active" vs. "arrived"** — same semantic state (driver is at the
stop, not yet completed), different label.

**Reconciliation**: standardize on the tracking page's set —
`pending | en-route | arrived | delivered | canceled`. Drawer's `active`
becomes `arrived`.

| State | Meaning | Badge bg | Dot |
|---|---|---|---|
| `pending` | Stop is queued; driver hasn't started toward it | `#f4ffc7` | `#5d8506` |
| `en-route` | Driver is moving toward the stop | `#d6eafa` | `#216399` |
| `arrived` | Driver is at the stop (formerly "active") | `rgba(199, 255, 234, 0.5)` | `#009571` |
| `delivered` | Stop is complete, POD captured | `rgba(208, 211, 211, 0.4)` | `#7a7a7a` |
| `canceled` | Stop was canceled | `rgba(255, 80, 80, 0.12)` | `#cc2222` |

Badge anatomy is unchanged from the drawer brief: pill, 18px tall,
`border-radius: 16px`, `padding: 0 7px`, 12px label `font-weight: 500`,
sentence case, **no** uppercase, **no** letter-spacing. 6px dot prefix.

---

## 2. Per-stop order numbers (new field)

Both surfaces gain a per-stop `order` field. Industrial-supply convention:

```
order: 'PO-104839-A'
```

Format: `PO-` + 6-digit numeric (the parent PO) + `-` + alpha suffix per stop
(`A` for the first dropoff, `B` for the second, etc.). The pickup stop carries
the parent PO with no suffix: `PO-104839`.

**Where to render**:

| Surface | Treatment |
|---|---|
| Drawer stop card header (collapsed) | Add small tertiary line below the address: `PO-104839-A · 3 items` (tabular-nums, body-small) |
| Drawer stop card expanded body | Already has a "Numbers" field — replace its value with `order` |
| Drawer POD section (`Proof of delivery`) | Group photos by stop and label each group with its PO + stop name |
| Tracking page stop row | Same `PO-104839-A · 3 items` line below address |
| Tracking page POD lightbox header | Include in title: `PO-104839-A · Pacific Plumbing Co. · Photo` |

The tracking page will own the lightbox; the drawer just opens a static grid.

---

## 3. Shared visual atoms

These should be byte-identical across the two surfaces. If your version
differs from the drawer brief, the brief wins.

### 3a. Section titles

ALL CAPS 11px tertiary semibold with 0.6px letter-spacing.

```css
font-size: 11px;
font-weight: 600;
color: var(--text-tertiary);
text-transform: uppercase;
letter-spacing: 0.6px;
margin-bottom: 14px;
```

The tracking page will be migrated to this style.

### 3b. Field/manifest rows (`drw-fields` pattern)

- Bordered 6px-radius container, white surface
- Each row: 36px tall, `padding: 0 14px`, `border-bottom: 0.5px solid var(--border)`
- Label: 11px 500 tertiary, fixed `width: 56px`
- Value: 13px 500 primary
- Optional inline avatar on person rows (22px circle, right-aligned)

This is the drawer brief's existing pattern. The tracking page's Delivery
Details accordion already mirrors this — no change needed on either side as
long as both keep using these exact metrics.

### 3c. Photo cards (POD)

The drawer renders 76×96 portrait cards in the `Proof of delivery` section.
The tracking page renders 34×34 thumbnails in each stop row and a positioned
stack on the map. A future shared component would expose three sizes —
`thumb` (34), `card` (76×96), `hero` (lightbox max-h: 68vh). For now both
sides may keep their own implementations; the contract is just the source:

```
src: `https://loremflickr.com/{w}/{h}/cardboard,parcel?lock={n}`
```

Use the same lock seeds (e.g., the `POD_LOCKS` array in your drawer brief) so
photos are deterministic across surfaces — a given POD on a given stop is the
same image on both.

### 3d. Person rows (Driver, Booker)

Drawer manifest pattern:

- Name (13px 500 primary, left)
- 22px avatar circle (right) — pravatar.cc photo for ~2/3 of names,
  brand-teal background with `#1c1c1c` initials for the rest

This is the **default treatment** in any compact context. The tracking page
shows the driver in a richer way (48px avatar + Call/Message pills), but its
manifest accordion uses this 22px-avatar pattern. Keep them coherent.

### 3e. Role + items label per stop

Drawer already does this: `Pickup · 3 items`, `Dropoff · 2 items`,
`Pickup & Dropoff · 4 items`. Keep the format. The tracking page adopts the
same label (currently shows `address` only — adding the role line next to or
beneath it). The `items` count is a new per-stop field; pick a realistic
distribution (1–5 items, vary by seed).

---

## 4. Specific drawer changes

Concrete tasks for whoever's working on the drawer:

1. **Rename `active` → `arrived`** everywhere (data, badge classes, label
   map). Update `LABEL` const to map `arrived: 'Arrived'`.
2. **Add `order: string | null`** to every stop record. Format per §2.
   Surface in the stop card header (collapsed) and the "Numbers" field
   (expanded) — currently shows the parent record's order, not the stop's.
3. **Add `items: number`** to every stop record. Use it in the role label
   (`Pickup · N items` / `Dropoff · N items`).
4. **Wire the Track button** to open the tracking page with the delivery ID:
   `${TRACKING_BASE_URL}/?delivery=${r.id}` — for now `TRACKING_BASE_URL` can
   be hard-coded to `https://tracking-page-seven.vercel.app`. Future
   integration replaces with a real route.
5. **Status palette** — confirm against the table in §1. If your live values
   drift (e.g. the `prototype-deploy-map` palette evolved), use these
   canonical values.
6. **Section title check** — ALL CAPS 11px tertiary 600 with 0.6px tracking
   everywhere a `.drawer-section-title` shows. No exceptions.
7. **POD photos** — confirm `cardboard,parcel` loremflickr keywords and
   reuse the `POD_LOCKS` array, so the same delivery shows the same photos
   when its tracking page opens.

---

## 5. What stays different

- **Layout**: drawer is a 480px slide-in. Tracking page is fullscreen + map.
  Do not collapse one into the other.
- **Stop pattern**: drawer uses expandable bordered cards (good for compact
  detail). Tracking uses flat rows with a shared connector spine (better for
  map ↔ list sync). Both stay.
- **Driver presentation**: drawer manifest = single Driver row with avatar.
  Tracking = full Driver section with Call + Message pills + a chat panel.
  Both stay.
- **Header**: drawer has a compact route headline (`From → To` or `N stops`)
  + actions. Tracking has a large emotional status hero. The Track button
  is the bridge.

---

## 6. Reference

- Tracking page source: `Brain/Projects/tracking-page/`
- Tracking page live: `https://tracking-page-seven.vercel.app`
- Stop type: `Brain/Projects/tracking-page/src/data/stops.ts`
- Drawer brief: `prototype-deploy-map/drawer-rebuild-brief.md`
