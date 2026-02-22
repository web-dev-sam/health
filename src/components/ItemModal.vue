<script setup lang="ts">
import type { Item } from '../types'
import { useI18n } from 'vue-i18n'

defineProps<{
  item: Item | null
  typeLabels: Record<string, string>
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

function handleBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).dataset.backdrop) emit('close')
}

const scoreColor = (score: number): string => {
  if (score >= 8) return 'text-emerald-400'
  if (score >= 6) return 'text-yellow-400/80'
  if (score >= 4) return 'text-orange-400/80'
  return 'text-red-400/80'
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
        v-if="item"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
        data-backdrop="1"
        @click="handleBackdropClick"
      >
        <div
          class="w-[70ch] max-w-full bg-[#111] border border-white/10 rounded-lg overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-white/10">
            <div>
              <h3 class="text-white font-semibold text-base tracking-tight">{{ item.name }}</h3>
              <p class="text-white/40 text-xs mt-0.5">{{ item.description }}</p>
            </div>
            <div class="flex items-center gap-4 shrink-0 ml-4">
              <span class="text-xl font-semibold" :class="scoreColor(item.score)">
                {{ item.score ?? 0 }}/10
              </span>
              <button
                @click="emit('close')"
                class="text-white/30 hover:text-white/70 transition-colors text-lg leading-none cursor-pointer"
                :aria-label="t('ui.close')"
              >✕</button>
            </div>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-5 text-xs">

            <!-- Positives / Negatives -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-white/30 uppercase tracking-widest text-[10px] mb-2">{{ t('ui.positives') }}</div>
                <ul class="space-y-1.5">
                  <li
                    v-for="p in item.positives"
                    :key="p"
                    class="flex items-start gap-1.5 text-white/60"
                  >
                    <span class="text-emerald-500/60 shrink-0 mt-0.5">+</span>{{ p }}
                  </li>
                </ul>
              </div>
              <div>
                <div class="text-white/30 uppercase tracking-widest text-[10px] mb-2">{{ t('ui.negatives') }}</div>
                <ul class="space-y-1.5">
                  <li
                    v-for="n in item.negatives"
                    :key="n"
                    class="flex items-start gap-1.5 text-white/60"
                  >
                    <span class="text-red-500/60 shrink-0 mt-0.5">−</span>{{ n }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Consumption -->
            <div class="border border-blue-500/20 rounded p-4 bg-blue-500/6">
              <div class="text-blue-400/60 uppercase tracking-widest text-[10px] mb-2">{{ t('ui.consumption') }}</div>
              <p class="text-blue-100/70 leading-relaxed">{{ item.consumption }}</p>
            </div>

            <!-- Warning / Notes -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-white/30 uppercase tracking-widest text-[10px] mb-2">{{ t('ui.warning') }}</div>
                <p class="text-orange-300/60 leading-relaxed">{{ item.warning }}</p>
              </div>
              <div>
                <div class="text-white/30 uppercase tracking-widest text-[10px] mb-2">{{ t('ui.notes') }}</div>
                <p class="text-white/40 leading-relaxed">{{ item.notes }}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
