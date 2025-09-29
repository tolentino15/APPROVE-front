<template>
  <v-app>
    <!-- Topbar: Barra superior fixa com logo e avatar do usuário -->
    <v-app-bar height="80" flat color="#2a2a2a" density="comfortable" class="text-white">
      <!-- Logo da empresa, carregada da pasta public -->
      <template #prepend>
        <div class="d-flex align-center">
          <v-img src="/Logo.png" alt="Logo" width="180" height="44" contain eager class="mr-2" />
        </div>
      </template>
      <v-spacer />
      <!-- Avatar e nome do usuário -->
      <div class="d-flex align-center mr-2">
        <v-avatar size="32" class="mr-2">
          <v-img :src="avatarUrl" alt="avatar" />
        </v-avatar>
        <span class="font-weight-semibold mr-1">Júlia Mosso</span>
        <v-icon size="18">mdi-chevron-down</v-icon>
      </div>
    </v-app-bar>
    h
    <!-- Sidebar: Navegação lateral com ícones e páginas -->
    <v-navigation-drawer
      v-model="drawer"
      permanent
      rail
      expand-on-hover
      color="#262626"
      class="elevation-0"
    >
      <!-- Ícone do menu no topo da sidebar -->
      <template #prepend>
        <div class="d-flex flex-column align-center py-4">
          <v-icon size="32" color="white">mdi-menu</v-icon>
        </div>
      </template>
      <v-divider class="my-2"></v-divider>
      <!-- Lista de páginas do sistema -->
      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          title="Dashboard"
          :active="true"
          style="background: #00c896; color: #111; font-weight: bold; border-radius: 8px"
          @click="goToDashboard"
        />
        <v-list-item
          prepend-icon="mdi-clipboard-text-outline"
          title="Jobs"
          @click="goToBoardAdmin"
        />
        <v-list-item
          prepend-icon="mdi-calendar-month"
          title="Calendário"
          @click="goToCalendarAdmin"
        />
        <v-list-item
          prepend-icon="mdi-account-outline"
          title="Clientes"
          @click="goToCadastroCliente"
        />
      </v-list>
    </v-navigation-drawer>
    <!-- Main Content: Conteúdo principal da página -->
    <v-main>
      <v-container fluid class="pa-5 bg-outer">
        <v-row>
          <v-col cols="12">
            <!-- CTA TOP -->
            <div class="d-flex align-center justify-space-between mb-2" style="min-height: 56px">
              <div class="text-h5 font-weight-black" style="color: #222">
                Seja Bem-Vindo(a), Júlia.
              </div>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                class="text-none font-weight-bold rounded-lg"
                style="height: 40px"
                @click="goToCadastroJob"
              >
                Criar novo Job
              </v-btn>
            </div>

            <!-- KPIs -->
            <v-row class="mt-4" dense>
              <v-col v-for="k in kpis" :key="k.title" cols="12" sm="6" md="3">
                <v-card class="rounded-lg elevation-1 kpi-card">
                  <v-card-text>
                    <div class="kpi-icon mb-2">
                      <v-icon size="22" :icon="k.icon" />
                    </div>
                    <div class="text-body-2 text-medium-emphasis">{{ k.title }}</div>
                    <div class="text-h5 font-weight-black">{{ k.value }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- BIG ACTIONS -->
            <div
              class="d-flex justify-center align-center"
              style="gap: 32px; margin-top: 40px; margin-bottom: 40px"
            >
              <v-btn
                color="primary"
                height="64"
                style="flex: 1; min-width: 140px; font-size: 1.15rem; padding: 0 32px"
                class="text-none font-weight-black rounded-lg elevation-1 mx-1"
                @click="goToCalendarAdmin"
                >CALENDÁRIO</v-btn
              >
              <v-btn
                color="primary"
                height="64"
                style="flex: 1; min-width: 140px; font-size: 1.15rem; padding: 0 32px"
                class="text-none font-weight-black rounded-lg elevation-1 mx-1"
                @click="goToBoardAdmin"
                >QUADRO</v-btn
              >
              <v-btn
                color="primary"
                height="64"
                style="flex: 1; min-width: 140px; font-size: 1.15rem; padding: 0 32px"
                class="text-none font-weight-black rounded-lg elevation-1 mx-1"
              >
                CONFIGURAÇÕES
              </v-btn>
            </div>

            <!-- CLIENTES -->
            <v-card
              class="mt-4 rounded-xl elevation-1"
              style="display: flex; flex-direction: column"
            >
              <v-card-text class="pb-1" style="padding-bottom: 8px">
                <div class="d-flex align-center justify-space-between">
                  <div class="text-h6 font-weight-black">Clientes</div>
                  <div class="d-flex align-center" style="gap: 12px">
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-plus"
                      class="text-none font-weight-bold rounded-lg"
                      style="height: 40px"
                      size="small"
                      @click="goToCadastroCliente"
                      >Criar novo Cliente</v-btn
                    >
                    <v-text-field
                      v-model="search"
                      class="clients-search"
                      density="compact"
                      label="Buscar"
                      prepend-inner-icon="mdi-magnify"
                      variant="solo-filled"
                      flat
                      hide-details
                      single-line
                      style="
                        height: 40px;
                        min-width: 320px;
                        max-width: 100%;
                        border-radius: 8px;
                        background: #fff;
                        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
                      "
                    />
                  </div>
                </div>
              </v-card-text>

              <v-divider class="mx-4" style="margin-top: 0; margin-bottom: 8px"></v-divider>

              <v-card-text style="flex: 1; overflow-y: auto">
                <div class="clients-grid">
                  <v-sheet
                    v-for="cliente in filteredClients"
                    :key="cliente.id"
                    class="client-card rounded-lg elevation-1 d-flex flex-column align-center pa-3"
                    color="#fafafa"
                  >
                    <v-sheet
                      class="logo-chip rounded-lg elevation-1 d-grid place-center"
                      color="white"
                    >
                      <v-icon size="38">mdi-fuel</v-icon>
                    </v-sheet>
                    <div class="text-caption text-medium-emphasis mt-2 font-weight-semibold">
                      {{ cliente.nome }}
                    </div>
                  </v-sheet>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const drawer = ref(true)
const search = ref('')
const avatarUrl = 'https://avatars.githubusercontent.com/u/9919?s=64&v=4'

const kpis = [
  { title: 'Jobs Pendentes', value: 30, icon: 'mdi-clock-time-four-outline' },
  { title: 'Pedidos de Revisão', value: 10, icon: 'mdi-pencil-outline' },
  { title: 'Jobs Aprovados', value: 300, icon: 'mdi-check-decagram-outline' },
  { title: 'Total Realizados', value: 500, icon: 'mdi-chart-areaspline' },
]

// Escopo futuro: clientes como objetos
const clients = ref([
  { id: 1, nome: 'Posto Shell' },
  { id: 2, nome: 'Posto Ipiranga' },
  { id: 3, nome: 'Posto BR' },
  // ...outros clientes
])

// Filtro de busca por nome
const filteredClients = computed(() => {
  if (!search.value) return clients.value
  return clients.value.filter((c) => c.nome.toLowerCase().includes(search.value.toLowerCase()))
})

function goToDashboard() {
  router.push({ name: 'HomeAdmin' })
}
function goToCadastroCliente() {
  router.push({ name: 'CadastroCliente' })
}
function goToCadastroJob() {
  router.push({ name: 'CadastroJob' })
}
function goToCalendarAdmin() {
  router.push({ name: 'CalendarAdmin' })
}
function goToBoardAdmin() {
  router.push({ name: 'BoardAdmin' })
}
</script>

<style scoped>
.v-application {
  background: #d4d4d4 !important;
}
.bg-outer {
  background: #d4d4d4;
  min-height: calc(100vh - 56px);
}
.bg-inner {
  background: #d4d4d4;
  box-shadow: none;
}
.top-search :deep(.v-field--variant-solo) {
  border-radius: 9999px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  max-width: 420px;
}
.kpi-card {
  max-width: 300px;
  margin: 0 auto;
}
.kpi-card .kpi-icon {
  width: 30px;
  height: 36px;
  border-radius: 10px;
  background: #eaf2ff;
  color: rgb(var(--v-theme-primary));
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.clients-search :deep(.v-field--variant-solo) {
  border-radius: 9999px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  width: 360px;
  max-width: 360px;
}
.clients-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 18px 22px;
}
.logo-chip {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
}
.client-card {
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, 0.03),
    0 4px 14px rgba(0, 0, 0, 0.08);
}
@media (max-width: 1400px) {
  .clients-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
@media (max-width: 1180px) {
  .clients-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .clients-search :deep(.v-field--variant-solo) {
    width: 100%;
    max-width: 100%;
  }
}
</style>
