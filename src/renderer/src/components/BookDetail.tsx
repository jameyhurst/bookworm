import { useState, useRef, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Book } from '../App'
import { StatusSelector } from './StatusSelector'
import { StarRating } from './StarRating'
import { TagPills } from './TagPills'
import { MOOD_TAGS } from '../constants'
import { titleHue } from '../utils'

interface BookDetailProps {
  book: Book
  initialFocus?: 'default' | 'review'
  onUpdateBook: (id: number, updates: Partial<Book>) => void
  onDelete: (id: number) => void
  onClose: () => void
}

export function BookDetail({
  book,
  initialFocus = 'default',
  onUpdateBook,
  onDelete,
  onClose
}: BookDetailProps): JSX.Element {
  const [review, setReview] = useState(book.review || '')
  const [localDateRead, setLocalDateRead] = useState(book.dateRead)
  const reviewRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const hue = titleHue(book.title)
  const fallbackBg = `linear-gradient(145deg, hsl(${hue}, 30%, 22%) 0%, hsl(${(hue + 40) % 360}, 25%, 16%) 100%)`

  useEffect(() => {
    if (initialFocus === 'review' && reviewRef.current) {
      reviewRef.current.focus()
    } else {
      overlayRef.current?.focus()
    }
  }, [initialFocus])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Enter' && e.metaKey) {
        e.preventDefault()
        const trimmed = review.trim()
        const newReview = trimmed || null
        if (newReview !== book.review) {
          onUpdateBook(book.id, { review: newReview })
        }
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  })

  const handleDelete = (): void => {
    onDelete(book.id)
    onClose()
  }

  const handleReviewBlur = (): void => {
    const trimmed = review.trim()
    const newReview = trimmed || null
    if (newReview !== book.review) {
      onUpdateBook(book.id, { review: newReview })
    }
  }

  const handleTagToggle = (tag: string): void => {
    const newTags = book.tags.includes(tag)
      ? book.tags.filter((t) => t !== tag)
      : [...book.tags, tag]
    onUpdateBook(book.id, { tags: newTags })
  }

  const dateLabel = book.dateRead
    ? new Date(book.dateRead + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="modal-overlay" ref={overlayRef} tabIndex={-1} onClick={onClose}>
      <div className="modal book-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="book-detail-content">
          <div className="book-detail-sidebar">
            <div className="detail-cover-wrap">
              {book.coverId ? (
                <img
                  className="book-detail-cover"
                  src={`covers://local/${book.coverId}.jpg`}
                  alt=""
                />
              ) : (
                <div className="book-detail-cover book-cover-fallback" style={{ background: fallbackBg }}>
                  <span className="book-cover-letter">{book.title[0]?.toUpperCase()}</span>
                </div>
              )}
            </div>

            <div className="detail-sidebar-group">
              <StarRating
                rating={book.rating}
                onRate={(rating) => onUpdateBook(book.id, { rating })}
                size={24}
              />
            </div>

            <div className="detail-sidebar-group">
              <label className="detail-label">Date Read</label>
              {book.dateRead !== null ? (
                <input
                  type="month"
                  className="month-input"
                  value={localDateRead ?? ''}
                  onChange={(e) => setLocalDateRead(e.target.value || null)}
                  onBlur={() => {
                    if (localDateRead !== book.dateRead) {
                      onUpdateBook(book.id, { dateRead: localDateRead })
                    }
                  }}
                />
              ) : (
                <span className="detail-date-none">No date set</span>
              )}
              <label className="skip-date-toggle">
                <input
                  type="checkbox"
                  checked={book.dateRead === null}
                  onChange={(e) => {
                    const val = e.target.checked ? null : new Date().toISOString().slice(0, 7)
                    setLocalDateRead(val)
                    onUpdateBook(book.id, { dateRead: val })
                  }}
                />
                No date
              </label>
            </div>

            {book.dateAdded && (
              <p className="book-detail-meta">
                Added {new Date(book.dateAdded).toLocaleDateString()}
              </p>
            )}

            <div className="detail-sidebar-footer">
              <button className="detail-delete-btn" onClick={handleDelete}>
                <Trash2 size={13} />
                Remove from library
              </button>
            </div>
          </div>

          <div className="book-detail-main">
            <div className="detail-header">
              <div className="detail-header-text">
                <h3 className="book-detail-title">{book.title}</h3>
                <p className="book-detail-author">{book.author}</p>
                {dateLabel && <p className="detail-read-date">Read {dateLabel}</p>}
              </div>
              <StatusSelector
                status={book.status}
                onChange={(status) => onUpdateBook(book.id, { status })}
              />
            </div>

            {book.summary && (
              <div className="detail-section">
                <div
                  className="detail-summary"
                  dangerouslySetInnerHTML={{ __html: book.summary }}
                  onClick={(e) => {
                    const anchor = (e.target as HTMLElement).closest('a')
                    if (anchor) {
                      e.preventDefault()
                      const href = anchor.getAttribute('href')
                      if (href) window.api.openExternal(href)
                    }
                  }}
                />
              </div>
            )}

            <div className="detail-section">
              <label className="detail-label">Mood</label>
              <TagPills
                tags={MOOD_TAGS}
                selectedTags={book.tags}
                interactive
                onToggle={handleTagToggle}
              />
            </div>

            <div className="detail-section detail-section-review">
              <label className="detail-label">Review</label>
              <textarea
                ref={reviewRef}
                className="review-textarea"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                onBlur={handleReviewBlur}
                placeholder="What did you think?"
                rows={3}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
