<template>
  <div class="relative h-full w-full">
    <div
      v-if="mapError"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-white/90 px-6 text-center text-sm font-semibold text-rose-600"
    >
      {{ mapError }}
      <p class="text-xs font-normal text-slate-500">
        Проверьте интернет
      </p>
    </div>
    <div
      v-else-if="loading"
      class="absolute inset-0 z-20 flex items-center justify-center bg-white/80 text-sm font-semibold text-indigo-600"
    >
      Загружаем карту...
    </div>
    <div ref="mapRoot" class="h-full w-full" />
    <div
      v-if="showEmptyState"
      class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-center text-sm font-semibold text-indigo-600"
    >
      Выберите устройство, чтобы увидеть его на карте
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDeviceStore } from '../stores/deviceStore'
import { useYandexMapLoader } from '../composables/useYandexMap'
import type { Device } from '../data/mockData'

type MapController = {
  map: any
  objects: any
  signature: string
  sync: (devices: Device[]) => void
  destroy: () => void
}

const deviceStore = useDeviceStore()

const mapRoot = ref<HTMLDivElement | null>(null)
const mapError = ref<string | null>(null)
const ymapsApi = ref<any>(null)
const controller = ref<MapController | null>(null)

const selectedDevices = computed(() => deviceStore.selectedDevicesForMap)
const loading = computed(() => deviceStore.loading)
const mode = computed(() => deviceStore.mode)
const showEmptyState = computed(
  () => !loading.value && !mapError.value && !selectedDevices.value.length,
)

const buildBalloon = (device: Device) => `
  <div class="space-y-1 text-sm text-slate-700">
    <h3 class="text-base font-semibold text-slate-900">${device.name}</h3>
    <p>ID: <strong>${device.id}</strong></p>
    <p>Каналов: ${device.channels}</p>
    <p>Время: ${device.timestamp}</p>
    <p>Координаты: ${device.lat.toFixed(4)}, ${device.lon.toFixed(4)}</p>
  </div>
`

const pickPreset = (device: Device) =>
  mode.value === 'archive'
    ? 'islands#blueCircleDotIcon'
    : device.alarm
        ? 'islands#redCircleDotIcon'
        : 'islands#blueCircleDotIcon'

const createController = (ymaps: any, container: HTMLElement): MapController => {
  const map = new ymaps.Map(container, {
    center: [55.751244, 37.618423],
    zoom: 5,
    controls: ['zoomControl'],
  })
  const objects = new ymaps.GeoObjectCollection()
  map.geoObjects.add(objects)

  const setViewport = (devices: Device[]) => {
    if (!devices.length) {
      map.setCenter([55.751244, 37.618423], 4)
      return
    }
    if (devices.length === 1) {
      const [device] = devices
      map.setCenter([device.lat, device.lon], 9)
      return
    }
    const points = devices.map((device) => [device.lat, device.lon])
    const bounds = ymaps.util.bounds.fromPoints(points)
    map.setBounds(bounds, { checkZoomRange: true, duration: 300 })
  }

  return {
    map,
    objects,
    signature: '',
    sync(devices: Device[]) {
      const ordered = [...devices].sort((a, b) => a.id - b.id)
      const signature = ordered
        .map((device) => `${device.id}-${device.lat}-${device.lon}-${device.alarm}`)
        .join('|')
      if (signature === this.signature) {
        console.log('[map] пропускаю sync, данные те же')
        return
      }
      this.signature = signature
      objects.removeAll()
      ordered.forEach((device) => {
        const marker = new ymaps.Placemark(
          [device.lat, device.lon],
          {
            balloonContent: buildBalloon(device),
            hintContent: device.name,
          },
          {
            preset: pickPreset(device),
          },
        )
        objects.add(marker)
      })
      // чуть кривовато, но работает ¯\_(ツ)_/¯
      setViewport(ordered)
    },
    destroy() {
      console.log('[map] destroy controller')
      objects.removeAll()
      map.geoObjects.remove(objects)
      map.destroy()
    },
  }
}

const syncMap = () => {
  if (!controller.value || mapError.value) {
    return
  }
  console.log('[map] sync', selectedDevices.value.length)
  controller.value.sync(selectedDevices.value)
}

const initMap = async () => {
  if (!mapRoot.value) {
    return
  }
  try {
    ymapsApi.value = await useYandexMapLoader()
    controller.value = createController(ymapsApi.value, mapRoot.value)
    mapError.value = null
    syncMap()
  } catch (error) {
    controller.value = null
    mapError.value =
      error instanceof Error ? error.message : 'Не удалось загрузить Яндекс.Карты'
  }
}

watch(selectedDevices, () => syncMap(), { deep: true })
watch(mode, () => syncMap())

onMounted(() => {
  initMap()
})

onBeforeUnmount(() => {
  controller.value?.destroy()
  controller.value = null
})
</script>

