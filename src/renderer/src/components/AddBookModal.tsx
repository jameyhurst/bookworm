import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Search, Loader2, PenLine } from 'lucide-react'
import { Book, BookStatus } from '../App'

export interface AddBookMeta {
  openLibraryCoverId?: number
  olKey?: string
}

interface AddBookModalProps {
  onAdd: (book: Omit<Book, 'id' | 'bookId' | 'dateAdded' | 'dateFinished'>, meta?: AddBookMeta) => Promise<string | null>
  onClose: () => void
  defaultStatus?: BookStatus
  existingBooks?: Book[]
}

interface SearchResult {
  title: string
  author: string
  firstPublishYear: number | null
  pageCount: number | null
  coverId: number | null
  olKey: string
}

type ModalView = 'search' | 'form'

export function AddBookModal({ onAdd, onClose, defaultStatus, existingBooks = [] }: AddBookModalProps): JSX.Element {
  const [view, setView] = useState<ModalView>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Form state (manual entry only)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [selectedResult, setSelectedResult] = useState(-1)
  const resultsRef = useRef<HTMLDivElement>(null)

  const isDupe = (title: string, author: string): boolean => {
    const bookId = `${title.trim().toLowerCase()}::${author.trim().toLowerCase()}`
    return existingBooks.some((b) => b.bookId === bookId)
  }

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const data = await window.api.search(q.trim())
      setResults(data)
      setSelectedResult(-1)
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, doSearch])

  const handleSelectResult = async (result: SearchResult): Promise<void> => {
    if (adding) return
    setAdding(true)
    setAddError(null)

    const error = await onAdd({
      title: result.title,
      author: result.author,
      status: defaultStatus ?? 'want-to-read',
      rating: null,
      review: null,
      tags: [],
      coverId: null,
      summary: null,
      dateRead: new Date().toISOString().slice(0, 7)
    }, {
      openLibraryCoverId: result.coverId ?? undefined,
      olKey: result.olKey
    })

    if (error) {
      setAddError(error)
      setAdding(false)
    }
    // If no error, modal unmounts via the chain in App.tsx
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!title.trim() || !author.trim() || adding) return
    setAddError(null)
    setAdding(true)

    const error = await onAdd({
      title: title.trim(),
      author: author.trim(),
      status: defaultStatus ?? 'want-to-read',
      rating: null,
      review: null,
      tags: [],
      coverId: null,
      summary: null,
      dateRead: new Date().toISOString().slice(0, 7)
    })

    if (error) {
      setAddError(error)
      setAdding(false)
    }
  }

  const handleManualEntry = (): void => {
    setTitle(query.trim())
    setAddError(null)
    setView('form')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Enter' && e.metaKey && view === 'form' && title.trim() && author.trim() && !adding) {
        e.preventDefault()
        handleSubmit(e as unknown as React.FormEvent)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{view === 'search' ? 'Add a Book' : title || 'New Book'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {view === 'search' ? (
          <div className="modal-search">
            <div className="search-input-wrapper">
              <Search size={16} className="search-input-icon" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (adding) return
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setSelectedResult((prev) => Math.min(prev + 1, results.length - 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setSelectedResult((prev) => Math.max(prev - 1, -1))
                  } else if (e.key === 'Enter' && selectedResult >= 0 && results[selectedResult]) {
                    e.preventDefault()
                    handleSelectResult(results[selectedResult])
                  }
                }}
                placeholder="Search by title or author..."
                autoFocus
                disabled={adding}
              />
              {(searching || adding) && <Loader2 size={16} className="search-spinner" />}
            </div>

            {addError && <p className="add-error">{addError}</p>}

            <div className="search-results" ref={resultsRef}>
              {results.map((result, i) => (
                <button
                  key={`${result.olKey}-${i}`}
                  className={`search-result${selectedResult === i ? ' search-result-selected' : ''}`}
                  onClick={() => handleSelectResult(result)}
                  disabled={adding}
                  ref={(el) => {
                    if (selectedResult === i && el) el.scrollIntoView({ block: 'nearest' })
                  }}
                >
                  {result.coverId ? (
                    <img
                      className="search-result-cover"
                      src={`https://covers.openlibrary.org/b/id/${result.coverId}-S.jpg`}
                      alt=""
                    />
                  ) : (
                    <div className="search-result-cover placeholder" />
                  )}
                  <div className="search-result-info">
                    <span className="search-result-title">{result.title}</span>
                    <span className="search-result-meta">
                      {result.author}
                      {result.firstPublishYear && ` · ${result.firstPublishYear}`}
                      {result.pageCount && ` · ${result.pageCount} pages`}
                    </span>
                    {isDupe(result.title, result.author) && (
                      <span className="search-result-dupe">Already in library</span>
                    )}
                  </div>
                </button>
              ))}

              {query.trim().length >= 2 && !searching && results.length === 0 && (
                <div className="search-empty">No results found</div>
              )}
            </div>

            <button className="manual-entry-btn" onClick={handleManualEntry} disabled={adding}>
              <PenLine size={14} />
              Add manually instead
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Book title"
                autoFocus={!title}
              />
            </div>

            <div className="form-group">
              <label htmlFor="author">Author</label>
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
              />
            </div>

            {addError && <p className="add-error">{addError}</p>}

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => {
                setView('search')
                setAddError(null)
              }}>
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={!title.trim() || !author.trim() || adding}>
                {adding ? 'Adding...' : 'Add Book'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
