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
  onOpenBook: (index: number) => void
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
  onOpenBook,
  onUpdateBook,
  onDelete,
  onAddBook,
  onDiscover
}: ExploreViewProps): JSX.Element {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  return <div className="explore-view">TODO</div>
}
