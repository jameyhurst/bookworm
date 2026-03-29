# Tags Redux + Explore View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the tag list with a richer, cheeky set and add a new Explore sidebar view that lets users browse their library by tag.

**Architecture:** `ExploreView` is a self-contained component (mirrors `DiscoverView`/`ReportsView`) that owns `activeTag` state internally — shows a tag pill grid when no tag is selected, and a filtered `BookList` when one is. The filter type union and Sidebar are extended minimally to accommodate the new `'explore'` nav entry.

**Tech Stack:** React + TypeScript, Electron (no test framework — TypeScript check `npx tsc --noEmit` is the primary verification step)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/renderer/src/constants.ts` | Modify | New MOOD_TAGS list |
| `src/renderer/src/components/ExploreView.tsx` | **Create** | Tag grid + filtered book list view |
| `src/renderer/src/styles.css` | Modify | Explore-specific styles |
| `src/renderer/src/components/Sidebar.tsx` | Modify | Add Explore nav item, extend prop types |
| `src/renderer/src/App.tsx` | Modify | Extend filter type, render branch, toolbar/search guards |

---

## Task 1: Update tag list

**Files:**
- Modify: `src/renderer/src/constants.ts`

- [ ] **Replace MOOD_TAGS**

  Open `src/renderer/src/constants.ts` and replace the entire file with:

  ```ts
  export const MOOD_TAGS = [
    'thought-provoking',
    'page-turner',
    'slow-burn',
    'beautiful-prose',
    "couldn't-put-down",
    'mind-bending',
    'dark',
    'funny',
    'informative',
    'comfort-read',
    're-read',
    'gut-punch',
    'slow-starter',
    'gift-worthy',
    'meh',
    'overrated',
    'DNF',
    'pretentious',
    'unputdownable-trash'
  ]
  ```

- [ ] **Verify TypeScript**

  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Commit**

  ```bash
  git add src/renderer/src/constants.ts
  git commit -m "feat: expand mood tags — add cheeky tier, remove heartwarming"
  ```

---

## Task 2: Create ExploreView shell

**Files:**
- Create: `src/renderer/src/components/ExploreView.tsx`

- [ ] **Create the file with props interface and stub render**

  ```tsx
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
  ```

- [ ] **Verify TypeScript**

  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors.

---

## Task 3: Add Explore styles

**Files:**
- Modify: `src/renderer/src/styles.css`

- [ ] **Append styles** at the end of `src/renderer/src/styles.css`:

  ```css
  /* ─── Explore View ─── */
  .explore-view {
    padding: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .explore-tag-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 8px 0 24px;
    align-content: flex-start;
  }

  .explore-tag-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 20px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    font-family: 'Cabin', sans-serif;
    font-size: 13px;
    color: var(--text-primary);
    user-select: none;
  }

  .explore-tag-pill:hover {
    border-color: var(--border-hover);
    background: var(--bg-hover);
  }

  .explore-tag-pill .explore-tag-name {
    line-height: 1;
  }

  .explore-tag-empty {
    color: var(--text-muted);
    font-size: 14px;
    padding: 32px 0;
  }

  .explore-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0 20px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: color 0.15s;
    width: fit-content;
  }

  .explore-header:hover {
    color: var(--text-primary);
  }

  .explore-header-label {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: 0.04em;
  }
  ```

- [ ] **Verify TypeScript**

  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Commit**

  ```bash
  git add src/renderer/src/components/ExploreView.tsx src/renderer/src/styles.css
  git commit -m "feat: add ExploreView shell and styles"
  ```

---

## Task 4: Implement tag grid (no-tag-selected state)

**Files:**
- Modify: `src/renderer/src/components/ExploreView.tsx`

- [ ] **Replace the stub render with the full tag grid implementation**

  Replace the entire contents of `src/renderer/src/components/ExploreView.tsx` with:

  ```tsx
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

    // Compute tag → count map, sorted descending by count
    const tagCounts = new Map<string, number>()
    books.forEach((book) => {
      book.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      })
    })
    const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])

    if (activeTag === null) {
      return (
        <div className="explore-view">
          {sortedTags.length === 0 ? (
            <p className="explore-tag-empty">No tags yet — open a book and add some.</p>
          ) : (
            <div className="explore-tag-grid">
              {sortedTags.map(([tag, count]) => (
                <button
                  key={tag}
                  className="explore-tag-pill"
                  onClick={() => setActiveTag(tag)}
                >
                  <span className="explore-tag-name">{tag}</span>
                  <span className="section-header-count">{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )
    }

    // Tag selected — render filtered BookList
    const filtered = books.filter((b) => b.tags.includes(activeTag))
    return (
      <div className="explore-view">
        <div className="explore-header" onClick={() => setActiveTag(null)}>
          <ChevronLeft size={16} strokeWidth={2} />
          <span className="explore-header-label">{activeTag}</span>
        </div>
        <BookList
          books={filtered}
          activeFilter="all"
          selectedBookIndex={selectedBookIndex}
          viewMode={viewMode}
          sortBy={sortBy}
          onOpenBook={onOpenBook}
          onUpdateBook={onUpdateBook}
          onDelete={onDelete}
          onAddBook={onAddBook}
          onDiscover={onDiscover}
        />
      </div>
    )
  }
  ```

- [ ] **Verify TypeScript**

  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Commit**

  ```bash
  git add src/renderer/src/components/ExploreView.tsx
  git commit -m "feat: implement ExploreView tag grid and filtered book list"
  ```

---

## Task 5: Extend Sidebar with Explore nav item

**Files:**
- Modify: `src/renderer/src/components/Sidebar.tsx`

- [ ] **Add `'explore'` to the Sidebar prop types and nav**

  Replace the entire contents of `src/renderer/src/components/Sidebar.tsx` with:

  ```tsx
  import { Library, BookOpen, Sparkles, CheckCircle, Plus, Compass, BarChart3, Tags, Settings, HelpCircle, type LucideIcon } from 'lucide-react'
  import { BookStatus } from '../App'
  import appIcon from '../../../../resources/icon-transparent.png'

  interface SidebarProps {
    activeFilter: BookStatus | 'all' | 'discover' | 'reports' | 'explore'
    onFilterChange: (filter: BookStatus | 'all' | 'discover' | 'reports' | 'explore') => void
    counts: Record<BookStatus | 'all', number>
    onAddBook: () => void
    onOpenSettings: () => void
    onOpenHelp: () => void
    visible: boolean
  }

  const filters: { key: BookStatus | 'all'; label: string; icon: LucideIcon }[] = [
    { key: 'all', label: 'All Books', icon: Library },
    { key: 'want-to-read', label: 'Want to Read', icon: Sparkles },
    { key: 'reading', label: 'Currently Reading', icon: BookOpen },
    { key: 'finished', label: 'Read Books', icon: CheckCircle }
  ]

  export function Sidebar({ activeFilter, onFilterChange, counts, onAddBook, onOpenSettings, onOpenHelp, visible }: SidebarProps): JSX.Element {
    return (
      <aside className={`sidebar${visible ? '' : ' collapsed'}`}>
        <div className="sidebar-header">
          <div className="drag-region" />
          <h1 className="app-title">
            <img src={appIcon} alt="" className="app-title-icon" />
            bookworm
          </h1>
        </div>

        <button className="add-book-btn" onClick={onAddBook}>
          <Plus size={18} strokeWidth={2.5} />
          Add Book
        </button>

        <nav className="sidebar-nav">
          {filters.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`nav-item ${activeFilter === key ? 'active' : ''}`}
              onClick={() => onFilterChange(key)}
            >
              <Icon size={16} className="nav-icon" />
              <span className="nav-label">{label}</span>
              <span className="nav-count">{counts[key]}</span>
            </button>
          ))}

          <div className="sidebar-divider" />

          <button
            className={`nav-item ${activeFilter === 'explore' ? 'active' : ''}`}
            onClick={() => onFilterChange('explore')}
          >
            <Tags size={16} className="nav-icon" />
            <span className="nav-label">Explore</span>
          </button>
          <button
            className={`nav-item ${activeFilter === 'discover' ? 'active' : ''}`}
            onClick={() => onFilterChange('discover')}
          >
            <Compass size={16} className="nav-icon" />
            <span className="nav-label">Discover</span>
          </button>
          <button
            className={`nav-item ${activeFilter === 'reports' ? 'active' : ''}`}
            onClick={() => onFilterChange('reports')}
          >
            <BarChart3 size={16} className="nav-icon" />
            <span className="nav-label">Reports</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-actions">
            <button className="sidebar-footer-btn" onClick={onOpenSettings} title="Settings">
              <Settings size={15} />
            </button>
            <button className="sidebar-footer-btn" onClick={onOpenHelp} title="Keyboard shortcuts (?)">
              <HelpCircle size={15} />
            </button>
          </div>
          <span className="app-version">v0.2.0</span>
        </div>
      </aside>
    )
  }
  ```

- [ ] **Verify TypeScript**

  ```bash
  npx tsc --noEmit
  ```
  Expected: errors in App.tsx because its filter type is not yet extended — that's fine, fix next.

---

## Task 6: Wire ExploreView into App.tsx

**Files:**
- Modify: `src/renderer/src/App.tsx`

Six specific edits — make them in order:

- [ ] **1. Add ExploreView import** (after the ReportsView import line):

  ```tsx
  import { ExploreView } from './components/ExploreView'
  ```

- [ ] **2. Extend the `activeFilter` state type** — find this line:

  ```tsx
  const [activeFilter, setActiveFilter] = useState<BookStatus | 'all' | 'discover' | 'reports'>('all')
  ```
  Change to:
  ```tsx
  const [activeFilter, setActiveFilter] = useState<BookStatus | 'all' | 'discover' | 'reports' | 'explore'>('all')
  ```

- [ ] **3. Update `onGoToFilter` cast** in `useKeyboardShortcuts` — find:

  ```tsx
  if (!anyModal) setActiveFilter(filter as BookStatus | 'all' | 'discover' | 'reports')
  ```
  Change to:
  ```tsx
  if (!anyModal) setActiveFilter(filter as BookStatus | 'all' | 'discover' | 'reports' | 'explore')
  ```

- [ ] **4. Update navigate guard** — find:

  ```tsx
  if (anyModal || searchedBooks.length === 0 || activeFilter === 'discover' || activeFilter === 'reports') return
  ```
  Change to:
  ```tsx
  if (anyModal || searchedBooks.length === 0 || activeFilter === 'discover' || activeFilter === 'reports' || activeFilter === 'explore') return
  ```

- [ ] **5. Update toolbar guards** — find (two places, both need `'explore'` added):

  ```tsx
  {showSearch && activeFilter !== 'discover' && activeFilter !== 'reports' && (
  ```
  Change to:
  ```tsx
  {showSearch && activeFilter !== 'discover' && activeFilter !== 'reports' && activeFilter !== 'explore' && (
  ```

  And:
  ```tsx
  {activeFilter !== 'discover' && activeFilter !== 'reports' && (
  ```
  Change to:
  ```tsx
  {activeFilter !== 'discover' && activeFilter !== 'reports' && activeFilter !== 'explore' && (
  ```

- [ ] **6. Add ExploreView render branch** — find the main render chain:

  ```tsx
  {activeFilter === 'discover' ? (
    <DiscoverView ... />
  ) : activeFilter === 'reports' ? (
    <ReportsView ... />
  ) : (
    <BookList ... />
  )}
  ```
  Replace with:
  ```tsx
  {activeFilter === 'discover' ? (
    <DiscoverView
      onOpenSettings={() => setShowSettings(true)}
      onAddBook={handleAddBook}
      existingBooks={books}
      cachedRecs={cachedRecs}
      onRecsLoaded={setCachedRecs}
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
  ) : activeFilter === 'explore' ? (
    <ExploreView
      books={books}
      viewMode={viewMode}
      sortBy={sortBy}
      selectedBookIndex={selectedBookIndex}
      onOpenBook={handleOpenBook}
      onUpdateBook={handleUpdateBook}
      onDelete={handleDeleteBook}
      onAddBook={() => setShowAddModal(true)}
      onDiscover={() => setActiveFilter('discover')}
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
  ```

- [ ] **Verify TypeScript**

  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Smoke test in app**

  Run `npm run dev`. Verify:
  - Explore nav item appears in sidebar between Finished and Discover
  - Clicking Explore shows the tag pill grid with counts
  - Clicking a tag pill shows a back chevron + tag label + filtered book list
  - Clicking the back header returns to the pill grid
  - SortToggle and ViewToggle are hidden in Explore view
  - Search bar is hidden in Explore view

- [ ] **Commit**

  ```bash
  git add src/renderer/src/components/Sidebar.tsx src/renderer/src/App.tsx
  git commit -m "feat: wire ExploreView into App — extend filter type, add sidebar nav, render branch"
  ```
