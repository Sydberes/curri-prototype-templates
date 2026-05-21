# Delivery Drawer — Rebuild Brief

## What you're building

A slide-in detail drawer for Curri's Delivery History page. When a user clicks a row in the delivery table, this drawer opens from the right side of the viewport and shows full details about that delivery.

The drawer is **480px wide**, fixed to the right edge, full viewport height. It slides in with `transform: translateX`. It has a sticky header and a scrollable body.

This is a **vanilla JS + CSS** prototype (no framework). It lives inside a single HTML file. Your job is to implement just the drawer — the CSS, the HTML shell, and the JS functions that populate and open/close it.

---

## Dependencies

```html
<!-- In <head> -->
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css">
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

Icons use Phosphor (`ph` class prefix). E.g. `<i class="ph ph-phone"></i>`.

---

## Design tokens

These CSS custom properties must be defined on `:root`. They are Curri's resolved design system tokens.

```css
:root {
  --surface-primary:        hsl(0, 0%, 99%);
  --surface-sunken:         hsl(0, 0%, 98%);
  --surface-base:           hsl(0, 0%, 96%);
  --surface-primary-hover:  hsl(0, 0%, 96%);
  --border:                 hsla(180, 3%, 82%, 0.6);
  --border-solid:           hsl(180, 3%, 82%);
  --text-primary:           hsl(0, 0%, 11%);
  --text-secondary:         hsl(0, 0%, 38%);
  --text-tertiary:          hsl(0, 0%, 60%);
  --bg-neutral:             hsla(0, 0%, 98%, 0.6);
  --bg-neutral-hover:       hsla(0, 0%, 93%, 0.6);
  --shadow-element:         0px 0.5px 1px rgba(0,0,0,0.10);
  --brand-primary:          hsl(163, 100%, 45%);
}
```

---

## Drawer HTML shell

Place this at the end of `<body>`. It is static markup — the JS fills in `.drawer-hdr` and `#drawerBody` at open time.

```html
<div class="drawer-backdrop" id="drawerBackdrop"></div>
<aside class="drawer" id="detailDrawer">
  <div class="drawer-hdr"></div>
  <div class="drawer-body" id="drawerBody"></div>
</aside>
```

---

## Full drawer CSS

