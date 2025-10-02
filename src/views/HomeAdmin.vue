<template>
  <v-app>
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
                      variant="outlined"
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

              <v-card-text style="flex: 1">
                <div class="clients-grid clients-grid-scroll">
                  <v-sheet
                    v-for="cliente in filteredClients"
                    :key="cliente.id"
                    class="client-card rounded-lg elevation-5 d-flex flex-column align-center pa-3"
                    color="#fafafa"
                    role="button"
                    @click="openClient(cliente)"
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

      <!-- ============== DIALOG: Detalhes do Cliente ============== -->
      <v-dialog v-model="clientDialog" max-width="920" scrollable>
        <v-card class="rounded-xl">
          <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-h5 font-weight-black">{{ selectedClient?.nome || 'Cliente' }}</span>
            <v-btn icon="mdi-close" variant="text" @click="clientDialog = false" />
          </v-card-title>

          <v-divider />

          <v-card-text class="py-6">
            <v-row>
              <!-- Coluna ESQUERDA: Avatar / CTA / Redes -->
              <v-col cols="12" md="5" class="pr-md-6">
                <div class="d-flex flex-column align-center">
                  <v-img
                    :src="selectedClient?.avatar || placeholderAvatar"
                    alt="avatar"
                    width="260"
                    height="220"
                    cover
                    class="rounded-lg elevation-1 mb-4"
                  />
                  <v-btn
                    color="primary"
                    class="text-none font-weight-bold rounded-lg mb-4"
                    size="large"
                    block
                  >
                    Calendário
                  </v-btn>
                  <div class="d-flex align-center ga-4">
                    <v-btn icon variant="outlined"><v-icon>mdi-instagram</v-icon></v-btn>
                    <v-btn icon variant="outlined"><v-icon>mdi-facebook</v-icon></v-btn>
                    <v-btn icon variant="outlined"><v-icon>mdi-twitter</v-icon></v-btn>
                  </div>
                </div>
              </v-col>

              <!-- Coluna DIREITA: Jobs -->
              <v-col cols="12" md="7">
                <div class="text-h5 font-weight-black mb-2">Jobs</div>

                <!-- Barra de progresso dividida -->
                <div class="mb-4">
                  <div class="text-subtitle-2 text-medium-emphasis mb-1">Progresso</div>
                  <div class="progress-split">
                    <div class="approved" :style="{ width: approvedPct + '%' }">
                      <span>Aprovados</span>
                    </div>
                    <div class="pending" :style="{ width: 100 - approvedPct + '%' }">
                      <span>Em Andamento</span>
                    </div>
                  </div>
                </div>

                <!-- Lista de jobs (mock) -->
                <v-row dense>
                  <v-col v-for="(job, idx) in selectedClientJobs" :key="idx" cols="12">
                    <v-card class="rounded-lg elevation-1 job-card">
                      <v-card-text>
                        <div class="text-subtitle-1 font-weight-bold mb-1">Title</div>
                        <div class="text-body-2 text-medium-emphasis">
                          Subtitle Subtitle Subtitle Subtitle
                        </div>
                        <div class="d-flex mt-3">
                          <div class="status-pill" :class="{ green: job.status === 'approved' }">
                            <span v-if="job.status === 'approved'">Aprovado!</span>
                            <span v-else>Em Andamento</span>
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>
      <!-- ============ /DIALOG: Detalhes do Cliente ============== -->
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const search = ref('')

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
  { id: 4, nome: 'Posto Petrobras' },
  { id: 5, nome: 'Posto Texaco' },
  { id: 6, nome: 'Posto Esso' },
  { id: 7, nome: 'Posto Mobil' },
  { id: 8, nome: 'Posto Ale' },
  { id: 9, nome: 'Posto Shell' },
  { id: 10, nome: 'Posto Ipiranga' },
  { id: 11, nome: 'Posto BR' },
  { id: 12, nome: 'Posto Petrobras' },
  { id: 13, nome: 'Posto Texaco' },
  { id: 14, nome: 'Posto Esso' },
  { id: 15, nome: 'Posto Mobil' },
  { id: 16, nome: 'Posto Ale' },
])

// Filtro de busca por nome
const filteredClients = computed(() => {
  if (!search.value) return clients.value
  return clients.value.filter((c) => c.nome.toLowerCase().includes(search.value.toLowerCase()))
})

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

// ---------- Dialog & seleção do cliente ----------
const clientDialog = ref(false)
const selectedClient = ref<{ id: number; nome: string; avatar?: string } | null>(null)

// Jobs mockados do cliente selecionado
const selectedClientJobs = ref<Array<{ status: 'approved' | 'pending' }>>([])

// Avatar placeholder (enquanto não vem do backend)
const placeholderAvatar =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop'

// Percentual de aprovados para a barra dividida
const approvedPct = ref<number>(65)

// Abrir dialog ao clicar no cliente
function openClient(cliente: { id: number; nome: string }) {
  selectedClient.value = { ...cliente, avatar: placeholderAvatar }

  // Mock de jobs
  selectedClientJobs.value = [{ status: 'approved' }, { status: 'approved' }, { status: 'pending' }]

  // Recalcula % aprovados
  const total = selectedClientJobs.value.length
  const ok = selectedClientJobs.value.filter((j) => j.status === 'approved').length
  approvedPct.value = total ? Math.round((ok / total) * 100) : 0

  clientDialog.value = true
}
</script>

<style scoped>
.clients-grid-scroll {
  max-height: 350px;
  overflow-y: auto;
  padding: 18px 24px;
}
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

/* Barra de progresso dividida */
.progress-split {
  display: flex;
  width: 100%;
  height: 24px;
  border-radius: 6px;
  overflow: hidden;
  background: #eee;
  position: relative;
}
.progress-split > div {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
}
.progress-split .approved {
  background: #2f7cf6;
  color: #fff;
}
.progress-split .pending {
  background: #d9d9d9;
  color: #111;
}
.progress-split span {
  font-size: 12px;
  line-height: 24px;
  position: static;
  top: auto;
  left: auto;
  width: 100%;
  text-align: center;
}

/* Card cinza do job */
.job-card {
  background: #e9e9e9;
}

/* Pílula de status */
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #a3a3a3;
  color: #fff;
  border-radius: 9999px;
  height: 18px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 700;
}
.status-pill.green {
  background: #21c55d;
}
</style>
