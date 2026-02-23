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

type SweetenerType = 'natural' | 'artificial' | 'amino' | 'alcohol' | 'protein' | 'flavonoid'

interface Sweetener extends Item {
  type: SweetenerType
}

// ─── i18n ──────────────────────────────────────────────────────────────────

const { t, tm } = useI18n()

// ─── Reactive data from translations ───────────────────────────────────────

const principles = computed<string[]>(() => tm('sweeteners.principles') as string[])

const typeLabels = computed<Record<string, string>>(() => tm('sweeteners.typeLabels') as Record<string, string>)

const sweeteners = computed<Sweetener[]>(() => {
  const enItems = (messages.en as any).sweeteners.items as Sweetener[]
  const localItems = tm('sweeteners.items') as Array<Omit<Sweetener, 'type' | 'score'>>
  return localItems.map((item, i) => ({ ...item, type: enItems[i]!.type, score: enItems[i]!.score })).sort((a, b) => b.score - a.score)
})

// ─── State ─────────────────────────────────────────────────────────────────

const selected = ref<Sweetener | null>(null)

// ─── Open modal from search ─────────────────────────────────────────────────

const route = useRoute()
const router = useRouter()

function openItemFromQuery() {
  const itemName = route.query.item as string | undefined
  if (!itemName) return
  const enItems = (messages.en as any).sweeteners.items as Array<{ name: string }>
  const rawIdx = enItems.findIndex((e: { name: string }) => e.name === itemName)
  if (rawIdx === -1) return
  const localItems = tm('sweeteners.items') as Array<{ name: string }>
  const localName = localItems[rawIdx]?.name
  if (!localName) return
  const found = sweeteners.value.find(s => s.name === localName)
  if (found) {
    selected.value = found
    router.replace({ path: route.path, query: {} })
  }
}

onMounted(openItemFromQuery)
watch(() => route.query.item, openItemFromQuery)
</script>

<template>
  <AppLayout :title="t('sweeteners.title')">

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