```css
/* Backdrop */
.drawer-backdrop {
  display: none; position: fixed; inset: 0; z-index: 299;
  background: rgba(9,30,66,0.18);
}
.drawer-backdrop.open { display: block; }

/* Drawer container */
.drawer {
  position: fixed; top: 0; right: 0; height: 100vh; width: 480px;
  background: var(--surface-primary); z-index: 300;
  transform: translateX(100%);
  transition: transform 0.22s cubic-bezier(0.32,0,0.15,1);
  display: flex; flex-direction: column;
  border-left: 0.5px solid var(--border-solid);
  box-shadow: -8px 0 24px rgba(9,30,66,0.12);
}
.drawer.open { transform: translateX(0); }

/* Sticky header */
.drawer-hdr {
  flex-shrink: 0; border-bottom: 0.5px solid var(--border);
  padding: 18px 20px 14px; display: flex; flex-direction: column; gap: 12px;
}
.drawer-hdr-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.drawer-route-headline { flex: 1; min-width: 0; }
.drawer-route-from {
  font-size: 16px; font-weight: 500; color: hsl(0,0%,11%); line-height: 23px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.drawer-route-to {
  font-size: 16px; font-weight: 500; color: hsl(0,0%,11%); line-height: 23px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.drawer-close-btn {
  width: 30px; height: 30px; border: none; background: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  border-radius: 6px; color: var(--text-tertiary); margin-top: -2px; flex-shrink: 0;
}
.drawer-close-btn:hover { background: var(--bg-neutral-hover); color: var(--text-secondary); }
.drawer-close-btn i { font-size: 15px; }

.drawer-hdr-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.drawer-hdr-left { display: flex; align-items: center; gap: 8px; }
.drawer-del-id { font-size: 11px; color: var(--text-tertiary); font-variant-numeric: tabular-nums; }

/* Header action buttons */
.drawer-hdr-actions { display: flex; gap: 4px; align-items: center; }
.drawer-btn {
  display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 10px;
  border: 0.5px solid var(--border-solid); border-radius: 4px;
  background: var(--surface-primary); font-size: 11px; font-weight: 500;
  font-family: 'Inter', sans-serif; color: var(--text-primary); cursor: pointer;
  white-space: nowrap; box-shadow: var(--shadow-element);
}
.drawer-btn:hover { background: var(--surface-primary-hover); }
.drawer-btn i { font-size: 12px; color: var(--text-secondary); }
.drawer-btn.teal {
  background: hsl(163,100%,40%); border-color: hsl(163,100%,34%);
  color: #0a1a15; box-shadow: none;
}
.drawer-btn.teal:hover { background: hsl(163,100%,35%); }
.drawer-btn.teal i { color: #0a1a15; }
.drawer-more-btn {
  width: 28px; height: 28px; border: 0.5px solid var(--border-solid); border-radius: 4px;
  background: var(--surface-primary); cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-secondary); box-shadow: var(--shadow-element);
}
.drawer-more-btn i { font-size: 14px; }

/* Scrollable body */
.drawer-body { flex: 1; overflow-y: auto; }

/* Section header */
.drawer-section { padding: 20px 20px 4px; }
.drawer-section-title {
  font-size: 11px; font-weight: 600; color: var(--text-tertiary);
  text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 14px;
}

/* Status badges — shared with table */
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  height: 18px; padding: 0 7px; border-radius: 16px;
  font-size: 12px; font-weight: 500; white-space: nowrap; flex-shrink: 0;
}
.dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.badge-delivered  { background: rgba(208,210,210,0.4); }
.badge-delivered .dot { background: #7a7a7a; }
.badge-active     { background: #d6f5ec; }
.badge-active .dot { background: #12936b; }
.badge-en-route   { background: #d6eafa; }
.badge-en-route .dot { background: #216399; }
.badge-pending    { background: #fef3cd; }
.badge-pending .dot { background: #b07d0a; }
.badge-canceled   { background: #fde8e8; }
.badge-canceled .dot { background: #c0392b; }
/* "Demo" badge used in fake data */
.badge-demo       { background: #d6eafa; }
.badge-demo .dot  { background: #216399; }

/* Stop cards */
.stop-cards { display: flex; flex-direction: column; gap: 8px; }
.stop-card {
  border: 0.5px solid var(--border-solid); border-radius: 6px;
  overflow: hidden; background: var(--surface-primary);
}
.stop-card-hdr {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 10px; padding: 12px 14px; cursor: pointer;
}
.stop-card-hdr-left { flex: 1; min-width: 0; }
.stop-card-hdr-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; padding-top: 2px; }
.stop-card-addr {
  font-size: 13px; font-weight: 600; color: var(--text-primary);
  margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.stop-card-role { font-size: 12px; color: var(--text-tertiary); line-height: 18px; }
.stop-card-edit {
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 4px;
  background: none; border: none; cursor: pointer; color: var(--text-tertiary); flex-shrink: 0;
}
.stop-card-edit:hover { background: var(--bg-neutral-hover); color: var(--text-secondary); }
.stop-card-edit i { font-size: 13px; }
.stop-card-caret { font-size: 14px; color: var(--text-tertiary); transition: transform 0.18s ease; flex-shrink: 0; }
.stop-card.sc-expanded .stop-card-caret { transform: rotate(180deg); }

/* Stop card expanded body */
.stop-card-body {
  display: none; border-top: 0.5px solid var(--border);
  padding: 0 14px; background: var(--surface-sunken);
}
.stop-card.sc-expanded .stop-card-body { display: block; }
.sc-field { padding: 10px 0; border-bottom: 0.5px solid var(--border); }
.sc-field:last-child { border-bottom: none; padding-bottom: 12px; }
.sc-field-lbl {
  font-size: 10px; font-weight: 700; color: var(--text-tertiary);
  text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px;
}
.sc-field-val { font-size: 13px; font-weight: 500; color: var(--text-primary); line-height: 1.4; }
.sc-field-sub { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }
.sc-call-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 2px;
  border: 0.5px solid var(--border-solid); background: var(--surface-primary);
  cursor: pointer; flex-shrink: 0; box-shadow: var(--shadow-element);
}
.sc-call-btn i { font-size: 13px; color: var(--text-secondary); }

/* Proof of delivery */
.proof-photos { display: flex; gap: 8px; flex-wrap: wrap; }
.proof-photo-card {
  width: 76px; height: 96px; border-radius: 4px;
  border: 0.5px solid var(--border-solid);
  overflow: hidden; flex-shrink: 0; cursor: pointer;
}
.proof-photo-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
.proof-photo-placeholder {
  background: var(--surface-base);
  display: flex; align-items: center; justify-content: center;
}
.proof-photo-placeholder i { font-size: 18px; color: var(--border-solid); }

/* Delivery details table */
.drw-fields {
  margin: 20px 20px 0;
  border: 0.5px solid var(--border-solid); border-radius: 6px;
  overflow: hidden; background: var(--surface-primary); position: relative;
}
.drw-fields-edit {
  position: absolute; top: 0; right: 0; width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; cursor: pointer; color: var(--text-tertiary); z-index: 1;
}
.drw-fields-edit:hover { color: var(--text-secondary); }
.drw-fields-edit i { font-size: 13px; }
.drw-field {
  display: flex; align-items: center; gap: 12px;
  height: 36px; padding: 0 14px; border-bottom: 0.5px solid var(--border);
}
.drw-field:last-child { border-bottom: none; }
.drw-field-lbl { font-size: 11px; font-weight: 500; color: var(--text-tertiary); width: 56px; flex-shrink: 0; }
.drw-field-val { flex: 1; font-size: 13px; font-weight: 500; color: var(--text-primary); min-width: 0; }
.drw-field-val.empty { color: var(--text-tertiary); font-weight: 400; }
.drw-field-person { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.field-avatar {
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0;
  letter-spacing: 0.3px; overflow: hidden; object-fit: cover;
}
```

