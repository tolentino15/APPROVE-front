<template>
  <v-app>
    <!-- APP BAR -->
    <v-app-bar height="56" flat color="#2a2a2a" density="comfortable" class="text-white">
      <template #prepend>
        <div class="d-flex align-center">
          <v-icon size="26" class="mr-1">mdi-checkbox-marked-circle-outline</v-icon>
          <span class="font-weight-bold mr-1">Approv</span>
          <span class="text-green-accent-4 font-weight-black">v</span>
        </div>
      </template>

      <v-spacer />

      <v-spacer />

      <div class="d-flex align-center mr-2">
        <v-avatar size="32" class="mr-2">
          <v-img :src="avatarUrl" alt="avatar" />
        </v-avatar>
        <span class="font-weight-semibold mr-1">Júlia Mosso</span>
        <v-icon size="18">mdi-chevron-down</v-icon>
      </div>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-5 bg-outer">
        <v-navigation-drawer
          expand-on-hover
          permanent
          rail
          color="#262626"
          class="elevation-0"
          v-model="drawer"
        >
          <template #prepend>
            <div class="d-flex flex-column align-center py-4">
              <v-icon size="32" color="white">mdi-menu</v-icon>
            </div>
          </template>
          <v-divider class="my-2"></v-divider>
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

        <v-row>
          <v-col cols="12">
            <!-- CTA TOP -->
            <div class="d-flex justify-end">
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                class="text-none font-weight-bold rounded-lg"
                size="small"
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
            <v-row class="mt-2" dense>
              <v-col cols="12" md="4">
                <v-btn
                  block
                  color="primary"
                  height="56"
                  class="text-none font-weight-black rounded-lg elevation-1"
                  @click="goToCalendarAdmin"
                >
                  CALENDÁRIO
                </v-btn>
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  block
                  color="primary"
                  height="56"
                  class="text-none font-weight-black rounded-lg elevation-1"
                  @click="goToBoardAdmin"
                >
                  QUADRO
                </v-btn>
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  block
                  color="primary"
                  height="56"
                  class="text-none font-weight-black rounded-lg elevation-1"
                >
                  CONFIGURAÇÕES
                </v-btn>
              </v-col>
            </v-row>

            <!-- CLIENTES -->
            <v-card class="mt-4 rounded-xl elevation-1">
              <v-card-text class="pb-1">
                <div class="d-flex align-center justify-space-between">
                  <div class="text-h6 font-weight-black">Clientes</div>

                  <div class="d-flex align-center">
                    <v-text-field
                      class="clients-search mr-3"
                      variant="solo"
                      flat
                      hide-details
                      density="comfortable"
                      prepend-inner-icon="mdi-magnify"
                      placeholder="Buscar"
                    />
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-plus"
                      class="text-none font-weight-bold rounded-lg"
                      size="small"
                      @click="goToCadastroCliente"
                    >
                      Criar novo Cliente
                    </v-btn>
                  </div>
                </div>
              </v-card-text>

              <v-divider class="mx-4"></v-divider>

              <!-- Grade de clientes (usa v-row, mas com look de grid) -->
              <v-card-text>
                <div class="clients-grid">
                  <v-sheet
                    v-for="(c, i) in clients"
                    :key="i"
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
                      {{ c }}
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
function goToDashboard() {
  router.push({ name: 'HomeAdmin' })
}
import { useRouter } from 'vue-router'

const router = useRouter()
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

import { ref } from 'vue'
const drawer = ref(true)

const kpis = [
  { title: 'Jobs Pendentes', value: 30, icon: 'mdi-clock-time-four-outline' },
  { title: 'Pedidos de Revisão', value: 10, icon: 'mdi-pencil-outline' },
  { title: 'Jobs Aprovados', value: 300, icon: 'mdi-check-decagram-outline' },
  { title: 'Total Realizados', value: 500, icon: 'mdi-chart-areaspline' },
]

const clients = Array.from({ length: 24 }, () => 'Posto Shell')

const avatarUrl = 'https://avatars.githubusercontent.com/u/9919?s=64&v=4' // placeholder
</script>

<style scoped>
/* fundos principais (ficam fiéis ao mock) */
.bg-outer {
  background: #d4d4d4;
  min-height: calc(100vh - 56px);
}
.bg-inner {
  background: #d4d4d4;
  box-shadow: none;
}

/* busca redonda igual ao mock */
.top-search :deep(.v-field--variant-solo) {
  border-radius: 9999px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  max-width: 420px;
}

/* KPI */
.kpi-card .kpi-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #eaf2ff;
  color: rgb(var(--v-theme-primary));
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Clientes */
.clients-search :deep(.v-field--variant-solo) {
  border-radius: 9999px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  width: 360px;
  max-width: 360px;
}

/* grid de clientes: 8 colunas no desktop, com gap semelhante ao design */
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

/* cartões de cliente com leve borda interna + sombra */
.client-card {
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, 0.03),
    0 4px 14px rgba(0, 0, 0, 0.08);
}

/* responsividade */
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
