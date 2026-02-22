import { Trash2 } from 'lucide-react'
import { Book } from '../App'
import { StarRating } from './StarRating'
import { TagPills } from './TagPills'
import type { ViewMode } from './ViewToggle'

interface BookCardProps {
  book: Book
  isSelected: boolean
  viewMode: ViewMode
  onOpen: () => void
  onUpdateBook: (id: number, updates: Partial<Book>) => void
  onDelete: (id: number) => void
}

const statusLabels = {
  'want-to-read': 'Want to Read',
  reading: 'Reading',
  finished: 'Finished'
}

export function BookCard({ book, isSelected, viewMode, onOpen, onDelete }: BookCardProps): JSX.Element {
  if (viewMode === 'grid') {
    return (
      <div
        className={`book-card-grid${isSelected ? ' book-card-selected' : ''}`}
        onClick={onOpen}
        style={{ cursor: 'pointer' }}
      >
        {book.coverId ? (
          <img
            className="book-grid-cover book-grid-cover-img"
            src={`covers://local/${book.coverId}.jpg`}
            alt=""
          />
        ) : (
          <div className="book-grid-cover book-grid-cover-fallback">
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
    <div className={`book-card${isSelected ? ' book-card-selected' : ''}`} onClick={onOpen} style={{ cursor: 'pointer' }}>
      {book.coverId ? (
        <img
          className="book-cover book-cover-img"
          src={`covers://local/${book.coverId}.jpg`}
          alt=""
        />
      ) : (
        <div className="book-cover book-cover-fallback">
          <span className="book-cover-letter">{book.title[0]?.toUpperCase()}</span>
        </div>
      )}

      <div className="book-info">
        <div className="book-header">
          <div>
            <h3 className="book-title">{book.title}</h3>
            <p className="book-author">{book.author}</p>
          </div>
          <span className={`status-badge status-${book.status}`}>
            {statusLabels[book.status]}
          </span>
        </div>

        {book.rating !== null && (
          <div className="book-card-rating">
            <StarRating rating={book.rating} size={14} />
          </div>
        )}

        {book.tags.length > 0 && (
          <TagPills tags={book.tags} selectedTags={book.tags} interactive={false} />
        )}

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
