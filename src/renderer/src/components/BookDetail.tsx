import { useState, useRef, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Book } from '../App'
import { StatusSelector } from './StatusSelector'
import { StarRating } from './StarRating'
import { TagPills } from './TagPills'
import { MOOD_TAGS } from '../constants'

interface BookDetailProps {
  book: Book
  initialFocus?: 'default' | 'review'
  onUpdateBook: (id: number, updates: Partial<Book>) => void
  onDelete: (id: number) => void
  onClose: () => void
}

function titleHue(title: string): number {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

export function BookDetail({
  book,
  initialFocus = 'default',
  onUpdateBook,
  onDelete,
  onClose
}: BookDetailProps): JSX.Element {
  const [review, setReview] = useState(book.review || '')
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

  return (
    <div className="modal-overlay" ref={overlayRef} tabIndex={-1} onClick={onClose}>
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
              <div className="book-detail-cover book-cover-fallback" style={{ background: fallbackBg }}>
                <span className="book-cover-letter">{book.title[0]?.toUpperCase()}</span>
              </div>
            )}

            <div className="book-detail-info">
              <h3 className="book-detail-title">{book.title}</h3>
              <p className="book-detail-author">{book.author}</p>
              <StatusSelector
                status={book.status}
                onChange={(status) => onUpdateBook(book.id, { status })}
              />
            </div>
          </div>

          <div className="book-detail-section">
            <label className="section-label">Rating</label>
            <StarRating
              rating={book.rating}
              onRate={(rating) => onUpdateBook(book.id, { rating })}
              size={22}
            />
          </div>

          <div className="book-detail-section">
            <label className="section-label">Mood</label>
            <TagPills
              tags={MOOD_TAGS}
              selectedTags={book.tags}
              interactive
              onToggle={handleTagToggle}
            />
          </div>

          <div className="book-detail-section">
            <label className="section-label">Review</label>
            <textarea
              ref={reviewRef}
              className="review-textarea"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              onBlur={handleReviewBlur}
              placeholder="What did you think of this book?"
              rows={4}
            />
          </div>

          {book.dateAdded && (
            <p className="book-detail-meta">
              Added {new Date(book.dateAdded).toLocaleDateString()}
              {book.dateFinished &&
                ` · Read ${new Date(book.dateFinished).toLocaleDateString()}`}
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
