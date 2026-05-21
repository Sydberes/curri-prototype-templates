import { Placeholder } from './Placeholder'

export function Info(props: { onNext: () => void; onBack: () => void }) {
  return <Placeholder title="Info" {...props} />
}
