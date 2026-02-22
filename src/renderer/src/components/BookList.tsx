import { useEffect, useRef } from 'react'
import { BookOpenCheck } from 'lucide-react'
import { Book } from '../App'
import { BookCard } from './BookCard'
import type { ViewMode } from './ViewToggle'

interface BookListProps {
  books: Book[]
  selectedBookIndex: number | null
  viewMode: ViewMode
  onOpenBook: (index: number) => void
  onUpdateBook: (id: number, updates: Partial<Book>) => void
  onDelete: (id: number) => void
}

export function BookList({ books, selectedBookIndex, viewMode, onOpenBook, onUpdateBook, onDelete }: BookListProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedBookIndex === null || !containerRef.current) return
    const card = containerRef.current.children[selectedBookIndex] as HTMLElement | undefined
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

  return (
    <div ref={containerRef} className={viewMode === 'grid' ? 'book-grid' : 'book-list'}>
      {books.map((book, i) => (
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
      ))}
    </div>
  )
}
