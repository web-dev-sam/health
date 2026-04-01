<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BaseLayout from '../components/BaseLayout.vue'
import IconPlay from '~icons/iconamoon/player-play-thin'
import IconSquare from '~icons/iconamoon/player-stop-thin'
import IconInfo from '~icons/iconamoon/information-circle-thin'
import IconSettings from '~icons/iconamoon/settings-thin'
import IconScreenFull from '~icons/iconamoon/screen-full-thin'
import IconScreenNormal from '~icons/iconamoon/screen-normal-thin'

const DURATIONS = [1, 2, 4, 8, 12, 20]

const selectedMinutes = ref(4)
const intervalMs = ref(5500)
const isRunning = ref(false)
const elapsed = ref(0)
const showInfo = ref(false)
const showSettings = ref(false)
const isFullscreen = ref(false)

let timer: ReturnType<typeof setInterval> | null = null
let wakeLock: WakeLockSentinel | null = null

const cycleDuration = computed(() => (intervalMs.value * 2) / 1000)
const totalSeconds = computed(() => selectedMinutes.value * 60)
const remaining = computed(() => Math.max(0, totalSeconds.value - elapsed.value))
const phase = computed(() =>
  elapsed.value % cycleDuration.value < intervalMs.value / 1000 ? 'Inhale' : 'Exhale',
)

const remainingFormatted = computed(() => {
  const s = Math.ceil(remaining.value)
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
})

function start() {
  elapsed.value = 0
  isRunning.value = true
  timer = setInterval(() => {
    elapsed.value = +(elapsed.value + 0.1).toFixed(1)
    if (elapsed.value >= totalSeconds.value) stop()
  }, 100)
}

function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  isRunning.value = false
  elapsed.value = 0
}

function openInfo() {
  stop()
  showSettings.value = false
  showInfo.value = true
}

function closeInfo() {
  showInfo.value = false
}

function openSettings() {
  stop()
  showInfo.value = false
  showSettings.value = true
}

function closeSettings() {
  showSettings.value = false
}

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
    } catch {
      // Wake lock not available or denied — silently ignore
    }
  }
}

function releaseWakeLock() {
  wakeLock?.release()
  wakeLock = null
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen()
    await requestWakeLock()
  } else {
    await document.exitFullscreen()
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
  if (!document.fullscreenElement) {
    releaseWakeLock()
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  stop()
  releaseWakeLock()
})
</script>

