<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Item } from '../types'
import AppLayout from '../components/AppLayout.vue'
import PrinciplesList from '../components/PrinciplesList.vue'
import ItemTable from '../components/ItemTable.vue'
import ItemModal from '../components/ItemModal.vue'

// ─── Types ─────────────────────────────────────────────────────────────────

type SweetenerType = 'natural' | 'artificial' | 'amino' | 'alcohol' | 'protein' | 'flavonoid'

interface Sweetener extends Item {
  type: SweetenerType
}

// ─── i18n ──────────────────────────────────────────────────────────────────

const { t, tm } = useI18n()

// ─── Static (non-translated) per-item metadata ─────────────────────────────

const meta: { type: SweetenerType; score: number }[] = [
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
  // new entries
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

// ─── Reactive data from translations ───────────────────────────────────────

const principles = computed<string[]>(() => tm('sweeteners.principles') as string[])

const typeLabels = computed<Record<string, string>>(() => tm('sweeteners.typeLabels') as Record<string, string>)

const sweeteners = computed<Sweetener[]>(() => {
  const raw = tm('sweeteners.items') as Array<Omit<Sweetener, 'type' | 'score'>>
  return raw.map((item, i) => ({ ...item, ...meta[i]! }) as Sweetener).sort((a, b) => b.score - a.score)
})

// ─── State ─────────────────────────────────────────────────────────────────

const selected = ref<Sweetener | null>(null)
</script>

<template>
  <AppLayout :title="t('sweeteners.title')" github-url="https://github.com/wds/wiki">

    <section>
      <p class="text-white/30 text-xs">{{ t('ui.clickHint') }}</p>
    </section>

    <PrinciplesList
      :principles="principles"
      :heading="t('ui.principles')"
    />

    <ItemTable
      :items="sweeteners"
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
