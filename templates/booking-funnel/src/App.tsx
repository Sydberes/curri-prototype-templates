import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Breadcrumbs, type Step } from './components/Breadcrumbs'
import { MapCanvas } from './components/MapCanvas'
import { DragOverlay } from './components/DragOverlay'
import { FilledSnackbar } from './components/FilledSnackbar'
import { Stops } from './pages/Stops'
import { Vehicles } from './pages/Vehicles'
import { Timing } from './pages/Timing'
import { Orders } from './pages/Orders'
import { Info } from './pages/Info'
import { Review } from './pages/Review'

const STEPS: Step[] = ['Stops', 'Vehicles', 'Timing', 'Orders', 'Info', 'Review']

const PAGES: Record<Step, React.ComponentType<{ onNext: () => void; onBack: () => void }>> = {
  Stops,
  Vehicles,
  Timing,
  Orders,
  Info,
  Review,
}

export default function App() {
  const [step, setStep] = useState<Step>('Stops')
  const [isDragging, setIsDragging] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const Page = PAGES[step]

  // Listen for "filled by CI" moment from any page
  useEffect(() => {
    const handler = () => setSnackbarOpen(true)
    const reset = () => setSnackbarOpen(false)
    window.addEventListener('ci:auto-filled', handler)
    window.addEventListener('ci:reset', reset)
    return () => {
      window.removeEventListener('ci:auto-filled', handler)
      window.removeEventListener('ci:reset', reset)
    }
  }, [])

  const i = STEPS.indexOf(step)
  const goNext = () => setStep(STEPS[Math.min(i + 1, STEPS.length - 1)])
  const goBack = () => setStep(STEPS[Math.max(i - 1, 0)])

  // Window-level drag listeners — entire window catches drags, overlay sits
  // inside the primary surface so the visual treatment is local to that card.
  useEffect(() => {
    let counter = 0

    const onEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types?.includes('Files')) return
      counter += 1
      setIsDragging(true)
    }
    const onLeave = (e: DragEvent) => {
      if (!e.dataTransfer?.types?.includes('Files')) return
      counter -= 1
      if (counter <= 0) {
        counter = 0
        setIsDragging(false)
      }
    }
    const onOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) e.preventDefault()
    }
    const onDrop = (e: DragEvent) => {
      if (!e.dataTransfer?.types?.includes('Files')) return
      e.preventDefault()
      counter = 0
      setIsDragging(false)
      const fileName =
        e.dataTransfer?.files?.[0]?.name ?? 'ship-ticket 111.pdf'
      window.dispatchEvent(
        new CustomEvent('ci:document-dropped', { detail: { fileName } }),
      )
    }

    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('dragover', onOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [])

  return (
    <div
      className="h-screen w-screen flex"
      style={{ background: 'var(--color-elevation-surface-base)' }}
    >
      <Sidebar />

      <main className="flex-1 min-w-0 py-1.5 pr-1.5">
        <div
          className="relative h-full flex flex-col overflow-hidden rounded-lg border"
          style={{
            background: 'var(--color-elevation-surface-primary)',
            borderColor: 'var(--color-border-primary)',
          }}
        >
          <div
            className="h-10 px-6 flex items-center border-b shrink-0"
            style={{ borderColor: 'var(--color-border-primary)' }}
          >
            <Breadcrumbs steps={STEPS} current={step} onSelect={setStep} />
          </div>

          <div className="flex-1 min-h-0 flex">
            <div
              className="shrink-0 h-full overflow-hidden"
              style={{ width: 540 }}
            >
              <Page onNext={goNext} onBack={goBack} />
            </div>

            <div className="flex-1 min-w-0 p-2 pl-0">
              <div
                className="w-full h-full rounded-lg overflow-hidden border"
                style={{ borderColor: 'var(--color-border-primary)' }}
              >
                <MapCanvas />
              </div>
            </div>
          </div>

          <DragOverlay visible={isDragging} />
          <FilledSnackbar
            open={snackbarOpen}
            onClose={() => setSnackbarOpen(false)}
          />
        </div>
      </main>
    </div>
  )
}
