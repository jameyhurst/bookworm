import { useState, useEffect, useCallback, useRef } from 'react'
import { Sidebar } from './components/Sidebar'
import { BookList } from './components/BookList'
import { BookDetail } from './components/BookDetail'
import { AddBookModal, type AddBookMeta } from './components/AddBookModal'
import { DiscoverView } from './components/DiscoverView'
import { ReportsView } from './components/ReportsView'
import { SettingsModal } from './components/SettingsModal'
import { HelpModal } from './components/HelpModal'
import { ViewToggle, type ViewMode } from './components/ViewToggle'
import { SortToggle } from './components/SortToggle'
import { Toast, type ToastItem } from './components/Toast'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { PanelLeftOpen, Search, X } from 'lucide-react'

export type BookStatus = 'want-to-read' | 'reading' | 'finished'

export interface Book {
  id: number
  bookId: string
  title: string
  author: string
  status: BookStatus
  rating: number | null
  review: string | null
  tags: string[]
  coverId: number | null
  summary: string | null
  dateAdded: string
  dateFinished: string | null
  dateRead: string | null
}

function App(): JSX.Element {
  const [books, setBooks] = useState<Book[]>([])
  const [activeFilter, setActiveFilter] = useState<BookStatus | 'all' | 'discover' | 'reports'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalKey, setAddModalKey] = useState(0)
  const returnToAddRef = useRef(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [selectedBookIndex, setSelectedBookIndex] = useState<number | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [detailFocus, setDetailFocus] = useState<'default' | 'review'>('default')
  const [detailBookId, setDetailBookId] = useState<number | null>(null)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [sortBy, setSortBy] = useState<'date-added' | 'title' | 'author' | 'date-read'>('date-added')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('bookworm-theme') as 'dark' | 'light') || 'dark'
  })
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('bookworm-view') as ViewMode) || 'list'
  })
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextToastId = useRef(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [cachedRecs, setCachedRecs] = useState<any[] | null>(null)
  const [discoverRefreshHint, setDiscoverRefreshHint] = useState(0)
  const prefetchedRef = useRef(false)
  const skipFilterResetRef = useRef(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bookworm-theme', theme)
    window.api.syncTheme(theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('bookworm-view', viewMode)
  }, [viewMode])

  const toggleTheme = (): void => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  useEffect(() => {
    const handleCmdF = (e: KeyboardEvent): void => {
      if (e.key === 'f' && e.metaKey) {
        e.preventDefault()
        setShowSearch(true)
        setTimeout(() => searchInputRef.current?.focus(), 0)
      }
    }
    document.addEventListener('keydown', handleCmdF)
    return () => document.removeEventListener('keydown', handleCmdF)
  }, [])

  const addToast = useCallback((message: string, type: ToastItem['type']) => {
    const id = nextToastId.current++
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const loadBooks = useCallback(async () => {
    const allBooks = await window.api.getAll()
    setBooks(allBooks)
  }, [])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  // Prefetch discover recommendations in the background
  useEffect(() => {
    if (prefetchedRef.current || books.length === 0) return
    const hasFinished = books.some((b) => b.status === 'finished')
    if (!hasFinished) return
    prefetchedRef.current = true
    window.api.getSettings().then((settings) => {
      if (!settings.claudeApiKey) return
      window.api.getRecommendations().then((recs) => {
        setCachedRecs(recs)
      }).catch(() => {})
    })
  }, [books])

  const filtered =
    activeFilter === 'all' || activeFilter === 'discover' || activeFilter === 'reports'
      ? books
      : books.filter((b) => b.status === activeFilter)

  const stripArticle = (t: string): string =>
    t.replace(/^(the|a|an|le|la|les|un|une|el|las|los|una|il|lo|gli|i|uno|o|os|as|um|uma)\s+/i, '')
     .replace(/^l'/i, '')

  const filteredBooks =
    sortBy === 'title'
      ? [...filtered].sort((a, b) => stripArticle(a.title).localeCompare(stripArticle(b.title)))
      : sortBy === 'author'
        ? [...filtered].sort((a, b) => a.author.localeCompare(b.author))
        : sortBy === 'date-read'
          ? [...filtered].sort((a, b) => {
              const da = a.dateRead || a.dateAdded
              const db = b.dateRead || b.dateAdded
              return new Date(db).getTime() - new Date(da).getTime()
            })
          : [...filtered].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())

  const searchedBooks = searchQuery.trim()
    ? filteredBooks.filter((b) => {
        const q = searchQuery.trim().toLowerCase()
        return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      })
    : filteredBooks

  // Reset selection when filter changes (skip when following a book to its new shelf)
  useEffect(() => {
    if (skipFilterResetRef.current) {
      skipFilterResetRef.current = false
      return
    }
    setSelectedBookIndex(null)
    setShowDetail(false)
    setDetailBookId(null)
    setShowSearch(false)
    setSearchQuery('')
  }, [activeFilter])

  const counts = {
    all: books.length,
    reading: books.filter((b) => b.status === 'reading').length,
    'want-to-read': books.filter((b) => b.status === 'want-to-read').length,
    finished: books.filter((b) => b.status === 'finished').length
  }

  const handleAddBook = async (
    book: Omit<Book, 'id' | 'bookId' | 'dateAdded' | 'dateFinished'>,
    meta?: AddBookMeta
  ): Promise<string | null> => {
    const result = await window.api.add(book)
    if (result && 'error' in result) return result.error
    await loadBooks()
    addToast(`\u201c${book.title}\u201d added`, 'added')
    setShowAddModal(false)
    returnToAddRef.current = true
    setDetailBookId(result.id)
    setDetailFocus('default')
    setShowDetail(true)

    // Background enrichment: download cover + fetch summary, then update
    if (meta?.openLibraryCoverId || meta?.olKey) {
      Promise.all([
        meta.openLibraryCoverId ? window.api.downloadCover(meta.openLibraryCoverId) : null,
        meta.olKey ? window.api.fetchSummary(meta.olKey) : null
      ]).then(async ([coverId, summary]) => {
        const updates: Partial<Book> = {}
        if (coverId) updates.coverId = coverId
        if (summary) updates.summary = summary
        if (Object.keys(updates).length > 0) {
          await handleUpdateBook(result.id, updates)
        }
      })
    }

    return null
  }

  const handleAddFromDiscover = async (
    book: Omit<Book, 'id' | 'bookId' | 'dateAdded' | 'dateFinished'>,
    meta?: AddBookMeta
  ): Promise<string | null> => {
    const result = await window.api.add(book)
    if (result && 'error' in result) return result.error
    await loadBooks()
    addToast(`\u201c${book.title}\u201d added`, 'added')
    setDetailBookId(result.id)
    setShowDetail(true)

    if (meta?.openLibraryCoverId || meta?.olKey) {
      Promise.all([
        meta.openLibraryCoverId ? window.api.downloadCover(meta.openLibraryCoverId) : null,
        meta.olKey ? window.api.fetchSummary(meta.olKey) : null
      ]).then(async ([coverId, summary]) => {
        const updates: Partial<Book> = {}
        if (coverId) updates.coverId = coverId
        if (summary) updates.summary = summary
        if (Object.keys(updates).length > 0) {
          await handleUpdateBook(result.id, updates)
        }
      })
    }

    return null
  }

  const handleUpdateBook = async (id: number, updates: Partial<Book>): Promise<void> => {
    await window.api.update(id, updates)

    // Follow the book to its new shelf when status changes in the detail modal
    const isShelfFilter =
      activeFilter === 'want-to-read' || activeFilter === 'reading' || activeFilter === 'finished'
    if (updates.status && isShelfFilter && updates.status !== activeFilter && showDetail) {
      skipFilterResetRef.current = true
      setDetailBookId(id)
      setActiveFilter(updates.status)
    }

    await loadBooks()
  }

  const handleDeleteBook = async (id: number): Promise<void> => {
    const title = books.find((b) => b.id === id)?.title
    await window.api.delete(id)
    await loadBooks()
    setSelectedBookIndex(null)
    if (detailBookId === id) setDetailBookId(null)
    if (title) addToast(`\u201c${title}\u201d removed`, 'deleted')
  }

  const anyModal = showAddModal || showDetail || showSettings || showHelp

  useKeyboardShortcuts({
    onAddBook: () => {
      console.log(`[keys] onAddBook called — anyModal=${anyModal} (add=${showAddModal} detail=${showDetail} settings=${showSettings} help=${showHelp})`)
      if (!anyModal) setShowAddModal(true)
    },
    onToggleSidebar: () => {
      if (!anyModal) setSidebarVisible((v) => !v)
    },
    onGoToFilter: (filter) => {
      if (!anyModal) setActiveFilter(filter as BookStatus | 'all' | 'discover' | 'reports')
    },
    onNavigate: (direction) => {
      if (anyModal || searchedBooks.length === 0 || activeFilter === 'discover' || activeFilter === 'reports') return
      if (viewMode === 'list' && (direction === 'left' || direction === 'right')) return

      setSelectedBookIndex((prev) => {
        if (prev === null) return 0

        let step = 1
        if (viewMode === 'grid' && (direction === 'up' || direction === 'down')) {
          const grid = document.querySelector('.book-grid')
          if (grid && grid.children.length > 1) {
            const firstTop = (grid.children[0] as HTMLElement).offsetTop
            let cols = 1
            while (cols < grid.children.length && (grid.children[cols] as HTMLElement).offsetTop === firstTop) {
              cols++
            }
            step = cols
          }
        }

        if (direction === 'down' || direction === 'right') return Math.min(prev + step, searchedBooks.length - 1)
        return Math.max(prev - step, 0)
      })
    },
    onOpenSelected: () => {
      if (anyModal) return
      if (selectedBookIndex !== null && searchedBooks[selectedBookIndex]) {
        setDetailFocus('default')
        setShowDetail(true)
      }
    },
    onRateSelected: (rating) => {
      if (showAddModal || showSettings || showHelp) return
      if (selectedBookIndex !== null && searchedBooks[selectedBookIndex]) {
        handleUpdateBook(searchedBooks[selectedBookIndex].id, { rating })
      }
    },
    onSetStatusSelected: (status) => {
      if (showAddModal || showSettings || showHelp) return
      if (selectedBookIndex !== null && searchedBooks[selectedBookIndex]) {
        handleUpdateBook(searchedBooks[selectedBookIndex].id, { status: status as BookStatus })
      }
    },
    onDeleteSelected: () => {
      if (showAddModal || showSettings || showHelp) return
      if (selectedBookIndex !== null && searchedBooks[selectedBookIndex]) {
        handleDeleteBook(searchedBooks[selectedBookIndex].id)
      }
    },
    onEditReview: () => {
      if (showAddModal || showSettings || showHelp) return
      if (selectedBookIndex !== null && searchedBooks[selectedBookIndex]) {
        setDetailFocus('review')
        setShowDetail(true)
      }
    },
    onToggleView: () => {
      if (!anyModal) setViewMode((m) => (m === 'list' ? 'grid' : 'list'))
    },
    onShowHelp: () => {
      if (!anyModal) setShowHelp(true)
    },
    onSortBy: (sort) => {
      console.log(`[keys] onSortBy(${sort}) called — anyModal=${anyModal}`)
      if (!anyModal) setSortBy((prev) => prev === sort ? 'date-added' : sort as 'title' | 'author' | 'date-read')
    },
    onEscape: () => {
      console.log(`[keys] onEscape — showHelp=${showHelp} showSettings=${showSettings} showAddModal=${showAddModal} showDetail=${showDetail} selectedBookIndex=${selectedBookIndex}`)
      if (showHelp) {
        setShowHelp(false)
      } else if (showSettings) {
        setShowSettings(false)
        setDiscoverRefreshHint((n) => n + 1)
      } else if (showAddModal) {
        setShowAddModal(false)
      } else if (showDetail) {
        setShowDetail(false)
        setDetailBookId(null)
      } else if (showSearch) {
        setShowSearch(false)
        setSearchQuery('')
      } else if (selectedBookIndex !== null) {
        setSelectedBookIndex(null)
      }
    }
  })

  const handleOpenBook = (index: number): void => {
    setSelectedBookIndex(index)
    setDetailBookId(null)
    setDetailFocus('default')
    setShowDetail(true)
  }

  const selectedBook =
    selectedBookIndex !== null ? searchedBooks[selectedBookIndex] ?? null : null
  const detailBook = detailBookId !== null ? books.find((b) => b.id === detailBookId) ?? null : null

  // Safety net: if showDetail is true but there's no book to show, auto-recover
  useEffect(() => {
    if (showDetail && !detailBook && !selectedBook) {
      console.log('[keys] auto-recovering: showDetail=true but no book to display')
      setShowDetail(false)
      setDetailBookId(null)
    }
  }, [showDetail, detailBook, selectedBook])

  return (
    <div className="app">
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
        onAddBook={() => setShowAddModal(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHelp={() => setShowHelp(true)}
        visible={sidebarVisible}
      />
      <div className={`main-panel${!sidebarVisible ? ' sidebar-hidden' : ''}`}>
        <div className="main-toolbar">
          <div className="main-toolbar-left">
            {!sidebarVisible && (
              <button
                className="sidebar-show-btn"
                onClick={() => setSidebarVisible(true)}
                title="Show sidebar (b)"
              >
                <PanelLeftOpen size={18} />
              </button>
            )}
            {showSearch && activeFilter !== 'discover' && activeFilter !== 'reports' && (
              <div className="toolbar-search">
                <Search size={14} className="toolbar-search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="toolbar-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find a book..."
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowSearch(false)
                      setSearchQuery('')
                    }
                  }}
                />
                <button
                  className="toolbar-search-close"
                  onClick={() => { setShowSearch(false); setSearchQuery('') }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
          <div className="main-toolbar-right">
            {activeFilter !== 'discover' && activeFilter !== 'reports' && (
              <>
                <SortToggle mode={sortBy} onChange={setSortBy} />
                <ViewToggle mode={viewMode} onChange={setViewMode} />
              </>
            )}
          </div>
        </div>
        <main className="main-content">
          {activeFilter === 'discover' ? (
            <DiscoverView
              onOpenSettings={() => setShowSettings(true)}
              onAddBook={handleAddFromDiscover}
              existingBooks={books}
              cachedRecs={cachedRecs}
              onRecsLoaded={setCachedRecs}
              refreshHint={discoverRefreshHint}
            />
          ) : activeFilter === 'reports' ? (
            <ReportsView
              books={books}
              onBookClick={(id) => {
                setDetailBookId(id)
                setDetailFocus('default')
                setShowDetail(true)
              }}
            />
          ) : (
            <BookList
              books={searchedBooks}
              activeFilter={activeFilter}
              selectedBookIndex={selectedBookIndex}
              viewMode={viewMode}
              sortBy={sortBy}
              onOpenBook={handleOpenBook}
              onUpdateBook={handleUpdateBook}
              onDelete={handleDeleteBook}
              onAddBook={() => setShowAddModal(true)}
              onDiscover={() => setActiveFilter('discover')}
            />
          )}
        </main>
      </div>
      {showAddModal && (
        <AddBookModal
          key={addModalKey}
          onAdd={handleAddBook}
          onClose={() => setShowAddModal(false)}
          defaultStatus={activeFilter !== 'all' && activeFilter !== 'discover' && activeFilter !== 'reports' ? activeFilter : undefined}
          existingBooks={books}
        />
      )}
      {showDetail && (detailBook || selectedBook) && (
        <BookDetail
          book={(detailBook || selectedBook)!}
          initialFocus={detailFocus}
          onUpdateBook={handleUpdateBook}
          onDelete={handleDeleteBook}
          onClose={() => {
            setShowDetail(false)
            setDetailFocus('default')
            setDetailBookId(null)
            if (returnToAddRef.current) {
              returnToAddRef.current = false
              setAddModalKey((k) => k + 1)
              setShowAddModal(true)
            }
          }}
        />
      )}
      {showSettings && (
        <SettingsModal
          onClose={() => { setShowSettings(false); setDiscoverRefreshHint((n) => n + 1) }}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLibraryImported={() => { loadBooks(); setCachedRecs(null); prefetchedRef.current = false }}
          addToast={addToast}
        />
      )}
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default App
