import { useEffect, useRef } from 'react'
import { BookOpenCheck } from 'lucide-react'
import { Book } from '../App'
import { BookCard } from './BookCard'
import type { ViewMode } from './ViewToggle'

interface BookListProps {
  books: Book[]
  selectedBookIndex: number | null
  viewMode: ViewMode
  sortBy: 'default' | 'title' | 'author' | 'date'
  onOpenBook: (index: number) => void
  onUpdateBook: (id: number, updates: Partial<Book>) => void
  onDelete: (id: number) => void
}

function getSectionKey(book: Book, sortBy: string): string | null {
  if (sortBy === 'title') {
    const first = book.title.charAt(0).toUpperCase()
    return /[A-Z]/.test(first) ? first : '#'
  }
  if (sortBy === 'author') {
    const words = book.author.trim().split(/\s+/)
    const last = words[words.length - 1]
    const first = last.charAt(0).toUpperCase()
    return /[A-Z]/.test(first) ? first : '#'
  }
  if (sortBy === 'date') {
    const d = book.dateFinished || book.dateAdded
    return d ? new Date(d).getFullYear().toString() : 'Unknown'
  }
  return null
}

export function BookList({ books, selectedBookIndex, viewMode, sortBy, onOpenBook, onUpdateBook, onDelete }: BookListProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedBookIndex === null || !containerRef.current) return
    const card = containerRef.current.querySelector(`[data-book-index="${selectedBookIndex}"]`) as HTMLElement | undefined
    card?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedBookIndex])

  if (books.length === 0) {
    return (
      <div className="empty-state">
        <BookOpenCheck size={48} strokeWidth={1.2} />
        <h2>No books yet</h2>
        <p>Add your first book to start tracking your reading</p>
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
