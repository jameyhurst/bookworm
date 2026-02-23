import { net } from 'electron'
import { Book } from './database'

interface Recommendation {
  title: string
  author: string
  reason: string
}

export async function getRecommendations(
  books: Book[],
  apiKey: string,
  userPrompt?: string
): Promise<Recommendation[]> {
  const finishedBooks = books.filter((b) => b.status === 'finished')

  if (finishedBooks.length === 0) {
    throw new Error('You need at least one finished book to get recommendations.')
  }

  const bookSummaries = finishedBooks
    .map((b) => {
      const parts = [`"${b.title}" by ${b.author}`]
      if (b.dateRead) {
        const [y, m] = b.dateRead.split('-')
        const monthName = new Date(Number(y), Number(m) - 1).toLocaleString('en', { month: 'short' })
        parts.push(`Read: ${monthName} ${y}`)
      }
      if (b.rating) parts.push(`Rating: ${b.rating}/5`)
      if (b.tags.length > 0) parts.push(`Mood: ${b.tags.join(', ')}`)
      if (b.review) parts.push(`Review: ${b.review}`)
      return parts.join(' | ')
    })
    .join('\n')

  const prompt = `Based on the following books I've read and enjoyed, recommend exactly 5 books I might like. Consider my ratings, moods, reviews, and reading timeline to understand my taste. Books without a date are older reads added retroactively.

My finished books:
${bookSummaries}

Respond with ONLY a JSON array of 5 objects, each with "title", "author", and "reason" fields. The reason should be 1-2 sentences explaining why I'd enjoy it, referencing specific books or patterns from my reading history. Do not recommend books I've already read. Do not include any text outside the JSON array.${userPrompt ? `\nAdditional preference: ${userPrompt}` : ''}`

  const response = await net.fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    if (response.status === 401) {
      throw new Error('Invalid API key. Check your Claude API key in Settings.')
    }
    throw new Error(`Claude API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text || ''

  // Extract JSON array from response
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) {
    throw new Error('Could not parse recommendations from Claude response.')
  }

  return JSON.parse(match[0])
}
