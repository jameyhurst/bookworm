# Tags Redux + Explore View — Design Spec

**Date:** 2026-03-29

## Overview

Two related changes: expand the mood tag list with honest/cheeky tags (and prune the unused ones), then add a first-class **Explore** view to the sidebar that lets users browse their library by tag.

---

## 1. Tag List Changes (`constants.ts`)

Remove `heartwarming` — zero uses across the library.

Replace the full `MOOD_TAGS` array with (positive → honest → cheeky order):

```
thought-provoking
page-turner
slow-burn
beautiful-prose
couldn't-put-down
mind-bending
dark
funny
informative
comfort-read
re-read
gut-punch
slow-starter
gift-worthy
meh
overrated
DNF
pretentious
unputdownable-trash
```

No other files need changes for the tag list itself — `MOOD_TAGS` is the single source of truth consumed by `AddBookModal` and `BookDetail`.

---

## 2. Sidebar Nav

- Add `'explore'` to the `BookStatus | 'all' | 'discover' | 'reports'` union type in `App.tsx`.
- Add an **Explore** nav item in `Sidebar.tsx` using the `Tags` Lucide icon.
- Position: between **Finished** and **Discover** in the nav order.

---

## 3. `ExploreView` Component

**File:** `src/renderer/src/components/ExploreView.tsx`

**Props:**
```ts
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
```

**Internal state:** `activeTag: string | null` — `null` means show the tag grid.

### Tag Grid (no tag selected)

- Compute `tagCounts: Map<string, number>` from `books` — only tags with ≥1 book shown.
- Sort by count descending.
- Render as a wrapped flex grid of pills. Each pill shows: tag label + a count badge (same `.section-header-count` style used in section headers).
- Clicking a pill sets `activeTag`.
- Empty state (no books have any tags): short message prompting the user to tag some books.

### Tag Detail (tag selected)

- Header row: back chevron (`ChevronLeft`) + tag name. Clicking either clears `activeTag`.
- Below: `<BookList>` filtered to `books.filter(b => b.tags.includes(activeTag))`.
- Pass `viewMode`, `sortBy`, `selectedBookIndex`, and all callbacks through to `BookList` unchanged, so sort/view preferences apply inside tag views.
- The filtered `books` array is re-indexed (0-based) for `selectedBookIndex` purposes — consistent with how other views work.

---

## 4. `App.tsx` Changes

- Extend the `activeFilter` type to include `'explore'`.
- Add a render branch: when `activeFilter === 'explore'`, render `<ExploreView>` instead of `<BookList>`.
- Pass `viewMode`, `sortBy`, `selectedBookIndex`, and all book callbacks to `ExploreView`.
- No changes to keyboard shortcuts, search, or any other App logic.

---

## 5. Styling (`styles.css`)

New styles needed:
- `.explore-tag-grid` — wrapping flex container for tag pills, `gap: 10px`, `flex-wrap: wrap`, some top padding.
- `.explore-tag-pill` — larger than standard tag pills (the ones on book cards). Shows tag name + count badge. Uses `--bg-tertiary` background, `--border` border, hover state. Cursor pointer.
- `.explore-header` — back-button row above the filtered book list. Flex row, `align-items: center`, `gap: 8px`. Back chevron + tag name in Cormorant Garamond.

Reuses `.section-header-count` for the count badge inside each pill (no new style needed there).

---

## Out of Scope

- Multi-tag filtering
- Clicking a tag pill on a book card to jump to Explore (future)
- Tag management (rename, delete, merge)
