import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Search, Loader2, PenLine } from 'lucide-react'
import { Book, BookStatus } from '../App'

interface AddBookModalProps {
  onAdd: (book: Omit<Book, 'id' | 'dateAdded' | 'dateFinished'>) => void
  onClose: () => void
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

export function AddBookModal({ onAdd, onClose }: AddBookModalProps): JSX.Element {
  const [view, setView] = useState<ModalView>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Form state
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalPages, setTotalPages] = useState('')
  const [status, setStatus] = useState<BookStatus>('want-to-read')
  const [coverId, setCoverId] = useState<number | null>(null)
  const [downloadingCover, setDownloadingCover] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const data = await window.api.search(q.trim())
      setResults(data)
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
    setTotalPages(result.pageCount ? String(result.pageCount) : '')
    setView('form')

    if (result.coverId) {
      setDownloadingCover(true)
      const savedId = await window.api.downloadCover(result.coverId)
      setCoverId(savedId)
      setDownloadingCover(false)
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!title.trim() || !author.trim()) return

    onAdd({
      title: title.trim(),
      author: author.trim(),
      totalPages: parseInt(totalPages) || 0,
      currentPage: 0,
      status,
      rating: null,
      coverId
    })
  }

  const handleManualEntry = (): void => {
    setView('form')
  }

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
                placeholder="Search by title or author..."
                autoFocus
              />
              {searching && <Loader2 size={16} className="search-spinner" />}
            </div>

            <div className="search-results">
              {results.map((result, i) => (
                <button
                  key={`${result.olKey}-${i}`}
                  className="search-result"
                  onClick={() => handleSelectResult(result)}
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
              <label htmlFor="pages">Total Pages</label>
              <input
                id="pages"
                type="number"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                placeholder="Number of pages"
                min={0}
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
                <option value="finished">Finished</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => {
                if (title || author) {
                  setView('search')
                } else {
                  onClose()
                }
              }}>
                {title || author ? 'Back' : 'Cancel'}
              </button>
              <button type="submit" className="btn-primary" disabled={!title.trim() || !author.trim()}>
                Add Book
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
