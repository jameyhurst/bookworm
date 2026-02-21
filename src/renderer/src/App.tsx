import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from './components/Sidebar'
import { BookList } from './components/BookList'
import { BookDetail } from './components/BookDetail'
import { AddBookModal } from './components/AddBookModal'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

export type BookStatus = 'want-to-read' | 'reading' | 'finished'

export interface Book {
  id: number
  title: string
  author: string
  totalPages: number
  currentPage: number
  status: BookStatus
  rating: number | null
  coverId: number | null
  dateAdded: string
  dateFinished: string | null
}

function App(): JSX.Element {
  const [books, setBooks] = useState<Book[]>([])
  const [activeFilter, setActiveFilter] = useState<BookStatus | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedBookIndex, setSelectedBookIndex] = useState<number | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('bookworm-theme') as 'dark' | 'light') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bookworm-theme', theme)
  }, [theme])

  const toggleTheme = (): void => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const loadBooks = useCallback(async () => {
    const allBooks = await window.api.getAll()
    setBooks(allBooks)
  }, [])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const filteredBooks =
    activeFilter === 'all' ? books : books.filter((b) => b.status === activeFilter)

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedBookIndex(null)
    setShowDetail(false)
  }, [activeFilter])

  const counts = {
    all: books.length,
    reading: books.filter((b) => b.status === 'reading').length,
    'want-to-read': books.filter((b) => b.status === 'want-to-read').length,
    finished: books.filter((b) => b.status === 'finished').length
  }

  const handleAddBook = async (book: Omit<Book, 'id' | 'dateAdded' | 'dateFinished'>): Promise<void> => {
    await window.api.add(book)
    await loadBooks()
    setShowAddModal(false)
  }

  const handleUpdateProgress = async (id: number, currentPage: number): Promise<void> => {
    await window.api.updateProgress(id, currentPage)
    await loadBooks()
  }

  const handleDeleteBook = async (id: number): Promise<void> => {
    await window.api.delete(id)
    await loadBooks()
    setSelectedBookIndex(null)
  }

  useKeyboardShortcuts({
    onAddBook: () => {
      if (!showAddModal && !showDetail) setShowAddModal(true)
    },
    onToggleSidebar: () => {
      if (!showAddModal && !showDetail) setSidebarVisible((v) => !v)
    },
    onGoToFilter: (filter) => {
      if (!showAddModal && !showDetail) setActiveFilter(filter as BookStatus | 'all')
    },
    onNavigate: (direction) => {
      if (showAddModal || showDetail || filteredBooks.length === 0) return
      setSelectedBookIndex((prev) => {
        if (prev === null) return 0
        if (direction === 'down') return Math.min(prev + 1, filteredBooks.length - 1)
        return Math.max(prev - 1, 0)
      })
    },
    onOpenSelected: () => {
      if (showAddModal || showDetail) return
      if (selectedBookIndex !== null && filteredBooks[selectedBookIndex]) {
        setShowDetail(true)
      }
    },
    onEscape: () => {
      if (showAddModal) {
        setShowAddModal(false)
      } else if (showDetail) {
        setShowDetail(false)
      } else if (selectedBookIndex !== null) {
        setSelectedBookIndex(null)
      }
    }
  })

  const selectedBook =
    selectedBookIndex !== null ? filteredBooks[selectedBookIndex] ?? null : null

  return (
    <div className="app">
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
        onAddBook={() => setShowAddModal(true)}
        visible={sidebarVisible}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="main-content">
        <BookList
          books={filteredBooks}
          selectedBookIndex={selectedBookIndex}
          onUpdateProgress={handleUpdateProgress}
          onDelete={handleDeleteBook}
        />
      </main>
      {showAddModal && (
        <AddBookModal onAdd={handleAddBook} onClose={() => setShowAddModal(false)} />
      )}
      {showDetail && selectedBook && (
        <BookDetail
          book={selectedBook}
          onUpdateProgress={handleUpdateProgress}
          onDelete={handleDeleteBook}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  )
}

export default App
