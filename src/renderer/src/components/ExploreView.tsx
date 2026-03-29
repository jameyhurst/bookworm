import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Book } from '../App'
import { BookList } from './BookList'
import type { ViewMode } from './ViewToggle'

interface ExploreViewProps {
  books: Book[]
  viewMode: ViewMode
  sortBy: 'date-added' | 'title' | 'author' | 'date-read'
  selectedBookIndex: number | null
  initialTag?: string | null
  onOpenBook: (index: number) => void
  onOpenBookById: (id: number) => void
  onUpdateBook: (id: number, updates: Partial<Book>) => void
  onDelete: (id: number) => void
  onAddBook: () => void
  onDiscover: () => void
}

export function ExploreView({
  books,
  viewMode,
  sortBy,
  selectedBookIndex,
  initialTag,
  onOpenBook,
  onOpenBookById,
  onUpdateBook,
  onDelete,
  onAddBook,
  onDiscover
}: ExploreViewProps): JSX.Element {
  const [activeTag, setActiveTag] = useState<string | null>(initialTag ?? null)

  // Compute tag → count map, sorted descending by count
  const tagCounts = new Map<string, number>()
  books.forEach((book) => {
    book.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    })
  })
  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])

  if (activeTag === null) {
    return (
      <div className="explore-view">
        {sortedTags.length === 0 ? (
          <p className="explore-tag-empty">No tags yet — open a book and add some.</p>
        ) : (
          <div className="explore-tag-grid">
            {sortedTags.map(([tag, count]) => (
              <button
                key={tag}
                className="explore-tag-pill"
                onClick={() => setActiveTag(tag)}
              >
                <span className="explore-tag-name">{tag}</span>
                <span className="section-header-count">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Tag selected — render filtered BookList
  const filtered = books.filter((b) => b.tags.includes(activeTag))
  return (
    <div className="explore-view">
      <div className="explore-header" onClick={() => setActiveTag(null)}>
        <ChevronLeft size={16} strokeWidth={2} />
        <span className="explore-header-label">{activeTag}</span>
      </div>
      <BookList
        books={filtered}
        activeFilter="all"
        selectedBookIndex={selectedBookIndex}
        viewMode={viewMode}
        sortBy={sortBy}
        onOpenBook={(i) => onOpenBookById(filtered[i].id)}
        onUpdateBook={onUpdateBook}
        onDelete={onDelete}
        onAddBook={onAddBook}
        onDiscover={onDiscover}
        onTagClick={(tag) => setActiveTag(tag)}
      />
    </div>
  )
}
