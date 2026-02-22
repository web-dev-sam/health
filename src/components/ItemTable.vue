<script setup lang="ts" generic="I extends Item">
import type { Item } from '../types'
import { useI18n } from 'vue-i18n'

defineProps<{
  items: I[]
  typeLabels: Record<string, string>
}>()

const emit = defineEmits<{
  select: [item: I]
}>()

const { t } = useI18n()

const scoreColor = (score: number): string => {
  if (score >= 8) return 'text-emerald-400'
  if (score >= 6) return 'text-yellow-400/80'
  if (score >= 4) return 'text-orange-400/80'
  return 'text-red-400/80'
}
</script>

<template>
  <section>
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="text-white/30 border-b border-white/10">
            <th class="text-left py-2 pr-4 font-normal">{{ t('ui.name') }}</th>
            <th class="text-left py-2 pr-4 font-normal hidden sm:table-cell">{{ t('ui.type') }}</th>
            <th class="text-left py-2 pr-4 font-normal hidden md:table-cell">{{ t('ui.description') }}</th>
            <th class="text-right py-2 font-normal">{{ t('ui.score') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.name"
            class="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer group"
            @click="emit('select', item)"
          >
            <td class="py-3 pr-4 text-white/90 group-hover:text-white transition-colors">
              {{ item.name }}
            </td>
            <td class="py-3 pr-4 text-white/30 hidden sm:table-cell text-[11px]">
              {{ typeLabels[item.type] ?? item.type }}
            </td>
            <td class="py-3 pr-4 text-white/40 hidden md:table-cell max-w-xs truncate">
              {{ item.description }}
            </td>
            <td class="py-3 text-right font-semibold" :class="scoreColor(item.score)">
              {{ item.score }}/10
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
