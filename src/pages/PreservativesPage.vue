<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { Item } from '../types'
import AppLayout from '../components/AppLayout.vue'
import PrinciplesList from '../components/PrinciplesList.vue'
import ItemTable from '../components/ItemTable.vue'
import ItemModal from '../components/ItemModal.vue'
import { messages } from '../i18n/index'

// ─── Types ─────────────────────────────────────────────────────────────────

type PreservativeType = 'synthetic' | 'acid' | 'plant' | 'vitamin' | 'nitrite' | 'sulfite'

interface Preservative extends Item {
  type: PreservativeType
}

// ─── i18n ──────────────────────────────────────────────────────────────────

const { t, tm } = useI18n()

// ─── Static (non-translated) per-item metadata ─────────────────────────────

const meta: { type: PreservativeType; score: number }[] = [
  { type: 'synthetic', score: 2 }, // Sodium Benzoate E211
  { type: 'synthetic', score: 3 }, // Potassium Sorbate E202
  { type: 'synthetic', score: 2 }, // Calcium Propionate E282
  { type: 'sulfite',   score: 1 }, // Sulfur Dioxide E220
  { type: 'sulfite',   score: 1 }, // Sodium Metabisulfite E223
  { type: 'nitrite',   score: 1 }, // Sodium Nitrite E250
  { type: 'nitrite',   score: 1 }, // Sodium Nitrate E251
  { type: 'synthetic', score: 1 }, // BHA E320
  { type: 'synthetic', score: 1 }, // BHT E321
  { type: 'synthetic', score: 0 }, // Ethoxyquin E324
  { type: 'acid',      score: 4 }, // Acetic Acid E260
  { type: 'acid',      score: 4 }, // Lactic Acid E270
  { type: 'acid',      score: 3 }, // Citric Acid E330
  { type: 'vitamin',   score: 4 }, // Ascorbic Acid E300
  { type: 'plant',     score: 4 }, // Rosemary Extract E392
]

// ─── Reactive data from translations ───────────────────────────────────────

const principles = computed<string[]>(() => tm('preservatives.principles') as string[])

const typeLabels = computed<Record<string, string>>(() => tm('preservatives.typeLabels') as Record<string, string>)

const preservatives = computed<Preservative[]>(() => {
  const raw = tm('preservatives.items') as Array<Omit<Preservative, 'type' | 'score'>>
  return raw.map((item, i) => ({ ...item, ...meta[i]! }) as Preservative).sort((a, b) => b.score - a.score)
})

// ─── State ─────────────────────────────────────────────────────────────────

const selected = ref<Preservative | null>(null)

// ─── Open modal from search ─────────────────────────────────────────────────

const route = useRoute()
const router = useRouter()

function openItemFromQuery() {
  const itemName = route.query.item as string | undefined
  if (!itemName) return
  const enItems = (messages.en as any).preservatives.items as Array<{ name: string }>
  const rawIdx = enItems.findIndex((e: { name: string }) => e.name === itemName)
  if (rawIdx === -1) return
  const localItems = tm('preservatives.items') as Array<{ name: string }>
  const localName = localItems[rawIdx]?.name
  if (!localName) return
  const found = preservatives.value.find(p => p.name === localName)
  if (found) {
    selected.value = found
    router.replace({ path: route.path, query: {} })
  }
}

onMounted(openItemFromQuery)
watch(() => route.query.item, openItemFromQuery)
</script>

<template>
  <AppLayout :title="t('preservatives.title')">

    <section>
      <p class="text-white/30 text-xs">{{ t('preservatives.intro') }}</p>
    </section>

    <PrinciplesList
      :principles="principles"
      :heading="t('ui.principles')"
    />

    <ItemTable
      :items="preservatives"
      :type-labels="typeLabels"
      @select="selected = $event"
    />

    <ItemModal
      :item="selected"
      :type-labels="typeLabels"
      @close="selected = null"
    />

  </AppLayout>
</template>
