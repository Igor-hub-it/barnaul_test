<template>
  <div class="h-screen w-full bg-gradient-to-br from-slate-50 to-indigo-50">
    <div class="grid h-full grid-cols-1 overflow-hidden lg:grid-cols-[420px_1fr]">
      <aside class="h-full overflow-y-auto border-r border-slate-200 bg-white/95 backdrop-blur-md">
        <SidebarPanel />
      </aside>
      <section class="relative">
        <MapView />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import SidebarPanel from './components/SidebarPanel.vue'
import MapView from './components/MapView.vue'
import { useDeviceStore } from './stores/deviceStore'

const deviceStore = useDeviceStore()

onMounted(() => {
  // запускаю фид сразу как только отрендерились, не откладываю
  deviceStore.initFeed()
})
</script>

