<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppLayout from '../components/AppLayout.vue'

const { t } = useI18n()
</script>

<template>
  <AppLayout :title="t('home.title')">
    <div class="flex flex-col items-center text-center gap-10 py-16">
      <img src="/logo.svg" width="48" height="48" alt="Logo" class="opacity-80" />

      <div class="space-y-3 max-w-xl">
        <h1 class="text-lg font-semibold tracking-tight text-white">{{ t('home.title') }}</h1>
        <p class="text-white/50 leading-relaxed">{{ t('home.description') }}</p>
      </div>

      <div class="w-full max-w-xl space-y-2">
        <p class="text-white/20 text-xs uppercase tracking-widest mb-4">{{ t('home.guides') }}</p>
        <RouterLink
          to="/sweeteners"
          class="flex items-center justify-between border border-white/10 px-5 py-3 rounded hover:border-white/30 hover:bg-white/5 transition-all group"
        >
          <div class="text-left">
            <div class="text-white/80 group-hover:text-white transition-colors">{{ t('nav.sweeteners') }}</div>
            <div class="text-white/30 text-xs mt-0.5">{{ t('home.sweetenersBlurb') }}</div>
          </div>
          <span class="text-white/20 group-hover:text-white/50 transition-colors">→</span>
        </RouterLink>
      </div>
    </div>
  </AppLayout>
</template>
