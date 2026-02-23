# bookworm

A personal reading tracker built with Electron, React, and TypeScript. Track books you're reading, want to read, and have finished — with ratings, reviews, mood tags, and AI-powered recommendations.

## Features

- **Book tracking** — Add books via Open Library search or manual entry, with automatic cover art
- **Status management** — Want to Read, Reading, Finished
- **Ratings & reviews** — 5-star ratings and free-text reviews
- **Mood tags** — Tag books with moods like "cozy", "dark", "thought-provoking"
- **List & grid views** — Switch between a detailed list and a compact cover grid
- **Discover** — AI-powered book recommendations via Claude API based on your library
- **Export/Import** — Back up your entire library (books + covers) as a portable `.zip` file
- **Keyboard-driven** — Full keyboard navigation with chord shortcuts
- **Dark & light themes**

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `a` | Add a book |
| `s` | Toggle sidebar |
| `v` | Toggle list/grid view |
| `d` | Go to Discover |
| `e` | Edit review |
| `o` / `Enter` | Open selected book |
| `Arrow Up/Down` | Navigate book list |
| `Escape` | Close modal / deselect |
| `g` then `b/r/w/f/d` | Go to filter (all/reading/want-to-read/finished/discover) |
| `r` then `1-5` / `0` | Rate selected book / clear rating |
| `m` then `w/r/f` | Set status (want-to-read/reading/finished) |

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build          # Compile for production
npm run package        # Build + package macOS app
```

## Stack

- [Electron](https://www.electronjs.org/) + [electron-vite](https://electron-vite.org/)
- [React 19](https://react.dev/) + TypeScript
- [Lucide](https://lucide.dev/) icons
- [Open Library API](https://openlibrary.org/developers/api) for book search and covers
- [adm-zip](https://github.com/cthackers/adm-zip) for library export/import
- JSON file storage
- Claude API for recommendations (requires API key in Settings)
