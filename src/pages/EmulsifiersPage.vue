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

// ─── Reactive data from translations ───────────────────────────────────────

const principles = computed<string[]>(() => tm('emulsifiers.principles') as string[])

const typeLabels = computed<Record<string, string>>(() => tm('emulsifiers.typeLabels') as Record<string, string>)

const emulsifiers = computed<Emulsifier[]>(() => {
  const enItems = (messages.en as any).emulsifiers.items as Emulsifier[]
  const localItems = tm('emulsifiers.items') as Array<Omit<Emulsifier, 'type' | 'score'>>
  return localItems.map((item, i) => ({ ...item, type: enItems[i]!.type, score: enItems[i]!.score })).sort((a, b) => b.score - a.score)
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
