<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Item } from '../types'
import { messages } from '../i18n/index'
import { aliases } from '../composables/useSearch'
import ItemTable from './ItemTable.vue'

defineProps<{ open: boolean }>()

const emit = defineEmits<{
  close: []
  selectItem: [name: string, route: string]
}>()

const { tm, t } = useI18n()

// ─── Static metadata (mirrors page meta arrays) ────────────────────────────

const sweetenersMeta: { type: string; score: number }[] = [
  { type: 'artificial', score: 1 },
  { type: 'natural',    score: 9 },
  { type: 'natural',    score: 7 },
  { type: 'amino',      score: 7 },
  { type: 'natural',    score: 6 },
  { type: 'natural',    score: 6 },
  { type: 'natural',    score: 5 },
  { type: 'alcohol',    score: 4 },
  { type: 'artificial', score: 3 },
  { type: 'artificial', score: 2 },
  { type: 'artificial', score: 3 },
  { type: 'artificial', score: 3 },
  { type: 'artificial', score: 3 },
  { type: 'artificial', score: 4 },
  { type: 'artificial', score: 2 },
  { type: 'artificial', score: 2 },
  { type: 'protein',    score: 6 },
  { type: 'flavonoid',  score: 5 },
  { type: 'alcohol',    score: 4 },
  { type: 'alcohol',    score: 4 },
  { type: 'alcohol',    score: 3 },
  { type: 'alcohol',    score: 4 },
]

const preservativesMeta: { type: string; score: number }[] = [
  { type: 'synthetic', score: 2 },
  { type: 'synthetic', score: 3 },
  { type: 'synthetic', score: 2 },
  { type: 'sulfite',   score: 1 },
  { type: 'sulfite',   score: 1 },
  { type: 'nitrite',   score: 1 },
  { type: 'nitrite',   score: 1 },
  { type: 'synthetic', score: 1 },
  { type: 'synthetic', score: 1 },
  { type: 'synthetic', score: 0 },
  { type: 'acid',      score: 4 },
  { type: 'acid',      score: 4 },
  { type: 'acid',      score: 3 },
  { type: 'vitamin',   score: 4 },
  { type: 'plant',     score: 4 },
]

const emulsifiersMeta: { type: string; score: number }[] = [
  { type: 'natural',   score: 4 },
  { type: 'natural',   score: 2 },
  { type: 'synthetic', score: 1 },
  { type: 'synthetic', score: 1 },
  { type: 'seaweed',   score: 1 },
  { type: 'seed',      score: 3 },
  { type: 'seed',      score: 3 },
  { type: 'fermented', score: 2 },
  { type: 'fermented', score: 2 },
  { type: 'seaweed',   score: 4 },
  { type: 'natural',   score: 4 },
  { type: 'modified',  score: 2 },
  { type: 'seaweed',   score: 3 },
  { type: 'seaweed',   score: 2 },
]

// ─── All items assembled ────────────────────────────────────────────────────

type AnyItem = Item & { route: string; enName: string; catKey: string; catIdx: number }

const allItems = computed<AnyItem[]>(() => {
  const cats = [
    { key: 'sweeteners',    route: '/sweeteners',    meta: sweetenersMeta },
    { key: 'preservatives', route: '/preservatives', meta: preservativesMeta },
    { key: 'emulsifiers',   route: '/emulsifiers',   meta: emulsifiersMeta },
  ]
  const result: AnyItem[] = []
  for (const cat of cats) {
    const enItems = (messages.en as any)[cat.key].items as Array<Record<string, any>>
    const localItems = tm(`${cat.key}.items`) as Array<any>
    for (let i = 0; i < enItems.length; i++) {
      result.push({
        ...localItems[i],
        type: cat.meta[i]!.type,
        score: cat.meta[i]!.score,
        route: cat.route,
        enName: enItems[i]!.name as string,
        catKey: cat.key,
        catIdx: i,
      } as AnyItem)
    }
  }
  return result
})

const mergedTypeLabels = computed<Record<string, string>>(() => ({
  ...(tm('sweeteners.typeLabels') as object),
  ...(tm('preservatives.typeLabels') as object),
  ...(tm('emulsifiers.typeLabels') as object),
}))

// ─── State ──────────────────────────────────────────────────────────────────

const rawText = ref('')
const results = ref<AnyItem[]>([])
const scanned = ref(false)
const selectedItem = ref<AnyItem | null>(null)

const scoreColor = (score: number): string => {
  if (score >= 8) return 'text-emerald-400'
  if (score >= 6) return 'text-yellow-400/80'
  if (score >= 4) return 'text-orange-400/80'
  return 'text-red-400/80'
}

// ─── Matching logic ─────────────────────────────────────────────────────────

function cleanToken(raw: string): string {
  return raw
    .replace(/\([^)]*\)/g, ' ')              // strip parentheticals: "(0,4%)"
    .replace(/[^\w\säöüÄÖÜß-]/gi, ' ')       // strip punctuation, keep hyphens
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function matchToken(token: string): AnyItem | null {
  if (token.length < 2) return null
  let best: { item: AnyItem; score: number } | null = null

  for (const item of allItems.value) {
    const name = item.enName.toLowerCase()
    let score = -1

    if (name === token) score = 100
    else if (name.startsWith(token)) score = 80
    else if (name.includes(token)) score = 60
    else {
      const itemAliases = aliases[item.catKey]?.[item.catIdx] ?? []
      const q = token
      if (itemAliases.some(a => {
        const al = a.toLowerCase()
        return al === q || al.includes(q) || q.includes(al)
      })) {
        score = 55
      }
    }

    if (score > (best?.score ?? -1)) best = { item, score }
  }

  return best && best.score >= 55 ? best.item : null
}

