import { useEffect, useRef } from 'react'
import { BookOpenCheck, Plus, Compass } from 'lucide-react'
import { Book, BookStatus } from '../App'
import { BookCard } from './BookCard'
import { stripArticle } from '../utils'
import type { ViewMode } from './ViewToggle'

interface BookListProps {
  books: Book[]
  activeFilter: BookStatus | 'all' | 'discover' | 'reports'
  selectedBookIndex: number | null
  viewMode: ViewMode
  sortBy: 'date-added' | 'title' | 'author' | 'date-read'
  onOpenBook: (index: number) => void
  onUpdateBook: (id: number, updates: Partial<Book>) => void
  onDelete: (id: number) => void
  onAddBook: () => void
  onDiscover: () => void
}

const EMPTY_STATES: Record<string, { heading: string; subtitle: string }> = {
  all: { heading: 'Nothing on the nightstand', subtitle: 'Your shelf won\u2019t fill itself \u2014 add a book!' },
  'want-to-read': { heading: 'No wishlist yet', subtitle: 'Find something that catches your eye' },
  reading: { heading: 'Between books?', subtitle: 'Pick up something new \u2014 or revisit an old favorite' },
  finished: { heading: 'No page-turners yet', subtitle: 'Finish a book and it\u2019ll show up here' }
}

function getSectionKey(book: Book, sortBy: string): string | null {
  if (sortBy === 'title') {
    const first = stripArticle(book.title).charAt(0).toUpperCase()
    return /[A-Z]/.test(first) ? first : '#'
  }
  if (sortBy === 'author') {
    const words = book.author.trim().split(/\s+/)
    const last = words[words.length - 1]
    const first = last.charAt(0).toUpperCase()
    return /[A-Z]/.test(first) ? first : '#'
  }
  if (sortBy === 'date-read') {
    const d = book.dateRead || book.dateAdded
    return d ? new Date(d).getFullYear().toString() : 'Unknown'
  }
  return null
}

export function BookList({ books, activeFilter, selectedBookIndex, viewMode, sortBy, onOpenBook, onUpdateBook, onDelete, onAddBook, onDiscover }: BookListProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedBookIndex === null || !containerRef.current) return
    const card = containerRef.current.querySelector(`[data-book-index="${selectedBookIndex}"]`) as HTMLElement | undefined
    card?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedBookIndex])

  if (books.length === 0) {
    const { heading, subtitle } = EMPTY_STATES[activeFilter] || EMPTY_STATES.all
    return (
      <div className="empty-state">
        <BookOpenCheck size={48} strokeWidth={1.2} />
        <h2>{heading}</h2>
        <p>{subtitle}</p>
        <div className="empty-state-actions">
          <button className="btn-primary" onClick={onAddBook}>
            <Plus size={16} />
            Add Book
          </button>
          <button className="btn-primary" onClick={onDiscover}>
            <Compass size={16} />
            Discover
          </button>
        </div>
      </div>
    )
  }

  const elements: JSX.Element[] = []
  let lastSection: string | null = null

  books.forEach((book, i) => {
    const section = getSectionKey(book, sortBy)
    if (section !== null && section !== lastSection) {
      elements.push(
        <div key={`section-${section}`} className="book-list-section-header">
          {section}
        </div>
      )
      lastSection = section
    }
    elements.push(
      <BookCard
        key={book.id}
        book={book}
        isSelected={selectedBookIndex === i}
        viewMode={viewMode}
        index={i}
        onOpen={() => onOpenBook(i)}
        onUpdateBook={onUpdateBook}
        onDelete={onDelete}
      />
    )
  })

  return (
    <div ref={containerRef} className={viewMode === 'grid' ? 'book-grid' : 'book-list'}>
      {elements}
    </div>
  )
}
