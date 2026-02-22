import { Library, BookOpen, Sparkles, CheckCircle, Plus, Compass, Settings, type LucideIcon } from 'lucide-react'
import { BookStatus } from '../App'
import appIcon from '../../../../resources/icon-transparent.png'

interface SidebarProps {
  activeFilter: BookStatus | 'all' | 'discover'
  onFilterChange: (filter: BookStatus | 'all' | 'discover') => void
  counts: Record<BookStatus | 'all', number>
  onAddBook: () => void
  onOpenSettings: () => void
  visible: boolean
}

const filters: { key: BookStatus | 'all'; label: string; icon: LucideIcon }[] = [
  { key: 'all', label: 'All Books', icon: Library },
  { key: 'reading', label: 'Reading', icon: BookOpen },
  { key: 'want-to-read', label: 'Want to Read', icon: Sparkles },
  { key: 'finished', label: 'Finished', icon: CheckCircle }
]

export function Sidebar({ activeFilter, onFilterChange, counts, onAddBook, onOpenSettings, visible }: SidebarProps): JSX.Element {
  return (
    <aside className={`sidebar${visible ? '' : ' collapsed'}`}>
      <div className="sidebar-header">
        <div className="drag-region" />
        <h1 className="app-title">
          <img src={appIcon} alt="" className="app-title-icon" />
          bookworm
        </h1>
      </div>

      <button className="add-book-btn" onClick={onAddBook}>
        <Plus size={18} strokeWidth={2.5} />
        Add Book
      </button>

      <nav className="sidebar-nav">
        {filters.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`nav-item ${activeFilter === key ? 'active' : ''}`}
            onClick={() => onFilterChange(key)}
          >
            <Icon size={16} className="nav-icon" />
            <span className="nav-label">{label}</span>
            <span className="nav-count">{counts[key]}</span>
          </button>
        ))}

        <div className="sidebar-divider" />

        <button
          className={`nav-item ${activeFilter === 'discover' ? 'active' : ''}`}
          onClick={() => onFilterChange('discover')}
        >
          <Compass size={16} className="nav-icon" />
          <span className="nav-label">Discover</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <button className="settings-btn" onClick={onOpenSettings} title="Settings">
          <Settings size={16} />
        </button>
        <span className="app-version">v0.2.0</span>
      </div>
    </aside>
  )
}