function scan() {
  // Handle hyphenated line breaks before splitting
  const text = rawText.value.replace(/-[ \t]*\n[ \t]*/g, '')
  const tokens = text.split(/[,\n]+/).map(cleanToken).filter(tok => tok.length >= 2)

  const seen = new Set<string>()
  const matched: AnyItem[] = []

  for (const token of tokens) {
    const match = matchToken(token)
    if (match && !seen.has(match.enName)) {
      seen.add(match.enName)
      matched.push(match)
    }
  }

  results.value = matched.sort((a, b) => a.score - b.score)
  scanned.value = true
}

function onSelect(item: AnyItem) {
  selectedItem.value = item
}

function reset() {
  if (selectedItem.value) {
    selectedItem.value = null
  } else {
    scanned.value = false
  }
}

function handleClose() {
  emit('close')
  scanned.value = false
  selectedItem.value = null
}

function handleBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).dataset.backdrop) handleClose()
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
        data-backdrop="1"
        @click="handleBackdropClick"
      >
        <div
          class="w-[80ch] max-w-full bg-[#111] border border-white/10 rounded-lg overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-white/10">
            <div>
              <template v-if="selectedItem">
                <h3 class="text-white font-semibold text-base tracking-tight">{{ selectedItem.name }}</h3>
                <p class="text-white/40 text-xs mt-0.5">{{ selectedItem.description }}</p>
              </template>
              <template v-else>
                <h3 class="text-white font-semibold text-base tracking-tight">{{ t('scan.title') }}</h3>
                <p v-if="scanned" class="text-white/30 text-xs mt-0.5">{{ results.length }} {{ t('scan.found') }}</p>
                <p v-else class="text-white/30 text-xs mt-0.5">{{ t('scan.subtitle') }}</p>
              </template>
            </div>
            <div class="flex items-center gap-3 shrink-0 ml-4">
              <span v-if="selectedItem" class="text-xl font-semibold" :class="scoreColor(selectedItem.score)">
                {{ selectedItem.score }}/10
              </span>
              <button
                v-if="scanned"
                @click="reset"
                class="text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 px-3 py-1 rounded cursor-pointer"
              >← {{ t('scan.back') }}</button>
              <button
                @click="handleClose"
                class="text-white/30 hover:text-white/70 transition-colors text-lg leading-none cursor-pointer"
                :aria-label="t('ui.close')"
              >✕</button>
            </div>
          </div>

          <!-- Input view -->
          <div v-if="!scanned" class="px-6 py-5 space-y-4">
            <textarea
              v-model="rawText"
              :placeholder="t('scan.placeholder')"
              class="w-full h-40 bg-transparent border border-white/10 rounded px-3 py-2 text-white/70 text-xs focus:outline-none focus:border-white/30 placeholder-white/20 resize-none font-mono"
            />
            <button
              @click="scan"
              class="text-xs border border-white/20 px-4 py-1.5 rounded text-white/60 hover:text-white hover:border-white/40 transition-colors cursor-pointer"
            >{{ t('scan.scanBtn') }}</button>
          </div>

          <!-- Detail view -->
          <div v-else-if="selectedItem" class="px-6 py-5 space-y-5 text-xs max-h-[60vh] overflow-y-auto">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-white/30 uppercase tracking-widest text-[10px] mb-2">{{ t('ui.positives') }}</div>
                <ul class="space-y-1.5">
                  <li v-for="p in selectedItem.positives" :key="p" class="flex items-start gap-1.5 text-white/60">
                    <span class="text-emerald-500/60 shrink-0 mt-0.5">+</span>{{ p }}
                  </li>
                </ul>
              </div>
              <div>
                <div class="text-white/30 uppercase tracking-widest text-[10px] mb-2">{{ t('ui.negatives') }}</div>
                <ul class="space-y-1.5">
                  <li v-for="n in selectedItem.negatives" :key="n" class="flex items-start gap-1.5 text-white/60">
                    <span class="text-red-500/60 shrink-0 mt-0.5">−</span>{{ n }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="border border-blue-500/20 rounded p-4 bg-blue-500/6">
              <div class="text-blue-400/60 uppercase tracking-widest text-[10px] mb-2">{{ t('ui.consumption') }}</div>
              <p class="text-blue-100/70 leading-relaxed">{{ selectedItem.consumption }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-white/30 uppercase tracking-widest text-[10px] mb-2">{{ t('ui.warning') }}</div>
                <p class="text-orange-300/60 leading-relaxed">{{ selectedItem.warning }}</p>
              </div>
              <div>
                <div class="text-white/30 uppercase tracking-widest text-[10px] mb-2">{{ t('ui.notes') }}</div>
                <p class="text-white/40 leading-relaxed">{{ selectedItem.notes }}</p>
              </div>
            </div>
          </div>

          <!-- Results view -->
          <div v-else class="px-6 py-5 max-h-[60vh] overflow-y-auto">
            <p v-if="results.length === 0" class="text-white/30 text-xs">{{ t('scan.noResults') }}</p>
            <ItemTable
              v-else
              :items="results"
              :type-labels="mergedTypeLabels"
              @select="onSelect"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