<template>
  <BaseLayout>
    <template #nav>
      <span class="text-white/20 text-xs leading-6">/ rfb</span>
    </template>

    <!-- Info view -->
    <main v-if="showInfo" class="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div class="w-full max-w-md space-y-4">
        <p class="text-white/70 text-sm font-medium">What is Resonance Frequency Breathing?</p>
        <div class="space-y-3 text-xs text-white/50 leading-relaxed">
          <p>
            Resonance frequency breathing (RFB) is a technique where you breathe at your body's
            natural resonance frequency — typically around 5–6 breaths per minute, or roughly 5.5
            seconds per inhale and exhale.
          </p>
          <p>
            At this rate, your breath, heart rate, and blood pressure oscillate in sync — a state
            called <span class="text-white/70">cardiovascular resonance</span>. This maximises heart
            rate variability (HRV), a key marker of nervous system health.
          </p>
          <p class="text-white/30 border-t border-white/10 pt-3">
            Benefits shown in research include reduced anxiety and stress, improved focus and
            emotional regulation, better sleep quality, and enhanced recovery from exertion.
          </p>
        </div>
        <button
          class="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer pt-2"
          @click="closeInfo"
        >
          Back
        </button>
      </div>
    </main>

    <!-- Settings view -->
    <main
      v-else-if="showSettings"
      class="flex-1 flex flex-col items-center justify-center px-6 py-16"
    >
      <div class="w-full max-w-md space-y-5">
        <p class="text-white/70 text-sm font-medium">Settings</p>
        <div class="space-y-2">
          <label class="text-xs text-white/40">Breathing interval (ms)</label>
          <input
            v-model.number="intervalMs"
            type="number"
            min="1000"
            max="15000"
            step="100"
            class="w-full bg-transparent border border-white/15 rounded px-3 py-2 text-xs text-white/70 focus:border-white/30 focus:outline-none tabular-nums"
          />
          <p class="text-xs text-white/25">
            {{ (intervalMs / 1000).toFixed(1) }}s inhale · {{ (intervalMs / 1000).toFixed(1) }}s
            exhale · {{ (intervalMs / 500).toFixed(1) }} breaths/min
          </p>
          <div class="flex gap-2 pt-1">
            <button
              v-for="ms in [4000, 4500, 5000, 5500, 6000]"
              :key="ms"
              class="text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer"
              :class="
                intervalMs === ms
                  ? 'border-white/30 text-white/70'
                  : 'border-white/10 text-white/25 hover:border-white/20 hover:text-white/45'
              "
              @click="intervalMs = ms"
            >
              {{ ms / 1000 }}s
            </button>
          </div>
        </div>
        <button
          class="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer pt-2"
          @click="closeSettings"
        >
          Back
        </button>
      </div>
    </main>

    <!-- Breathing view -->
    <main
      v-else
      class="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-12 px-6 py-8 sm:py-16"
    >
      <!-- Circle visualization -->
      <div class="relative" style="width: min(80vmin, 520px); height: min(80vmin, 520px)">
        <!-- Static outer ring: max inhale size -->
        <div class="absolute inset-0 rounded-full border border-white/40" />
        <!-- Static inner ring: min exhale size -->
        <div
          class="absolute rounded-full border border-white/20"
          style="width: 15%; height: 15%; top: 50%; left: 50%; transform: translate(-50%, -50%)"
        />
        <!-- Animated breathing circle -->
        <div
          class="breathing-circle absolute inset-0 rounded-full"
          :class="{ running: isRunning }"
          :style="{ '--cycle': `${cycleDuration}s` }"
        />
      </div>

      <!-- Phase / time + duration picker grouped -->
      <div class="flex flex-col items-center gap-3">
        <div class="h-10 flex flex-col items-center justify-center gap-1.5">
          <Transition name="fade" mode="out-in">
            <p
              v-if="isRunning"
              :key="phase"
              class="text-white/50 text-xs tracking-[0.2em] uppercase"
            >
              {{ phase }}
            </p>
          </Transition>
          <p v-if="isRunning" class="text-white/20 text-xs tabular-nums">
            {{ remainingFormatted }}
          </p>
        </div>
        <div class="flex gap-2" :class="{ invisible: isRunning }">
          <button
            v-for="d in DURATIONS"
            :key="d"
            class="text-xs px-3 py-1.5 rounded border transition-colors cursor-pointer"
            :class="
              selectedMinutes === d
                ? 'border-white/30 text-white/70'
                : 'border-white/10 text-white/25 hover:border-white/20 hover:text-white/45'
            "
            @click="selectedMinutes = d"
          >
            {{ d }}m
          </button>
        </div>
      </div>

      <!-- Play / Stop + flanking buttons -->
      <div class="flex items-center gap-4">
        <!-- Left side: info + settings -->
        <div class="flex items-center gap-2" :class="{ invisible: isRunning }">
          <button
            class="text-white/20 hover:text-white/50 transition-colors cursor-pointer"
            aria-label="About resonance frequency breathing"
            @click="openInfo"
          >
            <IconInfo style="width: 28px; height: 28px" />
          </button>
          <button
            class="text-white/20 hover:text-white/50 transition-colors cursor-pointer"
            aria-label="Settings"
            @click="openSettings"
          >
            <IconSettings style="width: 28px; height: 28px" />
          </button>
        </div>

        <!-- Center: play / stop -->
        <button
          class="text-white/30 hover:text-white/60 transition-colors cursor-pointer"
          :aria-label="isRunning ? 'Stop session' : 'Start session'"
          @click="isRunning ? stop() : start()"
        >
          <component :is="isRunning ? IconSquare : IconPlay" style="width: 52px; height: 52px" />
        </button>

        <!-- Right side: fullscreen -->
        <button
          class="text-white/20 hover:text-white/50 transition-colors cursor-pointer"
          :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
          @click="toggleFullscreen"
        >
          <component
            :is="isFullscreen ? IconScreenNormal : IconScreenFull"
            style="width: 28px; height: 28px"
          />
        </button>
      </div>
    </main>
  </BaseLayout>
</template>

<style scoped>
.breathing-circle {
  border: 1px solid rgba(255, 255, 255, 0.4);
  transform: scale(0.15);
  transform-origin: center;
}

.breathing-circle.running {
  animation: breathe var(--cycle, 11s) linear infinite;
}

@keyframes breathe {
  0% {
    transform: scale(0.15);
    animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
  }
  50% {
    transform: scale(1);
    animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
  }
  100% {
    transform: scale(0.15);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:global(:fullscreen nav),
:global(:-webkit-full-screen nav) {
  display: none;
}
</style>
