<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import { useSearch, type SearchResult } from '../composables/useSearch'
import ScanModal from './ScanModal.vue'

const props = defineProps<{
  title: string
  footerText?: string
}>()

const { t } = useI18n()
const { current, toggle } = useLocale()
const router = useRouter()
const { search } = useSearch()

const copied = ref(false)
const searchQuery = ref('')
const showDropdown = ref(false)
const showScan = ref(false)
const searchResults = computed(() => search(searchQuery.value))

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

function onInput() {
  showDropdown.value = searchQuery.value.trim().length > 0
}

function selectResult(result: SearchResult) {
  router.push({ path: result.route, query: { item: result.name } })
  searchQuery.value = ''
  showDropdown.value = false
}

function hideDropdown() {
  setTimeout(() => { showDropdown.value = false }, 100)
}

function clearSearch() {
  searchQuery.value = ''
  showDropdown.value = false
}

function selectFirst() {
  if (searchResults.value.length > 0) selectResult(searchResults.value[0]!)
}

function onScanSelect(name: string, route: string) {
  router.push({ path: route, query: { item: name } })
}
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0d] text-[#e8e8e8] font-mono text-sm">

    <nav class="border-b border-white/10 px-6 py-4">
      <div class="max-w-4xl mx-auto px-6 flex items-center gap-4">
        <div class="flex items-center gap-6 flex-1">
          <RouterLink to="/" aria-label="Home">
            <img src="/logo.svg" width="20" height="20" alt="Logo" />
          </RouterLink>
          <RouterLink to="/sweeteners" class="text-white/40 hover:text-white/80 transition-colors text-xs" active-class="text-white">{{ t('nav.sweeteners') }}</RouterLink>
          <RouterLink to="/preservatives" class="text-white/40 hover:text-white/80 transition-colors text-xs" active-class="text-white">{{ t('nav.preservatives') }}</RouterLink>
          <RouterLink to="/emulsifiers" class="text-white/40 hover:text-white/80 transition-colors text-xs" active-class="text-white">{{ t('nav.emulsifiers') }}</RouterLink>
        </div>

        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('nav.searchPlaceholder')"
            class="bg-transparent border border-white/10 text-white/70 text-xs px-3 py-1 rounded focus:outline-none focus:border-white/30 w-36 focus:w-52 transition-[width] placeholder-white/20"
            @input="onInput"
            @focus="showDropdown = searchQuery.trim().length > 0"
            @blur="hideDropdown"
            @keydown.escape="clearSearch"
            @keydown.enter="selectFirst"
          />
          <div
            v-if="showDropdown && searchResults.length > 0"
            class="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded shadow-lg w-64 z-50 overflow-hidden"
          >
            <button
              v-for="result in searchResults"
              :key="result.route + result.name"
              class="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-center justify-between gap-3"
              @mousedown.prevent="selectResult(result)"
            >
              <div class="min-w-0">
                <div class="text-white/80 text-xs truncate">{{ result.displayName }}</div>
                <div class="text-white/30 text-[10px] mt-0.5">{{ result.category }}</div>
              </div>
              <span
                class="text-xs font-semibold shrink-0"
                :class="result.itemScore >= 8 ? 'text-emerald-400' : result.itemScore >= 6 ? 'text-yellow-400/80' : result.itemScore >= 4 ? 'text-orange-400/80' : 'text-red-400/80'"
              >{{ result.itemScore }}/10</span>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="showScan = true"
            class="text-white/40 hover:text-white/70 transition-colors border border-white/10 px-3 p-1 cursor-pointer"
            :aria-label="t('nav.scan')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M3 12h12M3 18h8"/>
              <circle cx="19" cy="17" r="3"/>
              <path d="m21.5 19.5 1.5 1.5"/>
            </svg>
          </button>
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

    <ScanModal
      :open="showScan"
      @close="showScan = false"
      @select-item="onScanSelect"
    />

  </div>
</template>
