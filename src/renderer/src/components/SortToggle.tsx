export type SortMode = 'default' | 'title' | 'author'

interface SortToggleProps {
  mode: SortMode
  onChange: (mode: SortMode) => void
}

export function SortToggle({ mode, onChange }: SortToggleProps): JSX.Element {
  return (
    <div className="sort-toggle">
      <button
        className={`sort-toggle-btn${mode === 'title' ? ' active' : ''}`}
        onClick={() => onChange(mode === 'title' ? 'default' : 'title')}
        title="Sort by title (s t)"
      >
        Title
      </button>
      <button
        className={`sort-toggle-btn${mode === 'author' ? ' active' : ''}`}
        onClick={() => onChange(mode === 'author' ? 'default' : 'author')}
        title="Sort by author (s a)"
      >
        Author
      </button>
    </div>
  )
}
