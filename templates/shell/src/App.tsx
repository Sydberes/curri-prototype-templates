import { useEffect, useState } from 'react'
import { MagnifyingGlass, Moon, Sun, House, Truck, MapTrifold, ChartBar, Gear } from '@phosphor-icons/react'
import { Button } from './components/Button'

const NAV = [
  { icon: House, label: 'Overview' },
  { icon: Truck, label: 'Deliveries' },
  { icon: MapTrifold, label: 'Routes' },
  { icon: ChartBar, label: 'Reports' },
  { icon: Gear, label: 'Settings' },
]

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [active, setActive] = useState('Overview')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="min-h-screen text-[color:var(--color-text-primary)]">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-[color:var(--color-border-subtle)] bg-[color:var(--color-elevation-surface-primary)] px-4">
        <div className="text-sm font-semibold tracking-tight">Curri</div>
        <div className="relative ml-auto w-72">
          <MagnifyingGlass size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-[color:var(--color-text-tertiary)]" />
          <input
            type="search"
            placeholder="Search"
            className="h-8 w-full rounded-md border border-[color:var(--color-border-subtle)] bg-transparent pl-8 pr-3 text-sm outline-none placeholder:text-[color:var(--color-text-tertiary)] focus:border-[color:var(--color-border-bold)]"
          />
        </div>
        <button
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="grid h-8 w-8 place-items-center rounded-md border border-[color:var(--color-border-subtle)] hover:bg-[color:var(--color-elevation-surface-raised)]"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </header>

      <div className="flex">
        <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-[color:var(--color-border-subtle)] bg-[color:var(--color-elevation-surface-primary)] px-2 py-4">
          <nav className="flex flex-col gap-0.5">
            {NAV.map(({ icon: Icon, label }) => {
              const isActive = label === active
              return (
                <button
                  key={label}
                  onClick={() => setActive(label)}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-[color:var(--color-elevation-surface-pressed)] font-medium'
                      : 'text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-elevation-surface-raised)]'
                  }`}
                >
                  <Icon size={16} weight={isActive ? 'fill' : 'regular'} />
                  {label}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 px-8 py-10">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-pretty text-2xl font-semibold">Replace me</h1>
            <p className="mt-2 max-w-xl text-pretty text-sm text-[color:var(--color-text-secondary)]">
              This is the starter shell — sidebar nav, top chrome with search and theme toggle, primary surface with a centered max-width container. Delete this content and build your prototype.
            </p>
            <div className="mt-6 flex gap-2">
              <Button>Primary action</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
