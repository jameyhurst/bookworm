import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Book } from '../App'

interface BookDetailProps {
  book: Book
  onUpdateProgress: (id: number, currentPage: number) => void
  onDelete: (id: number) => void
  onClose: () => void
}

const statusLabels = {
  'want-to-read': 'Want to Read',
  reading: 'Reading',
  finished: 'Finished'
}

export function BookDetail({
  book,
  onUpdateProgress,
  onDelete,
  onClose
}: BookDetailProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const [pageInput, setPageInput] = useState(String(book.currentPage))

  const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0

  const handleProgressSubmit = (): void => {
    const page = Math.min(Math.max(0, parseInt(pageInput) || 0), book.totalPages)
    onUpdateProgress(book.id, page)
    setIsEditing(false)
  }

  const handleDelete = (): void => {
    onDelete(book.id)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal book-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book Details</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="book-detail-content">
          <div className="book-detail-top">
            {book.coverId ? (
              <img
                className="book-detail-cover"
                src={`covers://local/${book.coverId}.jpg`}
                alt=""
              />
            ) : (
              <div className="book-detail-cover book-cover-fallback">
                <span className="book-cover-letter">{book.title[0]?.toUpperCase()}</span>
              </div>
            )}

            <div className="book-detail-info">
              <h3 className="book-detail-title">{book.title}</h3>
              <p className="book-detail-author">{book.author}</p>
              <span className={`status-badge status-${book.status}`}>
                {statusLabels[book.status]}
              </span>
            </div>
          </div>

          {book.totalPages > 0 && (
            <div className="book-detail-progress">
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

          {book.dateAdded && (
            <p className="book-detail-meta">
              Added {new Date(book.dateAdded).toLocaleDateString()}
              {book.dateFinished &&
                ` · Finished ${new Date(book.dateFinished).toLocaleDateString()}`}
            </p>
          )}

          <div className="book-detail-actions">
            <button className="btn-secondary delete-detail-btn" onClick={handleDelete}>
              <Trash2 size={14} />
              Remove Book
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
