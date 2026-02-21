import { BookOpenCheck } from 'lucide-react'
import { Book } from '../App'
import { BookCard } from './BookCard'

interface BookListProps {
  books: Book[]
  selectedBookIndex: number | null
  onUpdateProgress: (id: number, currentPage: number) => void
  onDelete: (id: number) => void
}

export function BookList({ books, selectedBookIndex, onUpdateProgress, onDelete }: BookListProps): JSX.Element {
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
    <div className="book-list">
      {books.map((book, i) => (
        <BookCard
          key={book.id}
          book={book}
          isSelected={selectedBookIndex === i}
          onUpdateProgress={onUpdateProgress}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
