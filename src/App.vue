<template>
  <component :is="layoutComponent">
    <!-- O conteúdo das páginas entra no slot do layout -->
    <router-view v-slot="{ Component, route }">
      <v-fade-transition mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </v-fade-transition>
    </router-view>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// importe os layouts
import DefaultLayout from './layouts/DefaultLayout.vue'
import AuthLayout from './layouts/AuthLayout.vue'

const route = useRoute()

// meta.layout: 'default' (padrão) | 'auth' (login)
const layoutName = computed(() => (route.meta?.layout as string) || 'default')

const layoutComponent = computed(() => {
  return layoutName.value === 'auth' ? AuthLayout : DefaultLayout
})
</script>
