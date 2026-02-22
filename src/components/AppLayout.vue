<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocale } from '../composables/useLocale'

const props = defineProps<{
  title: string
  footerText?: string
}>()

const { t } = useI18n()
const { current, toggle } = useLocale()

const copied = ref(false)

async function share() {
  const url = window.location.href
  if (navigator.share) {
    await navigator.share({ title: props.title, url })
  } else {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0d] text-[#e8e8e8] font-mono text-sm">

    <nav class="border-b border-white/10 px-6 py-4">
      <div class="max-w-4xl mx-auto px-6 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <RouterLink to="/" aria-label="Home">
            <img src="/logo.svg" width="20" height="20" alt="Logo" />
          </RouterLink>
          <RouterLink to="/sweeteners" class="text-white/40 hover:text-white/80 transition-colors text-xs" active-class="text-white">{{ t('nav.sweeteners') }}</RouterLink>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="toggle"
            class="text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 px-3 py-1 rounded cursor-pointer"
          >{{ current === 'en' ? 'DE' : 'EN' }}</button>
          <button @click="share" class="text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 px-3 py-1 rounded cursor-pointer">
            {{ copied ? t('nav.copied') : t('nav.share') }}
          </button>
          <a
            href="https://github.com/web-dev-sam/health"
            target="_blank"
            rel="noopener noreferrer"
            class="text-white/40 hover:text-white/70 transition-colors p-1"
            :aria-label="t('nav.github')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>
    </nav>

    <main class="max-w-4xl mx-auto px-6 py-10 space-y-12">
      <slot />
    </main>

    <footer class="border-t border-white/10 px-6 py-6 text-center space-y-1">
      <p class="text-white/20 text-xs">{{ footerText ?? title }}</p>
      <p class="text-white/30 text-xs">{{ t('footer.disclaimer') }}</p>
    </footer>

  </div>
</template>
