# Bookworm — Claude Code Guide

## Quick Reference

```bash
npm run dev        # Start dev server (electron-vite)
npm run build      # Production build
npm run package    # Build + electron-builder (macOS)
```

TypeScript check: `npx tsc --noEmit`

## Architecture

Electron app with three process layers:

```
src/main/           — Electron main process (Node)
  index.ts          — Window, IPC handlers, covers:// protocol
  database.ts       — JSON file storage (reads/writes bookworm-data.json in userData)
  openlibrary.ts    — Open Library API search + cover download
  claude.ts         — Claude API for book recommendations
src/preload/        — Bridge between main and renderer
  index.ts          — Exposes window.api via contextBridge
src/renderer/src/   — React UI (single-page)
  App.tsx           — Root state, keyboard shortcuts, modal orchestration
  components/       — All UI components
  hooks/            — useKeyboardShortcuts (chord-based shortcut system)
  styles.css        — All styles (single file, CSS custom properties)
  constants.ts      — Mood tags list
```

## Key Patterns

**Data flow**: All book CRUD goes through IPC (`window.api.*` -> `ipcMain.handle` -> `database.ts`). The renderer never touches the filesystem directly.

**Cover images**: Downloaded from Open Library to `{userData}/covers/`, served via a custom `covers://` protocol registered with `standard: true`. Use `covers://local/{coverId}.jpg` in `<img>` tags.

**Keyboard shortcuts**: Implemented in `useKeyboardShortcuts.ts` using a chord system (e.g., `r` then `1-5` to rate). The hook uses a ref-based callback pattern to avoid re-attaching the event listener. Shortcuts for rating/status work inside the BookDetail modal.

**View modes**: List and grid views toggled via ViewToggle component or `v` key. Preference stored in `localStorage('bookworm-view')`.

**Date Read**: User-facing `dateRead` field stored as `"YYYY-MM"` string or `null`. Defaults to current month in AddBookModal, skippable via checkbox. Editable in BookDetail. Separate from `dateAdded` (internal system timestamp). Books without a date are treated as older/retroactive additions by the AI.

**Theming**: Dark/light via `data-theme` attribute on `<html>`. Toggle lives in SettingsModal. CSS custom properties defined in `:root` and `[data-theme="light"]`.

**Library export/import**: In Settings, users can export their full library (books + covers) as a `.zip` via `adm-zip`, or import from one. Export bundles `data.json` + `covers/*.jpg`. Import is a full replace (not merge). Settings (API key) are excluded from exports for security. On import, the renderer reloads books and resets cached recommendations.

## Environment Constraints

- Corporate SSL proxy blocks `node-gyp` and Node `fetch` — use Electron's `net.fetch` (Chromium stack) for HTTP in the main process
- SQLite/native modules won't build due to the proxy; that's why we use JSON file storage
- `adm-zip` (pure JS) is used for library export/import — no native dependencies
- Node v24, npm v11, macOS ARM64

## Style Conventions

- **Fonts**: Cormorant Garamond for headings/titles, Cabin for body text
- **Icons**: Lucide React (no emoji-icons)
- **CSS**: Single `styles.css` file with BEM-like class naming, CSS custom properties for theming
- **Colors**: `#48a111` (primary green), `#25671e` (deep green), `#f2b50b` (gold/warning), `#f7f0f0` (off-white text)
- Lucide SVGs inside flex containers need `display: block` to fix baseline alignment
