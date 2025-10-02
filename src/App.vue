<template>
  <v-app>
    <!-- TOP BAR -->
    <v-app-bar height="80" flat color="#2a2a2a" density="comfortable" class="text-white">
      <template #prepend>
        <div class="d-flex align-center">
          <v-img src="/Logo.png" alt="Logo" width="180" height="44" contain eager class="mr-2" />
        </div>
      </template>

      <v-spacer />
      <div class="d-flex align-center mr-2">
        <v-avatar size="32" class="mr-2">
          <v-img :src="avatarUrl" alt="avatar" />
        </v-avatar>
        <span class="font-weight-semibold mr-1">Júlia Mosso</span>
      </div>
    </v-app-bar>

    <!-- NAV DRAWER -->
    <v-navigation-drawer
      v-model="drawer"
      permanent
      rail
      expand-on-hover
      color="#262626"
      class="elevation-0"
    >
      <template #prepend>
        <div class="d-flex flex-column align-center py-4">
          <v-icon size="32" color="white">mdi-menu</v-icon>
        </div>
      </template>

      <v-divider class="my-2"></v-divider>

      <!-- Ativação automática via Vue Router -->
      <v-list ref="navListRef" density="compact" nav class="nav-list">
        <!-- fundo animado -->
        <div
          class="nav-highlight"
          :style="{ transform: `translateY(${hlY}px)`, height: `${hlH}px` }"
        />

        <!-- wrapper para capturar a ref de cada item -->
        <div
          v-for="(item, i) in navItems"
          :key="item.title"
          class="nav-item-wrap"
          :ref="(el) => (itemRefs[i] = el as HTMLDivElement | null)"
        >
          <v-list-item
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.to"
            link
            exact
            :active="isActive(item)"
            :class="{ 'nav-active-text': isActive(item) }"
            @click="go(item.to)"
          />
        </div>
      </v-list>
    </v-navigation-drawer>

    <!-- CONTEÚDO DAS ROTAS -->
    <v-main>
      <router-view v-slot="{ Component }">
        <v-fade-transition mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </v-fade-transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const drawer = ref(true)
const avatarUrl = 'https://avatars.githubusercontent.com/u/9919?s=64&v=4'

type NavItem = { title: string; icon: string; to: { name: string } }

const navItems: NavItem[] = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: { name: 'HomeAdmin' } },
  { title: 'Quadro', icon: 'mdi-clipboard-text-outline', to: { name: 'BoardAdmin' } },
  { title: 'Calendário', icon: 'mdi-calendar-month', to: { name: 'CalendarAdmin' } },
  { title: 'Clientes', icon: 'mdi-account-outline', to: { name: 'CadastroCliente' } },
  { title: 'Jobs', icon: 'mdi-file-multiple', to: { name: 'CadastroJob' } },
]

// se preferir por path, troque para: route.path === '/minha-rota'
function isActive(item: NavItem) {
  return route.name === item.to.name
}

function go(to: { name: string }) {
  router.push(to)
}

// === Highlight animado do item ativo ===
import { ref as vueRef, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'

const navListRef = vueRef<HTMLElement | null>(null)
const itemRefs = vueRef<Array<HTMLDivElement | null>>([])
const hlY = vueRef(0)
const hlH = vueRef(0)

function updateHighlight() {
  nextTick(() => {
    const idx = navItems.findIndex(isActive)
    const el = itemRefs.value[idx]
    const list = navListRef.value
    if (!el || !list) return
    hlY.value = el.offsetTop
    hlH.value = el.offsetHeight
  })
}

watch(() => route.name, updateHighlight, { immediate: true })
onMounted(() => {
  updateHighlight()
  window.addEventListener('resize', updateHighlight)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHighlight)
})
</script>

<style scoped>
/* container preparado para highlight absoluto */
.nav-list {
  position: relative;
  padding: 8px 6px;
}

/* “pill” que desliza para o item ativo */
.nav-highlight {
  position: absolute;
  left: 6px;
  right: 6px;
  top: 0;
  background: #00c896;
  border-radius: 8px;
  z-index: 0;
  transition:
    transform 0.22s cubic-bezier(0.2, 0, 0, 1),
    height 0.18s ease;
}

/* garantir que os itens fiquem acima do pill */
.nav-item-wrap :deep(.v-list-item) {
  position: relative;
  z-index: 1;
  transition: color 0.18s ease;
  color: rgba(255, 255, 255, 0.92);
}
.nav-item-wrap :deep(.v-list-item.nav-active-text) {
  color: #111 !important;
  font-weight: 700;
}
</style>
