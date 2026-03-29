# bookworm

A personal reading tracker for macOS. Search for books, organize your library, and get AI-powered recommendations — all from the keyboard.

Built with Electron, React, and TypeScript.

## Features

- **Book tracking** — Add books via Open Library search or manual entry, with automatic cover art and summaries
- **Status management** — Want to Read, Currently Reading, Finished
- **Ratings & reviews** — 5-star ratings and free-text reviews
- **Mood tags** — Tag books with moods like "cozy", "dark", "thought-provoking"
- **Sorting** — Sort by title, author, date added, or date read, with section dividers
- **List & grid views** — Switch between a detailed list and a compact cover grid
- **Discover** — AI-powered book recommendations via Claude, with mood filters and custom prompts
- **Reports** — Reading timeline grouped by month and year
- **Find** — Quick-search your library with `Cmd+F`
- **Export/Import** — Back up your entire library (books + covers) as a portable `.zip`
- **Keyboard-driven** — Full keyboard navigation with chord shortcuts
- **Dark & light themes** — Follows system preference, or toggle manually

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

### Install & Run

```bash
git clone https://github.com/your-username/bookworm.git
cd bookworm
npm install
npm run dev
```

This starts the Electron app in development mode with hot reload.

### Build for macOS

```bash
npm run build          # Compile for production
npm run package        # Build + package macOS app (output in dist/)
```

## Setting Up Discover

The Discover tab uses the [Claude API](https://docs.anthropic.com/en/api) to generate personalized book recommendations based on your reading history.

1. Get an API key from [console.anthropic.com](https://console.anthropic.com/)
2. Open **Settings** (gear icon in the sidebar footer)
3. Paste your API key and close Settings
4. Navigate to **Discover** — recommendations will generate automatically

You need at least one finished book in your library for recommendations to work.

## Data Storage

Your library is stored locally as a JSON file alongside downloaded cover images:

| Platform | Location |
|----------|----------|
| macOS | `~/Library/Application Support/bookworm/` |

The data file (`bookworm-data.json`) and cover images (`covers/`) live in this directory. To move your library to another machine, copy this folder — or use **Settings > Export Library** to create a portable `.zip` backup that can be imported on any other instance.

> Cloud sync and a mobile companion app are planned for future versions.

## Keyboard Shortcuts

bookworm is designed for keyboard-first navigation. Press `?` to see all shortcuts in-app.

### Single keys

| Key | Action |
|-----|--------|
| `a` | Add a book |
| `b` | Toggle sidebar |
| `v` | Toggle list / grid view |
| `d` | Go to Discover |
| `e` | Edit review on selected book |
| `o` / `Enter` | Open selected book |
| `?` | Show keyboard shortcuts |
| `Cmd+F` | Find a book in current view |
| `Cmd+Enter` | Save and close book detail |
| `Cmd+Delete` | Remove selected book |
| `Esc` | Close modal / clear selection |
| `Arrow keys` | Navigate book list |

### Chord shortcuts (press first key, then second)

| Chord | Action |
|-------|--------|
| `g` then `a` | Go to All Books |
| `g` then `w` | Go to Want to Read |
| `g` then `c` | Go to Currently Reading |
| `g` then `r` | Go to Read Books |
| `g` then `d` | Go to Discover |
| `g` then `p` | Go to Reports |
| `s` then `t` | Sort by title |
| `s` then `a` | Sort by author |
| `s` then `d` | Sort by date read |
| `s` then `r` | Sort by date added |
| `r` then `1-5` | Rate selected book |
| `r` then `0` | Clear rating |
| `m` then `w` | Set status: Want to Read |
| `m` then `c` | Set status: Currently Reading |
| `m` then `r` | Set status: Finished |

## Stack

- [Electron](https://www.electronjs.org/) + [electron-vite](https://electron-vite.org/)
- [React 19](https://react.dev/) + TypeScript
- [Lucide](https://lucide.dev/) icons
- [Open Library API](https://openlibrary.org/developers/api) for book search and covers
- [Claude API](https://docs.anthropic.com/en/api) for recommendations
- [adm-zip](https://github.com/cthackers/adm-zip) for library export/import
- Local JSON file storage (no database server required)
