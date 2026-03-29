# UI Polish: Modal/Traffic Light Spacing & HTML Summary Rendering

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two visual bugs — the book detail modal clips into the macOS traffic light zone, and OpenLibrary HTML descriptions render as escaped text instead of formatted HTML.

**Architecture:** Both fixes are self-contained. Task 1 is a pure CSS change to the modal overlay. Task 2 adds an IPC bridge for `shell.openExternal`, then switches the summary from a text node to `dangerouslySetInnerHTML` with a delegated link-click handler.

**Tech Stack:** Electron (main process IPC), React (renderer), CSS custom properties, TypeScript

---

## File Map

| File | Change |
|------|--------|
| `src/renderer/src/styles.css` | Add `padding-top` to `.modal-overlay`; add `.detail-summary a` link styles |
| `src/renderer/src/components/BookDetail.tsx` | Switch summary to `dangerouslySetInnerHTML` + link click handler |
| `src/preload/index.ts` | Add `openExternal` to `BookAPI` interface + implementation |
| `src/main/index.ts` | Add `ipcMain.handle('shell:openExternal', ...)` handler |

---

## Task 1: Fix Modal / Traffic Light Overlap

**Problem:** `titleBarStyle: 'hiddenInset'` places the macOS traffic lights at `{ x: 16, y: 16 }` within the web content area. The `.modal-overlay` has `position: fixed; inset: 0`, so flex-centering can push the 95vh book detail modal up into the traffic light zone.

**Fix:** Add `padding-top: 48px` to `.modal-overlay`. The backdrop still dims from `inset: 0`, but the flex container's available height for centering is pushed below the title bar zone. No other modals need adjustment — they're smaller and centered naturally.

**Files:**
- Modify: `src/renderer/src/styles.css` (around line 734)

- [ ] **Step 1: Edit `.modal-overlay` in styles.css**

  Find this block (around line 734):
  ```css
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(4px);
    outline: none;
  }
  ```

  Replace with:
  ```css
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 48px;
    z-index: 100;
    backdrop-filter: blur(4px);
    outline: none;
  }
  ```

- [ ] **Step 2: Verify visually**

  Run: `npm run dev`

  Expected: Open any book's detail view. The modal should sit clearly below the macOS traffic lights with no overlap. The traffic lights should appear above the blurred overlay backdrop, not adjacent to the modal's top edge.

- [ ] **Step 3: TypeScript check**

  Run: `npx tsc --noEmit`

  Expected: No errors (CSS-only change, TypeScript unaffected).

- [ ] **Step 4: Commit**

  ```bash
  git add src/renderer/src/styles.css
  git commit -m "fix: push modal below macOS traffic light zone"
  ```

---

## Task 2: Render OpenLibrary HTML Descriptions

**Problem:** `book.summary` from OpenLibrary contains HTML like `<a href="https://openlibrary.org/works/OL...">Title:</a> Description text...`. In BookDetail, it renders as `{book.summary}` — a React text node — so all tags appear as escaped literal text.

**Fix:**
1. Expose `shell.openExternal` via IPC so the renderer can open links in the system browser.
2. Change the summary `<p>` to a `<div>` using `dangerouslySetInnerHTML`.
3. Add a delegated click handler on the summary container that intercepts `<a>` clicks and routes them through `openExternal` (preventing Electron from navigating away).
4. Style the links to fit the app's visual language.

**Files:**
- Modify: `src/preload/index.ts`
- Modify: `src/main/index.ts`
- Modify: `src/renderer/src/components/BookDetail.tsx`
- Modify: `src/renderer/src/styles.css`