---

## JS — utility functions

```js
// Deterministic seed from a string (character code sum)
function detSeed(id) {
  return id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}

// Deterministic pick from an array
function detPick(id, salt, arr) {
  return arr[detSeed(id + salt) % arr.length];
}

// Status label map
const LABEL = {
  delivered: 'Delivered',
  active:    'Active',
  'en-route':'En route',
  pending:   'Pending',
  canceled:  'Canceled',
};
```

---

## JS — avatar system

Avatars are assigned deterministically per person name. ~2/3 of names get a real photo from pravatar.cc; the rest get initials on brand teal.

```js
const AVATAR_INITIALS_BG = 'hsl(163,100%,45%)'; // brand teal
const AVATAR_INITIALS_FG = '#1c1c1c';

function avatarFor(name) {
  if (!name) return { type:'initials', initials:'?', bg:'#ebebeb', fg:'#999' };
  const seed = detSeed(name);
  const parts = name.trim().split(/\s+/);
  const initials = parts.map(p => p[0]).filter(Boolean).slice(0,2).join('').toUpperCase();
  if (seed % 3 !== 0) {
    return { type:'photo', url:`https://i.pravatar.cc/64?img=${(seed % 70) + 1}` };
  }
  return { type:'initials', initials, bg: AVATAR_INITIALS_BG, fg: AVATAR_INITIALS_FG };
}

function avatarHTML(av) {
  if (av.type === 'photo') return `<img class="field-avatar" src="${av.url}" alt="">`;
  return `<div class="field-avatar" style="background:${av.bg};color:${av.fg};">${av.initials}</div>`;
}
```

---

## JS — proof of delivery photos

When a delivery has POD photos (`s.proof > 0`), show real cardboard/parcel photos from loremflickr. When none yet, show grey placeholder cards.

```js
const POD_LOCKS = [3, 11, 17, 24, 31, 38, 45, 52, 59, 66, 73, 80];

