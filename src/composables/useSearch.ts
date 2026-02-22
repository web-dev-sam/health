import { useI18n } from 'vue-i18n'
import { messages } from '../i18n/index'

export interface SearchResult {
  name: string        // English name (used as URL param)
  displayName: string // Current locale name (shown in dropdown)
  category: string    // Locale nav label
  route: '/sweeteners' | '/preservatives' | '/emulsifiers'
  itemScore: number   // Health score 0–10
}

const itemScores: Record<string, number[]> = {
  sweeteners:    [1, 9, 7, 7, 6, 6, 5, 4, 3, 2, 3, 3, 3, 4, 2, 2, 6, 5, 4, 4, 3, 4],
  preservatives: [2, 3, 2, 1, 1, 1, 1, 1, 1, 0, 4, 4, 3, 4, 4],
  emulsifiers:   [4, 2, 1, 1, 1, 3, 3, 2, 2, 4, 4, 2, 3, 2],
}

// Search-only aliases — not translated, not shown in UI.
// Indexed by category key, then by item index (matching the meta arrays in each page).
export const aliases: Record<string, string[][]> = {
  sweeteners: [
    // 0  Refined Sugar
    ['sugar', 'sucrose', 'saccharose', 'glucose', 'fructose', 'dextrose', 'maltose',
     'corn syrup', 'high fructose corn syrup', 'HFCS', 'invert sugar', 'cane sugar',
     'brown sugar', 'raw sugar', 'turbinado', 'molasses', 'agave', 'agavendicksaft',
     'zucker', 'haushaltszucker', 'rübenzucker', 'rohrzucker'],
    // 1  Dates (whole)
    ['dates', 'date', 'dattel', 'datteln'],
    // 2  Raw Honey
    ['honey', 'raw honey', 'honig', 'rohhonig'],
    // 3  Glycine
    ['glycine', 'glycin', 'amino acid sweetener'],
    // 4  Processed Date Sugar
    ['date sugar', 'dattelzucker'],
    // 5  Monk Fruit
    ['monk fruit', 'luo han guo', 'mogroside', 'lo han kuo', 'mönchsfrucht'],
    // 6  Stevia
    ['stevia', 'steviol glycoside', 'stevioside', 'rebaudioside', 'E960', 'steviaextrakt'],
    // 7  Sugar Alcohols
    ['xylitol', 'erythritol', 'maltitol', 'sorbitol', 'mannitol', 'polyol',
     'sugar alcohol', 'zuckeralkohol', 'erythrit', 'xylit', 'maltit', 'sorbit'],
    // 8  Sucralose
    ['sucralose', 'splenda', 'E955', 'trichlorogalactosucrose'],
    // 9  Aspartame
    ['aspartame', 'aspartam', 'E951', 'nutrasweet', 'equal', 'canderel'],
    // 10 Acesulfame K
    ['acesulfame', 'acesulfam', 'ace-k', 'acesulfame k', 'acesulfam k', 'E950', 'sunett'],
    // 11 Aspartame–Acesulfame Salt
    ['E962', 'aspartame acesulfame', 'twinsweet'],
    // 12 Saccharin
    ['saccharin', 'sacharin', 'E954', 'sweet n low'],
    // 13 Cyclamate
    ['cyclamate', 'cyclamin', 'E952', 'sodium cyclamate'],
    // 14 Neotame
    ['neotame', 'E961'],
    // 15 Advantame
    ['advantame', 'E969'],
    // 16 Thaumatin
    ['thaumatin', 'thaumatin', 'E957', 'talin'],
    // 17 Neohesperidin DC
    ['neohesperidin', 'E959', 'nhdc'],
    // 18 Mannitol
    ['mannitol', 'mannit', 'E421'],
    // 19 Isomalt
    ['isomalt', 'E953', 'palatinit'],
    // 20 Lactitol
    ['lactitol', 'E966'],
    // 21 Polyglycitol Syrup
    ['polyglycitol', 'E964', 'hydrogenated starch hydrolysate', 'HSH'],
  ],
  preservatives: [
    // 0  Sodium Benzoate
    ['sodium benzoate', 'natriumbenzoat', 'E211', 'benzoic acid', 'benzoesäure', 'E210'],
    // 1  Potassium Sorbate
    ['potassium sorbate', 'kaliumsorbat', 'E202', 'sorbic acid', 'sorbinsäure', 'E200'],
    // 2  Calcium Propionate
    ['calcium propionate', 'calciumpropionat', 'E282', 'propionic acid', 'propionsäure', 'E280'],
    // 3  Sulfur Dioxide
    ['sulfur dioxide', 'sulphur dioxide', 'schwefeldioxid', 'E220', 'SO2'],
    // 4  Sodium Metabisulfite
    ['sodium metabisulfite', 'natriummetabisulfit', 'E223', 'sodium bisulfite', 'E222'],
    // 5  Sodium Nitrite
    ['sodium nitrite', 'natriumnitrit', 'E250'],
    // 6  Sodium Nitrate
    ['sodium nitrate', 'natriumnitrat', 'E251'],
    // 7  BHA
    ['BHA', 'butylated hydroxyanisole', 'E320'],
    // 8  BHT
    ['BHT', 'butylated hydroxytoluene', 'E321'],
    // 9  Ethoxyquin
    ['ethoxyquin', 'ethoxyquin', 'E324'],
    // 10 Acetic Acid
    ['acetic acid', 'essigsäure', 'E260', 'vinegar', 'essig', 'acetate'],
    // 11 Lactic Acid
    ['lactic acid', 'milchsäure', 'E270', 'lactate'],
    // 12 Citric Acid
    ['citric acid', 'zitronensäure', 'citronensäure', 'E330', 'citrate',
     'sodium citrate', 'natriumcitrat', 'E331', 'potassium citrate', 'kaliumcitrat', 'E332',
     'calcium citrate', 'E333', 'säuerungsmittel', 'säureregulator'],
    // 13 Ascorbic Acid
    ['ascorbic acid', 'ascorbinsäure', 'E300', 'vitamin c', 'sodium ascorbate', 'E301'],
    // 14 Rosemary Extract
    ['rosemary extract', 'rosmarinextrakt', 'E392', 'rosemary', 'rosmarin'],
  ],
  emulsifiers: [
    // 0  Lecithins
    ['lecithin', 'lecithins', 'E322', 'soy lecithin', 'sunflower lecithin',
     'sojalecithin', 'sonnenblumenlecithin'],
    // 1  Mono- & Diglycerides
    ['mono diglycerides', 'monoglycerides', 'diglycerides', 'E471',
     'mono- und diglyceride', 'monoglycerid', 'diglycerid'],
    // 2  Polysorbate 80
    ['polysorbate 80', 'polysorbat 80', 'E433', 'tween 80'],
    // 3  Carboxymethylcellulose
    ['carboxymethylcellulose', 'CMC', 'E466', 'cellulose gum'],
    // 4  Carrageenan
    ['carrageenan', 'carrageen', 'E407'],
    // 5  Locust Bean Gum
    ['locust bean gum', 'johannisbrotkernmehl', 'E410', 'carob bean gum'],
    // 6  Guar Gum
    ['guar gum', 'guarkernmehl', 'E412', 'guar'],
    // 7  Xanthan Gum
    ['xanthan gum', 'xanthan', 'E415'],
    // 8  Gellan Gum
    ['gellan gum', 'gellan', 'E418'],
    // 9  Agar
    ['agar', 'agar agar', 'E406'],
    // 10 Pectin
    ['pectin', 'pektin', 'E440'],
    // 11 Modified Starches
    ['modified starch', 'modified starches', 'modifizierte stärke', 'E1404', 'E1422',
     'E1442', 'E1450', 'acetylated starch', 'oxidized starch'],
    // 12 Sodium Alginate
    ['sodium alginate', 'natriumalginat', 'E401', 'alginate'],
    // 13 Propylene Glycol Alginate
    ['propylene glycol alginate', 'E405', 'PGA'],
  ],
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

    const q = query.toLowerCase().trim()

    const categories = [
      { key: 'sweeteners',    route: '/sweeteners'    as const },
      { key: 'preservatives', route: '/preservatives' as const },
      { key: 'emulsifiers',   route: '/emulsifiers'   as const },
    ]

    const results: (SearchResult & { score: number })[] = []

    for (const cat of categories) {
      const enItems = (messages.en as any)[cat.key].items as Array<Record<string, unknown>>
      const localItems = tm(`${cat.key}.items`) as Array<{ name: string }>
      const catAliases = aliases[cat.key]!

      for (let i = 0; i < enItems.length; i++) {
        const item = enItems[i]!
        const enName = item.name as string

        // 1. Name score (fuzzy)
        const nameScore = fuzzyScore(query, enName)

        // 2. Alias score — substring match only, same tier as name contains (60)
        const itemAliases = catAliases[i] ?? []
        const aliasScore = nameScore >= 0 ? -1
          : itemAliases.some(a => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()) || a.toLowerCase() === q)
            ? 55
            : -1

        // 3. Full-text fallback across all item fields, lowest tier (20)
        const fullText = Object.values(item).flat().join(' ').toLowerCase()
        const fullScore = (nameScore >= 0 || aliasScore >= 0) ? -1
          : fullText.includes(q) ? 20
          : -1

        const score = nameScore >= 0 ? nameScore : aliasScore >= 0 ? aliasScore : fullScore
        if (score >= 0) {
          results.push({
            name: enName,
            displayName: localItems[i]?.name ?? enName,
            category: t(`nav.${cat.key}`),
            route: cat.route,
            itemScore: itemScores[cat.key]![i] ?? 0,
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
