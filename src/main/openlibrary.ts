import { net } from 'electron'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

export interface SearchResult {
  title: string
  author: string
  firstPublishYear: number | null
  pageCount: number | null
  coverId: number | null
  olKey: string
}

export async function searchBooks(query: string): Promise<SearchResult[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=6&fields=title,author_name,first_publish_year,number_of_pages_median,cover_i,key`

  const response = await net.fetch(url)
  const data = await response.json()

  return (data.docs || []).map((doc: any) => ({
    title: doc.title || 'Unknown Title',
    author: doc.author_name?.[0] || 'Unknown Author',
    firstPublishYear: doc.first_publish_year || null,
    pageCount: doc.number_of_pages_median || null,
    coverId: doc.cover_i || null,
    olKey: doc.key || ''
  }))
}

export async function downloadCover(coverId: number): Promise<string | null> {
  const coversDir = join(app.getPath('userData'), 'covers')
  const filePath = join(coversDir, `${coverId}.jpg`)

  if (existsSync(filePath)) return filePath

  if (!existsSync(coversDir)) mkdirSync(coversDir, { recursive: true })

  try {
    const response = await net.fetch(
      `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    )
    if (!response.ok) return null

    const buffer = Buffer.from(await response.arrayBuffer())

    // Open Library returns a 1x1 transparent gif for missing covers
    if (buffer.length < 1000) return null

    writeFileSync(filePath, buffer)
    return filePath
  } catch {
    return null
  }
}
