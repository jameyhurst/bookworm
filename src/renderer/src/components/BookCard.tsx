import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Book } from '../App'

interface BookCardProps {
  book: Book
  isSelected: boolean
  onUpdateProgress: (id: number, currentPage: number) => void
  onDelete: (id: number) => void
}

const statusLabels = {
  'want-to-read': 'Want to Read',
  reading: 'Reading',
  finished: 'Finished'
}

export function BookCard({ book, isSelected, onUpdateProgress, onDelete }: BookCardProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const [pageInput, setPageInput] = useState(String(book.currentPage))

  const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0

  const handleProgressSubmit = (): void => {
    const page = Math.min(Math.max(0, parseInt(pageInput) || 0), book.totalPages)
    onUpdateProgress(book.id, page)
    setIsEditing(false)
  }

  return (
    <div className={`book-card${isSelected ? ' book-card-selected' : ''}`}>
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

        {book.totalPages > 0 && (
          <div className="book-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-text">
              {isEditing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleProgressSubmit()
                  }}
                  className="progress-edit"
                >
                  <input
                    type="number"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    min={0}
                    max={book.totalPages}
                    autoFocus
                    onBlur={handleProgressSubmit}
                  />
                  <span>/ {book.totalPages} pages</span>
                </form>
              ) : (
                <button className="progress-btn" onClick={() => setIsEditing(true)}>
                  {book.currentPage} / {book.totalPages} pages ({Math.round(progress)}%)
                </button>
              )}
            </div>
          </div>
        )}

        <div className="book-actions">
          <button className="action-btn delete-btn" onClick={() => onDelete(book.id)}>
            <Trash2 size={13} />
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