function collectedProofHTML(stops, delId) {
  const total = stops.reduce((acc, s) => acc + (s.proof || 0), 0);
  if (total > 0) {
    const baseSeed = detSeed((delId || '') + 'pod');
    const photos = Array.from({ length: Math.min(total, 6) }, (_, i) => {
      const lock = POD_LOCKS[(baseSeed + i) % POD_LOCKS.length];
      return `<div class="proof-photo-card">
        <img src="https://loremflickr.com/160/160/cardboard,parcel?lock=${lock}" alt="POD photo" loading="lazy">
      </div>`;
    }).join('');
    return `<div class="proof-photos">${photos}</div>`;
  }
  const placeholder = `<div class="proof-photo-card proof-photo-placeholder"><i class="ph ph-image"></i></div>`;
  return `<div class="proof-photos">${placeholder}${placeholder}</div>`;
}
```

---

## JS — openDrawer function

This is called with a delivery record `r`. See the data model section below for `r`'s shape.

```js
function openDrawer(r) {
  const body = document.getElementById('drawerBody');
  const seed = detSeed(r.id);
  const isMulti = !!r.stops;

  const from = isMulti ? r.stops[0].address : r.from;
  const to   = isMulti ? r.stops[r.stops.length - 1].address : r.to;

  const vehicle = detPick(r.id, 'v', ['Car', 'Van', 'Cargo van', 'Pickup truck', 'Parcel']);
  const timing  = detPick(r.id, 't', ['Rush', 'Same-day', 'Scheduled']);
  const driverDisplay = (r.driver && r.driver !== '—') ? r.driver : null;

  // Normalise stops array
  let stops;
  if (isMulti) {
    stops = r.stops.map(s => ({
      ...s,
      note: s.note || detPick(r.id + s.num, 'note', [
        'Call when arriving.',
        'Ring the bell at the back entrance.',
        'Ask for the warehouse manager.',
        '',
      ]),
    }));
  } else {
    const pickupNote  = detPick(r.id, 'pn', ['Call when arriving.','Ring the bell at the back entrance.','Ask for the warehouse manager.','']);
    const dropoffNote = detPick(r.id, 'dn', ['Leave with the receptionist.','Please deliver to the roofers onsite.','Requires signature on delivery.','']);
    stops = [
      { num:1, address:r.from, recipient:r.booker,     status:'delivered', proof:0,       order:null,    note:pickupNote  },
      { num:2, address:r.to,   recipient:r.recipient,  status:r.status,    proof:r.proof, order:r.order, note:dropoffNote },
    ];
  }

  // ── Header ──
  const hdr = document.getElementById('detailDrawer').querySelector('.drawer-hdr');
  hdr.innerHTML = `
    <div class="drawer-hdr-top">
      <div class="drawer-route-headline">
        <div class="drawer-route-from">${isMulti ? `${r.stops.length} stops` : from + ' →'}</div>
        ${!isMulti ? `<div class="drawer-route-to">${to}</div>` : ''}
      </div>
      <button class="drawer-close-btn" id="drawerClose"><i class="ph ph-x"></i></button>
    </div>
    <div class="drawer-hdr-meta">
      <div class="drawer-hdr-left">
        <span class="badge badge-${r.status}"><span class="dot"></span>${LABEL[r.status]}</span>
        <span class="drawer-del-id">${r.id}</span>
      </div>
      <div class="drawer-hdr-actions">
        <button class="drawer-btn teal"><i class="ph ph-share-network"></i>Track</button>
        <button class="drawer-btn"><i class="ph ph-file-text"></i>Bill of lading</button>
        <button class="drawer-more-btn"><i class="ph ph-dots-three"></i></button>
      </div>
    </div>`;

  document.getElementById('drawerClose').addEventListener('click', closeDrawer);

  // ── Stop cards ──
  const stopCardsHTML = stops.map((s, i) => {
    const isFirst = i === 0;
    const isLast  = i === stops.length - 1;
    const itemType = detPick(r.id + s.num, 'it', ['Small item','Medium box','Large item','Padded Envelope','Pallet']);
    const itemDim  = detPick(r.id + s.num, 'id', ['6" L × 6" W × 6" H','12" L × 10" W × 8" H','16" L × 11" W × 2" H','24" L × 18" W × 6" H']);
    const itemQty  = detPick(r.id + s.num, 'iq', [1,2,3,4,6]);
    const itemWt   = (((detSeed(r.id + s.num + 'w') % 50) + 1) * 0.3).toFixed(1);

    const roleLabel = (isFirst && isLast) ? `Pickup & Dropoff · ${itemQty} item${itemQty !== 1 ? 's' : ''}`
                    : isFirst             ? `Pickup · ${itemQty} item${itemQty !== 1 ? 's' : ''}`
                    : isLast              ? `Dropoff · ${itemQty} item${itemQty !== 1 ? 's' : ''}`
                    :                       `Pickup & Dropoff · ${itemQty} item${itemQty !== 1 ? 's' : ''}`;

    // Expanded body — always show all 4 fields
    const fields = [];
    if (s.recipient && s.recipient !== '—') {
      fields.push({ lbl:'Contact', val: s.recipient, call: true });
    }
    fields.push({ lbl:'Details',  val:`${itemQty}× ${itemType}`, sub:`${itemDim} · ${itemWt} lbs` });
    fields.push({ lbl:'Numbers',  val: s.order || '—' });
    fields.push({ lbl:'Notes',    val: s.note  || '—' });

    const bodyHTML = fields.map(f => `
      <div class="sc-field">
        <div class="sc-field-lbl">${f.lbl}</div>
        <div class="sc-field-val"${f.call ? ' style="display:flex;align-items:center;justify-content:space-between;"' : ''}>
          <span>${f.val}</span>
          ${f.call ? `<button class="sc-call-btn"><i class="ph ph-phone"></i></button>` : ''}
        </div>
        ${f.sub ? `<div class="sc-field-sub">${f.sub}</div>` : ''}
      </div>`).join('');

    return `<div class="stop-card">
      <div class="stop-card-hdr">
        <div class="stop-card-hdr-left">
          <div class="stop-card-addr">${s.address}</div>
          <div class="stop-card-role">${roleLabel}</div>
        </div>
        <div class="stop-card-hdr-right">
          <span class="badge badge-${s.status || 'pending'}"><span class="dot"></span>${LABEL[s.status] || s.status}</span>
          <button class="stop-card-edit"><i class="ph ph-pencil-simple"></i></button>
          <i class="ph ph-caret-down stop-card-caret"></i>
        </div>
      </div>
      <div class="stop-card-body">${bodyHTML}</div>
    </div>`;
  }).join('');

  // ── Body HTML ──
  body.innerHTML = `
    <div class="drawer-section">
      <div class="drawer-section-title">Stops — ${stops.length} total</div>
      <div class="stop-cards">${stopCardsHTML}</div>
    </div>

    <div class="drawer-section" style="padding-top:20px;">
      <div class="drawer-section-title">Proof of delivery</div>
      ${collectedProofHTML(stops, r.id)}
    </div>

    <div class="drw-fields">
      <button class="drw-fields-edit"><i class="ph ph-pencil-simple"></i></button>
      <div class="drw-field">
        <div class="drw-field-lbl">Vehicle</div>
        <div class="drw-field-val">${vehicle}</div>
      </div>
      <div class="drw-field">
        <div class="drw-field-lbl">Timing</div>
        <div class="drw-field-val">${timing}</div>
      </div>
      <div class="drw-field">
        <div class="drw-field-lbl">Driver</div>
        <div class="drw-field-val drw-field-person ${!driverDisplay ? 'empty' : ''}">
          <span>${driverDisplay || 'Pending'}</span>
          ${driverDisplay ? avatarHTML(avatarFor(driverDisplay)) : ''}
        </div>
      </div>
      <div class="drw-field">
        <div class="drw-field-lbl">Booker</div>
        <div class="drw-field-val drw-field-person">
          ${r.booker || '—'}
          ${avatarHTML(avatarFor(r.booker || '—'))}
        </div>
      </div>
      <div class="drw-field">
        <div class="drw-field-lbl">Price</div>
        <div class="drw-field-val">${r.price}</div>
      </div>
    </div>

    <div class="drawer-section" style="padding-top:20px; padding-bottom:28px;">
      <div class="drawer-section-title">Attachments</div>
      <p style="font-size:12px; color:var(--text-tertiary); line-height:17px; margin-top:2px;">No attachments</p>
    </div>
  `;

  // Wire up stop card expand/collapse + edit button isolation
  body.querySelectorAll('.stop-card').forEach(card => {
    card.querySelector('.stop-card-hdr').addEventListener('click', () => card.classList.toggle('sc-expanded'));
    card.querySelector('.stop-card-edit').addEventListener('click', e => e.stopPropagation());
  });

  document.getElementById('drawerBackdrop').classList.add('open');
  document.getElementById('detailDrawer').classList.add('open');
}

