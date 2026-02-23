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

type EmulsifierType = 'synthetic' | 'natural' | 'fermented' | 'seaweed' | 'seed' | 'modified'

interface Emulsifier extends Item {
  type: EmulsifierType
}

// ─── i18n ──────────────────────────────────────────────────────────────────

const { t, tm } = useI18n()

// ─── Static (non-translated) per-item metadata ─────────────────────────────

const meta: { type: EmulsifierType; score: number }[] = [
  { type: 'natural',   score: 4 }, // Lecithins E322
  { type: 'natural',   score: 2 }, // Mono- & Diglycerides E471
  { type: 'synthetic', score: 1 }, // Polysorbate 80 E433
  { type: 'synthetic', score: 1 }, // Carboxymethylcellulose E466
  { type: 'seaweed',   score: 1 }, // Carrageenan E407
  { type: 'seed',      score: 3 }, // Locust Bean Gum E410
  { type: 'seed',      score: 3 }, // Guar Gum E412
  { type: 'fermented', score: 2 }, // Xanthan Gum E415
  { type: 'fermented', score: 2 }, // Gellan Gum E418
  { type: 'seaweed',   score: 4 }, // Agar E406
  { type: 'natural',   score: 4 }, // Pectin E440
  { type: 'modified',  score: 2 }, // Modified Starches E1404-E1451
  { type: 'seaweed',   score: 3 }, // Sodium Alginate E401
  { type: 'seaweed',   score: 2 }, // Propylene Glycol Alginate E405
  { type: 'natural',   score: 3 }, // Ascorbyl Palmitate E304
  { type: 'synthetic', score: 2 }, // Sodium Phosphate E339
  { type: 'synthetic', score: 2 }, // Potassium Phosphate E340
  { type: 'synthetic', score: 2 }, // Salts of Fatty Acids E470
  { type: 'synthetic', score: 1 }, // Acetic Acid Esters E472a
  { type: 'synthetic', score: 1 }, // Lactic Acid Esters E472b
  { type: 'synthetic', score: 2 }, // Citric Acid Esters E472c
  { type: 'synthetic', score: 2 }, // Tartaric Acid Esters E472d
  { type: 'synthetic', score: 1 }, // DATEM E472e
  { type: 'synthetic', score: 1 }, // Mixed Esters E472f
  { type: 'synthetic', score: 2 }, // Sucrose Esters E473
  { type: 'synthetic', score: 1 }, // Sucroglycerides E474
  { type: 'synthetic', score: 1 }, // Polyglycerol Esters E475
  { type: 'synthetic', score: 0 }, // PGPR E476
  { type: 'synthetic', score: 1 }, // Propylene Glycol Esters E477
]

// ─── Reactive data from translations ───────────────────────────────────────

const principles = computed<string[]>(() => tm('emulsifiers.principles') as string[])

const typeLabels = computed<Record<string, string>>(() => tm('emulsifiers.typeLabels') as Record<string, string>)

const emulsifiers = computed<Emulsifier[]>(() => {
  const raw = tm('emulsifiers.items') as Array<Omit<Emulsifier, 'type' | 'score'>>
  return raw.map((item, i) => ({ ...item, ...meta[i]! }) as Emulsifier).sort((a, b) => b.score - a.score)
})

// ─── State ─────────────────────────────────────────────────────────────────

const selected = ref<Emulsifier | null>(null)

// ─── Open modal from search ─────────────────────────────────────────────────

const route = useRoute()
const router = useRouter()

function openItemFromQuery() {
  const itemName = route.query.item as string | undefined
  if (!itemName) return
  const enItems = (messages.en as any).emulsifiers.items as Array<{ name: string }>
  const rawIdx = enItems.findIndex((e: { name: string }) => e.name === itemName)
  if (rawIdx === -1) return
  const localItems = tm('emulsifiers.items') as Array<{ name: string }>
  const localName = localItems[rawIdx]?.name
  if (!localName) return
  const found = emulsifiers.value.find(em => em.name === localName)
  if (found) {
    selected.value = found
    router.replace({ path: route.path, query: {} })
  }
}

onMounted(openItemFromQuery)
watch(() => route.query.item, openItemFromQuery)
</script>

<template>
  <AppLayout :title="t('emulsifiers.title')">

    <section>
      <p class="text-white/30 text-xs">{{ t('emulsifiers.intro') }}</p>
    </section>

    <PrinciplesList
      :principles="principles"
      :heading="t('ui.principles')"
    />

    <ItemTable
      :items="emulsifiers"
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
