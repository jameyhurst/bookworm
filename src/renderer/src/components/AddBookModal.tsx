import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Search, Loader2, PenLine, HelpCircle } from 'lucide-react'
import { Book, BookStatus } from '../App'

interface AddBookModalProps {
  onAdd: (book: Omit<Book, 'id' | 'bookId' | 'dateAdded' | 'dateFinished'>) => Promise<string | null>
  onClose: () => void
  defaultStatus?: BookStatus
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

export function AddBookModal({ onAdd, onClose, defaultStatus }: AddBookModalProps): JSX.Element {
  const [view, setView] = useState<ModalView>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Form state
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [status, setStatus] = useState<BookStatus>(defaultStatus ?? 'want-to-read')
  const [coverId, setCoverId] = useState<number | null>(null)
  const [downloadingCover, setDownloadingCover] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [loadingMeta, setLoadingMeta] = useState(false)
  const [dateRead, setDateRead] = useState(() => new Date().toISOString().slice(0, 7))
  const [skipDate, setSkipDate] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [selectedResult, setSelectedResult] = useState(-1)
  const resultsRef = useRef<HTMLDivElement>(null)

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
    setTitle(result.title)
    setAuthor(result.author)
    setSummary(null)
    setView('form')
    setLoadingMeta(true)

    // Fetch cover and summary in parallel
    const coverPromise = result.coverId
      ? window.api.downloadCover(result.coverId)
      : Promise.resolve(null)
    const summaryPromise = result.olKey
      ? window.api.fetchSummary(result.olKey)
      : Promise.resolve(null)

    if (result.coverId) setDownloadingCover(true)
    try {
      const [savedId, fetchedSummary] = await Promise.all([coverPromise, summaryPromise])
      setCoverId(savedId)
      setSummary(fetchedSummary)
    } catch {
      // Network errors shouldn't block adding the book
    } finally {
      setDownloadingCover(false)
      setLoadingMeta(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!title.trim() || !author.trim() || loadingMeta) return
    setAddError(null)

    const error = await onAdd({
      title: title.trim(),
      author: author.trim(),
      status,
      rating: null,
      review: null,
      tags: [],
      coverId,
      summary,
      dateRead: skipDate ? null : dateRead
    })
    if (error) {
      setAddError(error)
    } else {
      // Reset for next add
      setTitle('')
      setAuthor('')
      setCoverId(null)
      setSummary(null)
      setDateRead(new Date().toISOString().slice(0, 7))
      setSkipDate(false)
      setQuery('')
      setResults([])
      setSelectedResult(-1)
      setAddError(null)
      setView('search')
    }
  }

  const handleManualEntry = (): void => {
    setTitle(query.trim())
    setView('form')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Enter' && e.metaKey && view === 'form' && title.trim() && author.trim()) {
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
              />
              {searching && <Loader2 size={16} className="search-spinner" />}
            </div>

            <div className="search-results" ref={resultsRef}>
              {results.map((result, i) => (
                <button
                  key={`${result.olKey}-${i}`}
                  className={`search-result${selectedResult === i ? ' search-result-selected' : ''}`}
                  onClick={() => handleSelectResult(result)}
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
                  </div>
                </button>
              ))}

              {query.trim().length >= 2 && !searching && results.length === 0 && (
                <div className="search-empty">No results found</div>
              )}
            </div>

            <button className="manual-entry-btn" onClick={handleManualEntry}>
              <PenLine size={14} />
              Add manually instead
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            {(coverId || downloadingCover) && (
              <div className="form-cover-preview">
                {downloadingCover ? (
                  <div className="cover-loading">
                    <Loader2 size={20} className="search-spinner" />
                  </div>
                ) : (
                  <img src={`covers://local/${coverId}.jpg`} alt="" className="cover-preview-img" />
                )}
              </div>
            )}

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

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as BookStatus)}
              >
                <option value="want-to-read">Want to Read</option>
                <option value="reading">Currently Reading</option>
                <option value="finished">Read</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date Read</label>
              <div className="date-read-row">
                {!skipDate && (
                  <input
                    type="month"
                    className="month-input"
                    value={dateRead}
                    onChange={(e) => setDateRead(e.target.value)}
                  />
                )}
                <label className="skip-date-toggle">
                  <input
                    type="checkbox"
                    checked={skipDate}
                    onChange={(e) => setSkipDate(e.target.checked)}
                  />
                  Skip date
                  <span className="date-help-icon">
                    <HelpCircle size={13} />
                    <span className="date-help-tooltip">
                      Skip the date when building your library retroactively. Books without a date are treated as older reads.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {addError && <p className="add-error">{addError}</p>}

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => {
                if (title || author) {
                  setView('search')
                  setAddError(null)
                } else {
                  onClose()
                }
              }}>
                {title || author ? 'Back' : 'Cancel'}
              </button>
              <button type="submit" className="btn-primary" disabled={!title.trim() || !author.trim() || loadingMeta}>
                {loadingMeta ? 'Loading...' : 'Add Book'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