function closeDrawer() {
  document.getElementById('drawerBackdrop').classList.remove('open');
  document.getElementById('detailDrawer').classList.remove('open');
}

// Close on backdrop click or Escape
document.getElementById('drawerBackdrop').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
```

---

## Data model

### Standard delivery record `r`

```js
{
  id:        'del_784567',          // display ID, used as seed for deterministic fakes
  status:    'delivered',           // 'delivered' | 'active' | 'en-route' | 'pending' | 'canceled'
  from:      '845 First St',        // pickup address
  to:        '345 Divisadero St',   // dropoff address
  booker:    'Emily Petersen',       // person who booked
  recipient: 'Chalk Silvs',         // recipient at dropoff
  driver:    'Shanika J.',           // driver name, or '—' if unassigned
  price:     '$19.28',
  proof:     2,                      // number of POD photos (0 = none yet)
  order:     'KXPQRT...',           // order/PO number, or null
}
```

### Multi-stop delivery record `r` (MSD)

```js
{
  id:        'del_msd_001',
  status:    'active',
  booker:    'Marcus Webb',
  driver:    'Diane W.',
  price:     '$124.00',
  stops: [
    { num:1, address:'400 Howard St',   recipient:'Troy Williams', status:'delivered', proof:2, order:'ORD-001', note:'' },
    { num:2, address:'900 Brannan St',  recipient:'Dana Cruz',     status:'active',    proof:0, order:'ORD-002', note:'Call when arriving.' },
    { num:3, address:'1550 Mission St', recipient:'Ben Harris',    status:'pending',   proof:0, order:null,      note:'' },
  ],
  // note: no top-level from/to on MSD records
}
```

### Stop object fields

| Field       | Type     | Notes |
|-------------|----------|-------|
| `num`       | number   | Stop number (1-indexed) |
| `address`   | string   | Street address |
| `recipient` | string   | Contact name at this stop |
| `status`    | string   | `'delivered'` \| `'active'` \| `'pending'` |
| `proof`     | number   | Count of POD photos uploaded |
| `order`     | string\|null | Order or PO number |
| `note`      | string   | Delivery instruction (may be empty string) |

---

## Design principles (validated by Syd)

- **Flat and simple** — no progress trackers with dots and lines, no heavy accordions as the primary structure
- **Hierarchy through typography** — section titles are ALL CAPS 11px tertiary; values are 13px medium primary
- **Stop cards are individual bordered cards** with gap between them, not rows inside one shared list
- **Each stop card shows one role sub-line** ("Pickup · N items", "Dropoff · N items", "Pickup & Dropoff · N items") — single line keeps all cards the same height
- **Edit pencils** are non-intrusive: per-stop pencil in the card header (stops propagation), fields table pencil absolutely positioned top-right
- **Proof of delivery is high priority** — placed before the fields table, real photos when available, grey placeholders when not
- **Driver unassigned = "Pending"** (not "—") in the drawer only; main table still shows "—"
- **Avatars**: brand teal (`hsl(163,100%,45%)`) background with `#1c1c1c` text for initials; real pravatar.cc photos for ~2/3 of names
- **Border radius**: 6px for cards/tables, 4px for photo cards and buttons — not rounded, matches Curri DS
- **No summaries at end of responses** — Syd can read the diff