- [ ] **Step 1: Add `openExternal` to the preload**

  In `src/preload/index.ts`, update the `BookAPI` interface and implementation:

  ```ts
  export interface BookAPI {
    getAll: () => Promise<any[]>
    add: (book: any) => Promise<any>
    update: (id: number, updates: any) => Promise<any>
    delete: (id: number) => Promise<void>
    search: (query: string, offset?: number) => Promise<any[]>
    downloadCover: (coverId: number) => Promise<number | null>
    fetchSummary: (olKey: string) => Promise<string | null>
    getSettings: () => Promise<any>
    updateSettings: (updates: any) => Promise<any>
    getRecommendations: (userPrompt?: string) => Promise<any>
    syncTheme: (theme: string) => Promise<void>
    exportLibrary: () => Promise<{ success: boolean; bookCount?: number; error?: string }>
    importLibrary: () => Promise<{ success: boolean; bookCount?: number; error?: string }>
    openExternal: (url: string) => Promise<void>
  }

  const api: BookAPI = {
    getAll: () => ipcRenderer.invoke('books:getAll'),
    add: (book) => ipcRenderer.invoke('books:add', book),
    update: (id, updates) => ipcRenderer.invoke('books:update', id, updates),
    delete: (id) => ipcRenderer.invoke('books:delete', id),
    search: (query, offset) => ipcRenderer.invoke('books:search', query, offset),
    downloadCover: (coverId) => ipcRenderer.invoke('books:downloadCover', coverId),
    fetchSummary: (olKey) => ipcRenderer.invoke('books:fetchSummary', olKey),
    getSettings: () => ipcRenderer.invoke('settings:get'),
    updateSettings: (updates) => ipcRenderer.invoke('settings:update', updates),
    getRecommendations: (userPrompt?) => ipcRenderer.invoke('discover:getRecommendations', userPrompt),
    syncTheme: (theme) => ipcRenderer.invoke('theme:sync', theme),
    exportLibrary: () => ipcRenderer.invoke('library:export'),
    importLibrary: () => ipcRenderer.invoke('library:import'),
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url)
  }
  ```

- [ ] **Step 2: Add IPC handler in main process**

  In `src/main/index.ts`, find the block of `ipcMain.handle` calls and add:

  ```ts
  ipcMain.handle('shell:openExternal', (_, url: string) => {
    shell.openExternal(url)
  })
  ```

  (`shell` is already imported at the top of `index.ts`.)

- [ ] **Step 3: Update BookDetail summary rendering**

  In `src/renderer/src/components/BookDetail.tsx`, replace the summary block:

  ```tsx
  // BEFORE:
  {book.summary && (
    <div className="detail-section">
      <p className="detail-summary">{book.summary}</p>
    </div>
  )}
  ```

  ```tsx
  // AFTER:
  {book.summary && (
    <div className="detail-section">
      <div
        className="detail-summary"
        dangerouslySetInnerHTML={{ __html: book.summary }}
        onClick={(e) => {
          const target = e.target as HTMLElement
          if (target.tagName === 'A') {
            e.preventDefault()
            const href = (target as HTMLAnchorElement).href
            if (href) window.api.openExternal(href)
          }
        }}
      />
    </div>
  )}
  ```

- [ ] **Step 4: Style links in the summary**

  In `src/renderer/src/styles.css`, add after the existing `.detail-summary` rule (around line 1423):

  ```css
  .detail-summary a {
    color: var(--accent);
    text-decoration: none;
  }

  .detail-summary a:hover {
    text-decoration: underline;
  }
  ```

- [ ] **Step 5: TypeScript check**

  Run: `npx tsc --noEmit`

  Expected: No errors. The `window.api.openExternal` call should resolve cleanly since `BookAPI` now includes it.

- [ ] **Step 6: Verify visually**

  Run: `npm run dev`

  Expected:
  - Open "Behind Closed Doors" (or any book with an OpenLibrary summary). The description pane should show rendered HTML — book titles as clickable links, no visible `<a href=...>` tag text.
  - Click a link in the description. It should open in the system browser (Safari/Chrome), not navigate the Electron window.

- [ ] **Step 7: Commit**

  ```bash
  git add src/preload/index.ts src/main/index.ts src/renderer/src/components/BookDetail.tsx src/renderer/src/styles.css
  git commit -m "feat: render OpenLibrary HTML descriptions with external link handling"
  ```
