import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from './components/Sidebar'
import { BookList } from './components/BookList'
import { BookDetail } from './components/BookDetail'
import { AddBookModal } from './components/AddBookModal'
import { DiscoverView } from './components/DiscoverView'
import { SettingsModal } from './components/SettingsModal'
import { ViewToggle, type ViewMode } from './components/ViewToggle'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

export type BookStatus = 'want-to-read' | 'reading' | 'finished'

export interface Book {
  id: number
  title: string
  author: string
  status: BookStatus
  rating: number | null
  review: string | null
  tags: string[]
  coverId: number | null
  dateAdded: string
  dateFinished: string | null
}

function App(): JSX.Element {
  const [books, setBooks] = useState<Book[]>([])
  const [activeFilter, setActiveFilter] = useState<BookStatus | 'all' | 'discover'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedBookIndex, setSelectedBookIndex] = useState<number | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [detailFocus, setDetailFocus] = useState<'default' | 'review'>('default')
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('bookworm-theme') as 'dark' | 'light') || 'dark'
  })
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('bookworm-view') as ViewMode) || 'list'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bookworm-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('bookworm-view', viewMode)
  }, [viewMode])

  const toggleTheme = (): void => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const loadBooks = useCallback(async () => {
    const allBooks = await window.api.getAll()
    setBooks(allBooks)
  }, [])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const filteredBooks =
    activeFilter === 'all' || activeFilter === 'discover'
      ? books
      : books.filter((b) => b.status === activeFilter)

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

  const handleUpdateBook = async (id: number, updates: Partial<Book>): Promise<void> => {
    await window.api.update(id, updates)
    await loadBooks()
  }

  const handleDeleteBook = async (id: number): Promise<void> => {
    await window.api.delete(id)
    await loadBooks()
    setSelectedBookIndex(null)
  }

  useKeyboardShortcuts({
    onAddBook: () => {
      if (!showAddModal && !showDetail && !showSettings) setShowAddModal(true)
    },
    onToggleSidebar: () => {
      if (!showAddModal && !showDetail && !showSettings) setSidebarVisible((v) => !v)
    },
    onGoToFilter: (filter) => {
      if (!showAddModal && !showDetail && !showSettings)
        setActiveFilter(filter as BookStatus | 'all' | 'discover')
    },
    onNavigate: (direction) => {
      if (showAddModal || showDetail || showSettings || filteredBooks.length === 0 || activeFilter === 'discover') return
      setSelectedBookIndex((prev) => {
        if (prev === null) return 0
        if (direction === 'down') return Math.min(prev + 1, filteredBooks.length - 1)
        return Math.max(prev - 1, 0)
      })
    },
    onOpenSelected: () => {
      if (showAddModal || showDetail || showSettings) return
      if (selectedBookIndex !== null && filteredBooks[selectedBookIndex]) {
        setDetailFocus('default')
        setShowDetail(true)
      }
    },
    onRateSelected: (rating) => {
      if (showAddModal || showSettings) return
      if (selectedBookIndex !== null && filteredBooks[selectedBookIndex]) {
        handleUpdateBook(filteredBooks[selectedBookIndex].id, { rating })
      }
    },
    onSetStatusSelected: (status) => {
      if (showAddModal || showSettings) return
      if (selectedBookIndex !== null && filteredBooks[selectedBookIndex]) {
        handleUpdateBook(filteredBooks[selectedBookIndex].id, { status: status as BookStatus })
      }
    },
    onEditReview: () => {
      if (showAddModal || showSettings) return
      if (selectedBookIndex !== null && filteredBooks[selectedBookIndex]) {
        setDetailFocus('review')
        setShowDetail(true)
      }
    },
    onToggleView: () => {
      if (!showAddModal && !showDetail && !showSettings)
        setViewMode((m) => (m === 'list' ? 'grid' : 'list'))
    },
    onEscape: () => {
      if (showSettings) {
        setShowSettings(false)
      } else if (showAddModal) {
        setShowAddModal(false)
      } else if (showDetail) {
        setShowDetail(false)
      } else if (selectedBookIndex !== null) {
        setSelectedBookIndex(null)
      }
    }
  })

  const handleOpenBook = (index: number): void => {
    setSelectedBookIndex(index)
    setDetailFocus('default')
    setShowDetail(true)
  }

  const selectedBook =
    selectedBookIndex !== null ? filteredBooks[selectedBookIndex] ?? null : null

  return (
    <div className="app">
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
        onAddBook={() => setShowAddModal(true)}
        onOpenSettings={() => setShowSettings(true)}
        visible={sidebarVisible}
      />
      <main className="main-content">
        {activeFilter === 'discover' ? (
          <DiscoverView onOpenSettings={() => setShowSettings(true)} />
        ) : (
          <>
            <div className="main-content-header">
              <ViewToggle mode={viewMode} onChange={setViewMode} />
            </div>
            <BookList
              books={filteredBooks}
              selectedBookIndex={selectedBookIndex}
              viewMode={viewMode}
              onOpenBook={handleOpenBook}
              onUpdateBook={handleUpdateBook}
              onDelete={handleDeleteBook}
            />
          </>
        )}
      </main>
      {showAddModal && (
        <AddBookModal onAdd={handleAddBook} onClose={() => setShowAddModal(false)} />
      )}
      {showDetail && selectedBook && (
        <BookDetail
          book={selectedBook}
          initialFocus={detailFocus}
          onUpdateBook={handleUpdateBook}
          onDelete={handleDeleteBook}
          onClose={() => { setShowDetail(false); setDetailFocus('default') }}
        />
      )}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} theme={theme} onToggleTheme={toggleTheme} />
      )}
    </div>
  )
}

export default App
