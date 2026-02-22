import { List, LayoutGrid } from 'lucide-react'

export type ViewMode = 'list' | 'grid'

interface ViewToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ mode, onChange }: ViewToggleProps): JSX.Element {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle-btn${mode === 'list' ? ' active' : ''}`}
        onClick={() => onChange('list')}
        title="List view"
      >
        <List size={16} />
      </button>
      <button
        className={`view-toggle-btn${mode === 'grid' ? ' active' : ''}`}
        onClick={() => onChange('grid')}
        title="Grid view"
      >
        <LayoutGrid size={16} />
      </button>
    </div>
  )
}
