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

const SEARCH_FIELDS = 'title,author_name,first_publish_year,number_of_pages_median,cover_i,key'

function mapDocs(docs: any[]): SearchResult[] {
  return docs.map((doc: any) => ({
    title: doc.title || 'Unknown Title',
    author: doc.author_name?.[0] || 'Unknown Author',
    firstPublishYear: doc.first_publish_year || null,
    pageCount: doc.number_of_pages_median || null,
    coverId: doc.cover_i || null,
    olKey: doc.key || ''
  }))
}

export async function searchBooks(query: string, offset = 0): Promise<SearchResult[]> {
  const PAGE_SIZE = 10
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${PAGE_SIZE}&offset=${offset}&fields=${SEARCH_FIELDS}`

  const response = await net.fetch(url, { signal: AbortSignal.timeout(6000) })
  const data = await response.json()

  let results = mapDocs(data.docs || [])

  // Fallback: retry with title= parameter if broad search returned nothing (first page only)
  if (results.length === 0 && offset === 0) {
    const titleUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=${PAGE_SIZE}&fields=${SEARCH_FIELDS}`
    const titleResponse = await net.fetch(titleUrl, { signal: AbortSignal.timeout(6000) })
    const titleData = await titleResponse.json()
    results = mapDocs(titleData.docs || [])
  }

  return results
}

function cleanSummary(raw: string): string {
  let text = raw

  // Remove everything from "Preceded by" / "Followed by" onward (cross-reference metadata)
  text = text.replace(/\s*(Preceded|Followed) by:[\s\S]*$/i, '')

  // Remove source references like ([Source][3])
  text = text.replace(/\(\[?Source\]?(?:\[\d+\])?\)/gi, '')

  // Remove markdown reference-style link definitions: [1]: https://...
  text = text.replace(/^\s*\[\d+\]:.*$/gm, '')

  // Convert markdown links [text][ref] and [text](url) to just text
  text = text.replace(/\[([^\]]*)\](?:\[[^\]]*\]|\([^)]*\))/g, '$1')

  // Strip markdown bold/italic markers
  text = text.replace(/\*{1,3}/g, '')

  // Collapse multiple newlines / whitespace
  text = text.replace(/\n{3,}/g, '\n\n').trim()

  return text
}

export async function fetchSummary(olKey: string): Promise<string | null> {
  if (!olKey) return null
  try {
    const response = await net.fetch(`https://openlibrary.org${olKey}.json`, {
      signal: AbortSignal.timeout(8000)
    })
    if (!response.ok) return null
    const data = await response.json()
    const desc = data.description
    if (!desc) return null
    const raw = typeof desc === 'string' ? desc : desc.value || null
    return raw ? cleanSummary(raw) : null
  } catch {
    return null
  }
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
