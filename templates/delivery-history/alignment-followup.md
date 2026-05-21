# Drawer alignment — follow-up

Thanks for the first pass! `Track`, `Bill of lading`, the PO field, items count,
person rows with avatars, and the 76×96 POD cards all look great.

**The goal here**: the drawer and the tracking page should read as two views
of the same delivery — same data shape, same vocabulary, same atoms. A user
who opens the drawer in delivery history and clicks Track should land on the
tracking page and feel like they're already inside the same experience.

A few things from the first pass didn't quite land — fixes below.

## 1. Status label: "Complete" → "Delivered"

The stop card on the pickup row currently shows a badge labeled **Complete**.
The canonical state name from the spec is `delivered`, label `Delivered`. Update
your `LABEL` map:

```js
const LABEL = {
  delivered: 'Delivered',
  arrived:   'Arrived',    // was 'Active' — rename per §1 of the spec
  'en-route':'En route',
  pending:   'Pending',
  canceled:  'Canceled',
}
```

There should be no `Complete` or `Active` status anywhere. Also drop the badge
class `badge-complete` if present — use `badge-delivered`.

## 2. Drop the "Demo" status

Both the drawer header and the dropoff stop currently show a badge labeled
**Demo** with a blue dot. That's left over from your seed/sample data and
isn't in the canonical state set. Map any seeded record with `status: 'demo'`
to one of: `pending | en-route | arrived | delivered | canceled`. (Most of
your demo records should land as `delivered` or `pending`.)

If you've been using `badge-demo` as a "fake data" indicator during dev,
either remove it or keep it dev-only (gated behind a flag) — it shouldn't
ship in the standard render path.

## 3. PO + items: one line, not two

The stop cards currently render two lines that both include the items count:

```
PO-784567 · 5 items       ← PO line
Pickup · 5 items           ← role line
```

The intent in the spec was **one place for items**, not both. The cleaner
breakdown:

```
PO-784567                  ← PO line (no items count)
Pickup · 5 items           ← role line (items count lives here)
```

So:
- The **PO line** is just the order number, no `· N items` suffix.
- The **role label** stays `Pickup · N items` / `Dropoff · N items` /
  `Pickup & Dropoff · N items` (drawer's existing pattern).

Order in the stop card header (top to bottom):
1. Address (`13px 600 primary`)
2. PO line (`12px 500 tertiary, tabular-nums`)
3. Role + items line (`12px 500 tertiary`)

## 4. Section title format

The "STOPS — 2 TOTAL" title is close but adds an inline count separator. The
drawer's canonical section title is just the noun:

```
STOPS                       ← ALL CAPS 11px 600 tertiary, 0.6px tracking
```

If you want to surface the count, do it on a separate tertiary line below the
title (12px 500 tertiary, normal case), not appended with an em-dash. Same
treatment for `PROOF OF DELIVERY`.

## 5. Track button URL

The Track button is in place but it should open the tracking page with the
delivery ID as a query param:

```js
window.open(`https://tracking-page-seven.vercel.app/?delivery=${r.id}`, '_self')
```

(For now `_self` is fine; the tracking page doesn't yet read the param but
will eventually.)

---

That's it — once these land the two surfaces should look like they belong to
the same product. (Don't worry about the actual POD photo content/seeds —
visual alignment of the *cards* matters; the imagery underneath isn't part
of this pass.) Original spec at `alignment-with-tracking-page.md`.
