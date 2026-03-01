import { BookOpenCheck } from 'lucide-react'
import { Book } from '../App'
import { StarRating } from './StarRating'

interface ReportsViewProps {
  books: Book[]
  onBookClick: (bookId: number) => void
}

interface MonthGroup {
  month: string
  label: string
  books: Book[]
}

interface YearGroup {
  year: string
  months: MonthGroup[]
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function titleHue(title: string): number {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

function groupByYear(books: Book[]): YearGroup[] {
  const finished = books.filter((b) => b.status === 'finished')

  const yearMap = new Map<string, Map<string, Book[]>>()

  for (const book of finished) {
    const dateRead = book.dateRead
    const year = dateRead ? dateRead.slice(0, 4) : 'Unknown'
    const month = dateRead || 'Unknown'

    if (!yearMap.has(year)) yearMap.set(year, new Map())
    const monthMap = yearMap.get(year)!
    if (!monthMap.has(month)) monthMap.set(month, [])
    monthMap.get(month)!.push(book)
  }

  const years = Array.from(yearMap.entries())
    .sort((a, b) => {
      if (a[0] === 'Unknown') return 1
      if (b[0] === 'Unknown') return -1
      return b[0].localeCompare(a[0])
    })
    .map(([year, monthMap]) => {
      const months = Array.from(monthMap.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([month, books]) => {
          let label: string
          if (month === 'Unknown') {
            label = 'Unknown'
          } else {
            const m = parseInt(month.slice(5, 7), 10)
            label = MONTH_NAMES[m - 1] || month
          }
          return { month, label, books }
        })
      return { year, months }
    })

  return years
}

export function ReportsView({ books, onBookClick }: ReportsViewProps): JSX.Element {
  const finished = books.filter((b) => b.status === 'finished')

  if (finished.length === 0) {
    return (
      <div className="empty-state">
        <BookOpenCheck size={48} strokeWidth={1.2} />
        <h2>No page-turners yet</h2>
        <p>Finish a book and your reading timeline appears here</p>
      </div>
    )
  }

  const ratedBooks = finished.filter((b) => b.rating !== null)
  const avgRating = ratedBooks.length > 0
    ? (ratedBooks.reduce((sum, b) => sum + b.rating!, 0) / ratedBooks.length).toFixed(1)
    : null

  const tagCounts = finished.flatMap((b) => b.tags).reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const yearGroups = groupByYear(books)

  return (
    <div className="reports-view">
      <h2 className="reports-title">Reading Reports</h2>

      <div className="reports-summary">
        <div className="reports-stat">
          <span className="reports-stat-value">{finished.length}</span>
          <span className="reports-stat-label">Books Read</span>
        </div>
        {avgRating && (
          <div className="reports-stat">
            <span className="reports-stat-value">{avgRating}</span>
            <span className="reports-stat-label">Avg Rating</span>
          </div>
        )}
        {topTag && (
          <div className="reports-stat">
            <span className="reports-stat-value reports-stat-tag">{topTag}</span>
            <span className="reports-stat-label">Top Mood</span>
          </div>
        )}
      </div>

      {yearGroups.map((yearGroup) => (
        <div key={yearGroup.year} className="reports-year">
          <div className="reports-year-header">
            <h3 className="reports-year-title">{yearGroup.year}</h3>
            <span className="reports-year-count">
              {yearGroup.months.reduce((sum, m) => sum + m.books.length, 0)} books
            </span>
          </div>
          {yearGroup.months.map((monthGroup) => (
            <div key={monthGroup.month} className="reports-month">
              <h4 className="reports-month-title">
                {monthGroup.label}
                <span className="reports-month-count">{monthGroup.books.length}</span>
              </h4>
              <div className="reports-book-list">
                {monthGroup.books.map((book) => {
                  const hue = titleHue(book.title)
                  return (
                    <div
                      key={book.id}
                      className="reports-book-row"
                      onClick={() => onBookClick(book.id)}
                    >
                      {book.coverId ? (
                        <img
                          className="reports-book-cover"
                          src={`covers://local/${book.coverId}.jpg`}
                          alt=""
                        />
                      ) : (
                        <div
                          className="reports-book-cover reports-book-cover--fallback"
                          style={{
                            background: `linear-gradient(145deg, hsl(${hue}, 30%, 22%) 0%, hsl(${(hue + 40) % 360}, 25%, 16%) 100%)`
                          }}
                        />
                      )}
                      <div className="reports-book-info">
                        <span className="reports-book-title">{book.title}</span>
                        <span className="reports-book-author">by {book.author}</span>
                        {book.review?.trim() && (
                          <span className="reports-book-review">
                            {book.review.trim().length > 120
                              ? `${book.review.trim().slice(0, 120)}…`
                              : book.review.trim()}
                          </span>
                        )}
                      </div>
                      {book.rating !== null && (
                        <div className="reports-book-rating">
                          <StarRating rating={book.rating} size={13} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
