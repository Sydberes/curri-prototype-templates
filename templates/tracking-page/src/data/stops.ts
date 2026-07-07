export type StopStatus =
  | 'pending'
  | 'en-route'
  | 'arrived'
  | 'delivered'
  | 'cancelled'

export type Pod = {
  src: string
  label: string
}

export type Stop = {
  id: string
  index: number
  kind: 'pickup' | 'dropoff'
  name: string
  address: string
  contact?: string
  eta: string
  status: StopStatus
  pods?: Pod[]
  lat: number
  lng: number
  /** Purchase Order number. Each dropoff has its own PO. */
  order: string
  /** Pickups can load multiple orders — every PO aboard with its item count, one per receiver. */
  orders?: { order: string; items: number }[]
  /** Number of items at this stop (used in role label e.g. "Dropoff · 3 items"). */
  items: number
}

/** Default dropoff a recipient sees when a single-leg link omits a stop id. */
export const DEFAULT_LEG_STOP_ID = 's3'

/**
 * Collapse the full route down to the leg a single recipient is allowed to see:
 * the pickup → their own dropoff, re-indexed 1→2 so the rest of the route
 * (count, addresses, other orders) never leaks. The two nodes' statuses are
 * derived into a coherent "picking up → on the way to you → delivered"
 * narrative; the driver visiting other stops in between just reads as
 * "on the way to you."
 */
export function deriveLegStops(stops: Stop[], legStopId: string): Stop[] {
  const pickup = stops[0]
  const mine = stops.find((s) => s.id === legStopId) ?? stops[1]
  const lp: Stop = { ...pickup, index: 1 }
  const lm: Stop = { ...mine, index: 2 }

  // The pickup row only shows the receiver's own order — other POs aboard
  // (and the route-wide item total) stay private.
  lp.order = lm.order
  lp.orders = undefined
  lp.items = lm.items

  if (mine.status === 'cancelled') {
    // The receiver's own stop was pulled from the route — the pickup still
    // happened, but their leg ends here.
    lp.status = 'delivered'
    lm.status = 'cancelled'
  } else if (mine.status === 'delivered') {
    lp.status = 'delivered'
    lm.status = 'delivered'
  } else if (mine.status === 'arrived') {
    lp.status = 'delivered'
    lm.status = 'arrived'
  } else if (mine.status === 'en-route') {
    lp.status = 'delivered'
    lm.status = 'en-route'
  } else if (pickup.status === 'delivered') {
    // Driver is past pickup, working other stops — read as heading to you.
    lp.status = 'delivered'
    lm.status = 'en-route'
  } else {
    // Pre-pickup: mirror the pickup's own progress, your stop still pending.
    lp.status = pickup.status
    lm.status = 'pending'
  }

  return [lp, lm]
}

export const INITIAL_STOPS: Stop[] = [
  {
    id: 's1',
    index: 1,
    kind: 'pickup',
    name: 'Westcoast Industrial Supply',
    address: '9637 Greene Ave · Burbank',
    contact: 'Warehouse #4 · Dock B',
    eta: '11:25 AM',
    status: 'pending',
    lat: 34.1875,
    lng: -118.3092,
    order: 'PO-104839',
    orders: [
      { order: 'PO-104839', items: 3 },
      { order: 'PO-104912', items: 5 },
      { order: 'PO-104946', items: 2 },
      { order: 'PO-105003', items: 4 },
    ],
    items: 14,
  },
  {
    id: 's2',
    index: 2,
    kind: 'dropoff',
    name: 'Pacific Plumbing Co.',
    address: '5421 Pacific Blvd · Huntington Park',
    contact: 'Marcy R. · Receiving',
    eta: '11:52 AM',
    status: 'pending',
    lat: 33.9714,
    lng: -118.215,
    order: 'PO-104839',
    items: 3,
  },
  {
    id: 's3',
    index: 3,
    kind: 'dropoff',
    name: 'Harbor Mechanical Services',
    address: '1180 Long Beach Blvd · Long Beach',
    contact: 'Jamal T. · Project foreman',
    eta: '12:18 PM',
    status: 'pending',
    lat: 33.7794,
    lng: -118.1955,
    order: 'PO-104912',
    items: 5,
  },
  {
    id: 's4',
    index: 4,
    kind: 'dropoff',
    name: 'Seal Beach Electric Supply',
    address: '328 Main St · Seal Beach',
    contact: 'Will-call counter',
    eta: '12:46 PM',
    status: 'cancelled',
    lat: 33.7414,
    lng: -118.1048,
    order: 'PO-104946',
    items: 2,
  },
  {
    id: 's5',
    index: 5,
    kind: 'dropoff',
    name: 'Newport Coast Construction',
    address: '21130 Newport Coast Dr · Newport Beach',
    contact: 'Site gate · Bldg 3',
    eta: '1:14 PM',
    status: 'pending',
    lat: 33.5837,
    lng: -117.855,
    order: 'PO-105003',
    items: 4,
  },
]
