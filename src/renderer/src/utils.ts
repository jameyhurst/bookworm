/** DJB2-style hash of a title → hue angle for fallback cover gradients */
export function titleHue(title: string): number {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

/** Strip leading articles (EN/FR/ES/IT/PT) for sort comparison */
export function stripArticle(t: string): string {
  return t
    .replace(/^(the|a|an|le|la|les|un|une|el|las|los|una|il|lo|gli|i|uno|o|os|as|um|uma)\s+/i, '')
    .replace(/^l'/i, '')
}
