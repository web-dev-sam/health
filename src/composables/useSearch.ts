import { useI18n } from 'vue-i18n'
import { messages } from '../i18n/index'

export interface SearchResult {
  name: string        // English name (used as URL param)
  displayName: string // Current locale name (shown in dropdown)
  category: string    // Locale nav label
  route: '/sweeteners' | '/preservatives' | '/emulsifiers'
}

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim()
  const t = target.toLowerCase()
  if (!q) return -1
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 60
  // fuzzy: all query chars appear in order in target
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  if (qi === q.length) return Math.max(1, 40 - (t.length - q.length))
  return -1
}

export function useSearch() {
  const { tm, t } = useI18n()

  function search(query: string): SearchResult[] {
    if (!query.trim()) return []

    const categories = [
      { key: 'sweeteners',    route: '/sweeteners'    as const },
      { key: 'preservatives', route: '/preservatives' as const },
      { key: 'emulsifiers',   route: '/emulsifiers'   as const },
    ]

    const results: (SearchResult & { score: number })[] = []

    for (const cat of categories) {
      const enItems = (messages.en as any)[cat.key].items as Array<Record<string, unknown>>
      const localItems = tm(`${cat.key}.items`) as Array<{ name: string }>
      for (let i = 0; i < enItems.length; i++) {
        const item = enItems[i]!
        const enName = item.name as string
        const nameScore = fuzzyScore(query, enName)
        // Full-text substring match across all fields, capped at 20 so name matches always rank higher
        const fullText = Object.values(item).flat().join(' ').toLowerCase()
        const fullScore = nameScore >= 0 ? -1 : fullText.includes(query.toLowerCase().trim()) ? 20 : -1
        const score = nameScore >= 0 ? nameScore : fullScore
        if (score >= 0) {
          results.push({
            name: enName,
            displayName: localItems[i]?.name ?? enName,
            category: t(`nav.${cat.key}`),
            route: cat.route,
            score,
          })
        }
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ score, ...r }) => r)
  }

  return { search }
}
