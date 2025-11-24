<template>
  <div class="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm shadow-slate-200/80 transition hover:border-indigo-100">
    <header class="flex items-center gap-3">
      <button
        class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
        @click="toggleCollapse"
        :aria-label="collapseLabel"
      >
        <span :class="collapsed ? 'rotate-0' : 'rotate-90'">⯈</span>
      </button>

      <label class="flex flex-1 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
          :checked="selected"
          :disabled="disabled"
          @change="toggleSelection"
        />
        <div>
          <p class="text-sm font-semibold text-slate-900">
            {{ device.name }}
            <span class="text-xs font-normal text-slate-400">#{{ device.id }}</span>
          </p>
          <p class="text-xs text-slate-400">{{ device.timestamp }}</p>
        </div>
      </label>

      <div v-if="mode === 'online'" class="flex items-center gap-2 text-slate-400">
        <div
          class="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-200 shadow-inner shadow-indigo-100"
          title="Транспорт"
        />
        <div class="flex h-6 items-end gap-1" :title="`Wi-Fi: ${device.wifi}/5`">
          <span
            v-for="(height, idx) in wifiHeights"
            :key="idx"
            class="w-1 rounded-full transition"
            :style="{
              height: `${height}px`,
              background: idx + 1 <= device.wifi ? wifiColor : '#e2e8f0',
            }"
          />
        </div>
        <span
          v-if="device.alarm"
          title="Тревога"
          class="text-lg text-red-500 animate-pulse"
        >
          ▲
        </span>
      </div>

      <div class="relative" ref="menuRef">
        <button
          class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-lg leading-none text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
          @click.stop="toggleMenu"
        >
          ⋮
        </button>
        <ul
          v-if="menuOpen"
          class="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-xl shadow-slate-200/70"
          @click.stop
        >
          <li>
            <button
              class="block w-full px-4 py-2 text-left text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
              @click="edit"
            >
              Редактировать
            </button>
          </li>
          <li>
            <button
              class="block w-full px-4 py-2 text-left text-rose-600 transition hover:bg-rose-50"
              @click="remove"
            >
              Удалить
            </button>
          </li>
        </ul>
      </div>
    </header>

    <div v-show="!collapsed" class="mt-4">
      <CameraGrid
        :channels="device.channels"
        :selected="selectedCameras"
        :disabled="!selected"
        @toggle="toggleCamera"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Device } from '../data/mockData'
import CameraGrid from './CameraGrid.vue'
import { useDeviceStore } from '../stores/deviceStore'

const props = defineProps<{ device: Device }>()

const deviceStore = useDeviceStore()

const wifiColors: Record<number, string> = {
  1: '#ff4d4f',
  2: '#ff934d',
  3: '#ffc53d',
  4: '#95de64',
  5: '#52c41a',
}

const collapsed = computed(() => deviceStore.isDeviceCollapsed(props.device.id))
const selected = computed(() => deviceStore.isDeviceSelected(props.device.id))
const disabled = computed(() => deviceStore.isDeviceDisabled(props.device.id))
const mode = computed(() => deviceStore.mode)
const selectedCameras = computed(() => deviceStore.camerasForDevice(props.device.id))

const wifiColor = computed(() => wifiColors[props.device.wifi])
const wifiHeights = [8, 12, 16, 20, 24]

const toggleSelection = () => {
  console.log('[device-card] переключаю выбор', props.device.id)
  deviceStore.toggleDeviceSelection(props.device.id)
}
const toggleCollapse = () => deviceStore.toggleDeviceCollapse(props.device.id)
const toggleCamera = (camera: number) => deviceStore.toggleCamera(props.device.id, camera)

const collapseLabel = computed(() =>
  collapsed.value ? 'Показать камеры' : 'Скрыть камеры',
)

const edit = () => window.alert(`Редактировать ID: ${props.device.id}`)
const remove = () => {
  const confirmed = window.confirm(`Удалить устройство #${props.device.id}?`)
  if (confirmed) {
    // да, без undo ¯\_(ツ)_/¯
    deviceStore.removeDevice(props.device.id)
  }
}

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const closeMenu = (event: MouseEvent) => {
  const target = event.target as Node
  if (!menuOpen.value) {
    return
  }
  if (menuRef.value?.contains(target)) {
    return
  }
  menuOpen.value = false
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

onMounted(() => document.addEventListener('click', closeMenu))
onBeforeUnmount(() => document.removeEventListener('click', closeMenu))

</script>

