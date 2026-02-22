import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePreferredLanguages, useLocalStorage } from '@vueuse/core'

type SupportedLocale = 'en' | 'de'
const SUPPORTED: SupportedLocale[] = ['en', 'de']
const STORAGE_KEY = 'wiki:locale'

function detectLocale(languages: readonly string[]): SupportedLocale {
  for (const lang of languages) {
    const code = lang.split('-')[0] as SupportedLocale
    if (SUPPORTED.includes(code)) return code
  }
  return 'en'
}

export function useLocale() {
  const { locale } = useI18n()
  const preferredLanguages = usePreferredLanguages()

  // Initialise from localStorage; fall back to browser preference
  const stored = useLocalStorage<SupportedLocale>(STORAGE_KEY, null as unknown as SupportedLocale)

  // On first use (null stored), detect from browser
  if (!stored.value || !SUPPORTED.includes(stored.value)) {
    stored.value = detectLocale(preferredLanguages.value)
  }

  // Keep i18n locale in sync with storage
  locale.value = stored.value

  const current = computed(() => stored.value as SupportedLocale)

  function setLocale(lang: SupportedLocale) {
    stored.value = lang
    locale.value = lang
  }

  function toggle() {
    setLocale(current.value === 'en' ? 'de' : 'en')
  }

  return { current, setLocale, toggle }
}
