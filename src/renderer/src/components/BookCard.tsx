import { Trash2 } from 'lucide-react'
import { Book } from '../App'
import { StarRating } from './StarRating'
import { TagPills } from './TagPills'
import { titleHue } from '../utils'
import type { ViewMode } from './ViewToggle'

interface BookCardProps {
  book: Book
  isSelected: boolean
  viewMode: ViewMode
  index: number
  onOpen: () => void
  onUpdateBook: (id: number, updates: Partial<Book>) => void
  onDelete: (id: number) => void
}

const statusLabels = {
  'want-to-read': 'Want to Read',
  reading: 'Currently Reading',
  finished: 'Read'
}

export function BookCard({ book, isSelected, viewMode, index, onOpen, onDelete }: BookCardProps): JSX.Element {
  const staggerDelay = Math.min(index * 50, 750)
  const hue = titleHue(book.title)
  const fallbackBg = `linear-gradient(145deg, hsl(${hue}, 30%, 22%) 0%, hsl(${(hue + 40) % 360}, 25%, 16%) 100%)`

  if (viewMode === 'grid') {
    return (
      <div
        className={`book-card-grid book-card--${book.status}${isSelected ? ' book-card-selected' : ''}`}
        onClick={onOpen}
        data-book-index={index}
        style={{ cursor: 'pointer', animationDelay: `${staggerDelay}ms` }}
      >
        {book.coverId ? (
          <img
            className="book-grid-cover book-grid-cover-img"
            src={`covers://local/${book.coverId}.jpg`}
            alt=""
          />
        ) : (
          <div
            className="book-grid-cover book-grid-cover-fallback"
            style={{ background: fallbackBg }}
          >
            <span className="book-grid-cover-letter">{book.title[0]?.toUpperCase()}</span>
          </div>
        )}
        <div className="book-grid-info">
          <h3 className="book-grid-title">{book.title}</h3>
          <p className="book-grid-author">{book.author}</p>
          {book.rating !== null && (
            <div className="book-grid-rating">
              <StarRating rating={book.rating} size={12} />
            </div>
          )}
          <span className={`status-badge status-${book.status}`}>
            {statusLabels[book.status]}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`book-card book-card--${book.status}${isSelected ? ' book-card-selected' : ''}`}
      onClick={onOpen}
      data-book-index={index}
      style={{ cursor: 'pointer', animationDelay: `${staggerDelay}ms` }}
    >
      {book.coverId ? (
        <img
          className="book-cover book-cover-img"
          src={`covers://local/${book.coverId}.jpg`}
          alt=""
        />
      ) : (
        <div
          className="book-cover book-cover-fallback"
          style={{ background: fallbackBg }}
        >
          <span className="book-cover-letter">{book.title[0]?.toUpperCase()}</span>
        </div>
      )}

      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        {book.summary && <p className="book-summary-truncated">{book.summary}</p>}
      </div>

      <div className="book-card-meta">
        {book.rating !== null && (
          <StarRating rating={book.rating} size={14} />
        )}
        {book.tags.length > 0 && (
          <TagPills tags={book.tags} selectedTags={book.tags} interactive={false} />
        )}
        <span className={`status-badge status-${book.status}`}>
          {statusLabels[book.status]}
        </span>
        <div className="book-actions">
          <button className="action-btn delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(book.id) }}>
            <Trash2 size={13} />
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
