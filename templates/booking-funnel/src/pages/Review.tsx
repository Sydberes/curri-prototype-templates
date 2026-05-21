import { Placeholder } from './Placeholder'

export function Review(props: { onNext: () => void; onBack: () => void }) {
  return <Placeholder title="Review" {...props} />
}
