export type SortMode = 'date-added' | 'title' | 'author' | 'date-read'

interface SortToggleProps {
  mode: SortMode
  onChange: (mode: SortMode) => void
}

export function SortToggle({ mode, onChange }: SortToggleProps): JSX.Element {
  return (
    <div className="sort-toggle">
      <button
        className={`sort-toggle-btn${mode === 'date-added' ? ' active' : ''}`}
        onClick={() => onChange('date-added')}
        title="Sort by date added"
      >
        Date Added
      </button>
      <button
        className={`sort-toggle-btn${mode === 'title' ? ' active' : ''}`}
        onClick={() => onChange(mode === 'title' ? 'date-added' : 'title')}
        title="Sort by title (s t)"
      >
        Title
      </button>
      <button
        className={`sort-toggle-btn${mode === 'author' ? ' active' : ''}`}
        onClick={() => onChange(mode === 'author' ? 'date-added' : 'author')}
        title="Sort by author (s a)"
      >
        Author
      </button>
      <button
        className={`sort-toggle-btn${mode === 'date-read' ? ' active' : ''}`}
        onClick={() => onChange(mode === 'date-read' ? 'date-added' : 'date-read')}
        title="Sort by date read (s d)"
      >
        Date Read
      </button>
    </div>
  )
}
