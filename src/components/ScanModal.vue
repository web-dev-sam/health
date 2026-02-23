<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Item } from '../types'
import { messages } from '../i18n/index'
import { aliases } from '../composables/useSearch'
import ItemTable from './ItemTable.vue'

const props = defineProps<{
  open: boolean
  initialText?: string
}>()

const emit = defineEmits<{
  close: []
  selectItem: [name: string, route: string]
}>()

const { tm, t } = useI18n()

// ─── All items assembled ────────────────────────────────────────────────────

type AnyItem = Item & { route: string; enName: string; catKey: string; catIdx: number }

const allItems = computed<AnyItem[]>(() => {
  const cats = [
    { key: 'sweeteners',    route: '/sweeteners'    },
    { key: 'preservatives', route: '/preservatives' },
    { key: 'emulsifiers',   route: '/emulsifiers'   },
  ]
  const result: AnyItem[] = []
  for (const cat of cats) {
    const enItems = (messages.en as any)[cat.key].items as Array<Record<string, any>>
    const localItems = tm(`${cat.key}.items`) as Array<any>
    for (let i = 0; i < enItems.length; i++) {
      result.push({
        ...localItems[i],
        type: enItems[i]!.type as string,
        score: enItems[i]!.score as number,
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

// Pre-fill textarea when opened with initialText
watch(() => props.open, (isOpen) => {
  if (isOpen && props.initialText) {
    rawText.value = props.initialText
  }
  if (!isOpen) {
    // Clear hash when modal closes
    if (window.location.hash.startsWith('#scan=')) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }
})

// Keep hash in sync as the user types
watch(rawText, (text) => {
  if (!props.open) return
  if (text.trim()) {
    history.replaceState(null, '', window.location.pathname + window.location.search + '#scan=' + encodeURIComponent(text))
  } else {
    if (window.location.hash.startsWith('#scan=')) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }
})

const scanCopied = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const ocrLoading = ref(false)
const ocrError = ref(false)

async function onImageCapture(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (fileInput.value) fileInput.value.value = ''
  if (!file) return
  ocrLoading.value = true
  ocrError.value = false
  try {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('eng+deu')
    const { data: { text } } = await worker.recognize(file)
    await worker.terminate()
    rawText.value = text
  } catch {
    ocrError.value = true
    setTimeout(() => { ocrError.value = false }, 2500)
  } finally {
    ocrLoading.value = false
  }
}

async function shareScan() {
  const hash = '#scan=' + encodeURIComponent(rawText.value)
  const url = window.location.origin + window.location.pathname + hash
  if (navigator.share) {
    await navigator.share({ url })
  } else {
    await navigator.clipboard.writeText(url)
    scanCopied.value = true
    setTimeout(() => { scanCopied.value = false }, 1500)
  }
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

  // Extract parenthetical contents as extra candidate tokens (e.g. "Acid (Citric Acid)" → also try "Citric Acid")
  const parentheticals: string[] = []
  for (const m of text.matchAll(/\(([^)]+)\)/g)) {
    parentheticals.push(m[1]!)
  }

  const rawTokens = text.split(/[,\n.;]+/)
  const tokens = [...rawTokens, ...parentheticals].map(cleanToken).filter(tok => tok.length >= 2)

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
  if (window.location.hash.startsWith('#scan=')) {
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }
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
                {{ selectedItem.score ?? 0 }}/10
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
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              capture="environment"
              class="hidden"
              @change="onImageCapture"
            />
            <div class="flex items-center gap-2">
              <button
                @click="scan"
                class="text-xs border border-white/20 px-4 py-1.5 rounded text-white/60 hover:text-white hover:border-white/40 transition-colors cursor-pointer"
              >{{ t('scan.scanBtn') }}</button>
              <button
                @click="fileInput?.click()"
                :disabled="ocrLoading"
                class="text-xs text-white/30 hover:text-white/60 transition-colors border border-white/10 px-3 py-1.5 rounded cursor-pointer disabled:opacity-40 disabled:cursor-wait"
                :title="t('scan.photo')"
              >
                <span v-if="ocrLoading">{{ t('scan.ocrLoading') }}</span>
                <span v-else-if="ocrError" class="text-red-400/70">{{ t('scan.ocrError') }}</span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
              <button
                v-if="rawText.trim()"
                @click="shareScan"
                class="text-xs text-white/30 hover:text-white/60 transition-colors border border-white/10 px-3 py-1.5 rounded cursor-pointer"
              >{{ scanCopied ? t('nav.copied') : t('nav.share') }}</button>
            </div>
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
