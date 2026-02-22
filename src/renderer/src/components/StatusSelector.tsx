import { Sparkles, BookOpen, CheckCircle } from 'lucide-react'
import { BookStatus } from '../App'

interface StatusSelectorProps {
  status: BookStatus
  onChange: (status: BookStatus) => void
}

const statuses: { key: BookStatus; label: string; icon: typeof Sparkles }[] = [
  { key: 'want-to-read', label: 'Want to Read', icon: Sparkles },
  { key: 'reading', label: 'Currently Reading', icon: BookOpen },
  { key: 'finished', label: 'Read', icon: CheckCircle }
]

export function StatusSelector({ status, onChange }: StatusSelectorProps): JSX.Element {
  return (
    <div className="status-selector">
      {statuses.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          className={`status-segment${status === key ? ' active' : ''}`}
          onClick={() => onChange(key)}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  )
}
