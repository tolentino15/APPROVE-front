<template>
  <v-container fluid class="pa-0">
    <v-sheet class="page-surface">
      <v-container fluid class="py-6 px-6 calendar-container">
        <!-- Título -->
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="board-title chip-blue">Calendário</div>
        </div>

        <!-- Toolbar -->
        <v-toolbar flat class="mb-4 calendar-toolbar" density="comfortable">
          <v-btn
            class="me-4 text-none font-weight-bold toolbar-btn-primary"
            color="#2d8cff"
            variant="flat"
            rounded="lg"
            @click="setToday"
          >
            Hoje
          </v-btn>

          <v-btn
            color="#2d8cff"
            border="2d8cff 1px solid"
            size="small"
            variant="text"
            icon
            @click="prev"
          >
            <v-icon size="small">mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn color="#2d8cff" size="small" variant="text" icon @click="next">
            <v-icon size="small">mdi-chevron-right</v-icon>
          </v-btn>

          <v-toolbar-title v-if="calendar">
            {{ calendar.title }}
          </v-toolbar-title>

          <v-spacer />

          <v-menu v-if="isAdmin" location="bottom end">
            <template #activator="{ props }">
              <v-btn color="#2D8CFF" variant="outlined" class="text-none mr-3" v-bind="props">
                <span>{{ selectedClientLabel }}</span>
                <v-icon end>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item :active="selectedClient === ALL_VALUE" @click="setClient(ALL_VALUE)">
                <v-list-item-title>Todos</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-for="opt in clientOptionsNoAll"
                :key="opt.value"
                :active="selectedClient === opt.value"
                @click="setClient(opt.value)"
              >
                <v-list-item-title>{{ opt.label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn
                color="#2d8cff"
                variant="flat"
                rounded="lg"
                class="text-none font-weight-bold toolbar-btn-primary"
                v-bind="props"
              >
                <span>{{ typeToLabel[type] }}</span>
                <v-icon end>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="setView('day')"
                ><v-list-item-title>Dia</v-list-item-title></v-list-item
              >
              <v-list-item @click="setView('week')"
                ><v-list-item-title>Semana</v-list-item-title></v-list-item
              >
              <v-list-item @click="setView('month')"
                ><v-list-item-title>Mês</v-list-item-title></v-list-item
              >
              <v-list-item @click="setView('4day')"
                ><v-list-item-title>4 dias</v-list-item-title></v-list-item
              >
            </v-list>
          </v-menu>
        </v-toolbar>
        <v-progress-linear v-if="loading" indeterminate color="#2D8CFF" class="mb-3" height="3" />

        <v-progress-linear v-if="loading" indeterminate color="#2f7cf6" class="mb-3" height="3" />

        <!-- Legenda de clientes -->
        <div class="d-flex align-center flex-wrap mb-2" style="gap: 12px">
          <div v-for="client in clients" :key="client.id" class="legend-chip">
            <span class="dot" :style="{ background: client.color }"></span>
            <span class="text-caption">{{ client.name }}</span>
          </div>
        </div>

        <!-- Erro -->
        <v-alert v-if="loadError" type="error" variant="tonal" class="mb-3" density="comfortable">
          {{ loadError }}
        </v-alert>

        <!-- Calendário -->
        <v-sheet class="calendar-body rounded-lg overflow-hidden">
          <v-calendar
            class="calendar-root"
            ref="calendar"
            v-model="focus"
            :type="type"
            :events="filteredEvents"
            :event-color="getEventColor"
            color="primary"
            @change="updateRange"
            @click:event="showEvent"
            @click:date="viewDay"
            @click:more="viewDay"
          />

          <!-- Popover do evento -->
          <v-menu
            v-model="selectedOpen"
            :close-on-content-click="false"
            :activator="selectedElement || undefined"
            location="end"
          >
            <v-card min-width="360" color="grey-lighten-4" flat>
              <v-toolbar :color="selectedEvent?.color ?? 'primary'" dark density="comfortable">
                <v-toolbar-title class="text-truncate">
                  {{ selectedEvent?.name ?? '' }}
                </v-toolbar-title>
                <v-spacer />
                <v-btn icon><v-icon>mdi-dots-vertical</v-icon></v-btn>
              </v-toolbar>
              <v-card-text>
                <div class="mb-2 text-medium-emphasis">{{ selectedEventClient }}</div>
                <div class="text-body-2">
                  {{ selectedEvent?.details ?? '' }}
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn variant="text" color="secondary" @click="selectedOpen = false">Fechar</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-sheet>
      </v-container>
    </v-sheet>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue'
import { fetchCalendarEvents } from '@/api/calendar'
import { mapDTOToCalEvent } from '@/mappers/calendar'
import type { CalEvent } from '@/mappers/calendar'
import { getRole } from '@/auth'

/* ---------- Tipo mínimo exposto pelo v-calendar que usamos ---------- */
type CalendarExpose = {
  prev: () => void
  next: () => void
  checkChange: () => void
  title?: string
}

/* ---------- Domínio ---------- */
type Client = { id: string; name: string; color: string }
const clients: Client[] = [
  { id: 'cliente-a', name: 'Cliente A', color: '#1e88e5' },
  { id: 'cliente-b', name: 'Cliente B', color: '#8e24aa' },
  { id: 'cliente-c', name: 'Cliente C', color: '#43a047' },
  { id: 'cliente-d', name: 'Cliente D', color: '#fb8c00' },
]

const typeToLabel: Record<string, string> = {
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  '4day': '4 dias',
}

/* ref do calendário (sem importar tipo interno do Vuetify) */
const calendar = ref<CalendarExpose | null>(null)

/* estado do calendário */
const focus = ref<string>(new Date().toISOString().slice(0, 10))
const type = ref<'month' | 'week' | 'day' | '4day'>('month')
function setView(v: 'month' | 'week' | 'day' | '4day') {
  type.value = v
  reloadCurrentRange()
}

/* filtro por cliente */
const ALL_VALUE = 'all'
const selectedClient = ref<string>(ALL_VALUE)
const clientOptions = computed(() => [
  { label: 'Todos', value: ALL_VALUE },
  ...clients.map((client) => ({ label: client.name, value: client.id })),
])
const clientOptionsNoAll = computed(() => clients.map((c) => ({ label: c.name, value: c.id })))

const isAdmin = computed(() => getRole() === 'admin')
const selectedClientLabel = computed(() => {
  const opt = clientOptions.value.find((o) => o.value === selectedClient.value)
  return opt?.label ?? 'Cliente'
})
function setClient(val: string) {
  selectedClient.value = val
  reloadCurrentRange()
}

/* eventos */
const allEvents = ref<CalEvent[]>([])
const filteredEvents = computed<CalEvent[]>(() => {
  const filter = selectedClient.value
  return filter === ALL_VALUE
    ? allEvents.value
    : allEvents.value.filter((event) => event.client === filter)
})

/* mapa de clientes (id->client) */
const clientMap = computed<Record<string, Client>>(() =>
  clients.reduce((map, c) => ((map[c.id] = c), map), {} as Record<string, Client>),
)

/* popover do evento */
const selectedEvent: Ref<CalEvent | null> = ref(null)
const selectedElement: Ref<HTMLElement | null> = ref(null)
const selectedOpen = ref(false)
const selectedEventClient = computed(() => {
  const ev = selectedEvent.value
  return ev ? (clientMap.value[ev.client]?.name ?? ev.client) : ''
})

/* loading/erro + proteção contra race condition */
const loading = ref(false)
const loadError = ref<string | null>(null)
let lastRequestId = 0

/* lifecycle */
onMounted(() => {
  calendar.value?.checkChange()
})

/* ações da toolbar */
function setToday() {
  focus.value = ''
}
function prev() {
  calendar.value?.prev()
}
function next() {
  calendar.value?.next()
}
function reloadCurrentRange() {
  // força o v-calendar disparar @change novamente
  calendar.value?.checkChange()
}

/* clique na data -> muda para dia */
function viewDay(_nativeEvt: Event, { date }: { date: string }) {
  focus.value = date
  type.value = 'day'
}

/* cor do evento (se estiver usando :event-color) */
function getEventColor(event: unknown): string {
  const e = event as { color?: string } | null
  return e?.color ?? 'primary'
}

/* ---- @click:event: handler com type-guard (sem any) ---- */
type VCalClickPayload = { event: CalEvent; nativeEvent: MouseEvent }

function isVCalClickPayload(p: unknown): p is VCalClickPayload {
  if (p == null || typeof p !== 'object') return false

  // p é um objeto genérico com chaves desconhecidas
  const obj = p as Record<string, unknown>

  // event precisa ser um objeto (CalEvent)
  const ev = obj.event
  const isEventObj = typeof ev === 'object' && ev !== null

  // nativeEvent precisa ser um MouseEvent (checa estrutura mínima)
  const ne = obj.nativeEvent
  const isMouseEvt =
    typeof ne === 'object' &&
    ne !== null &&
    'stopPropagation' in (ne as Record<string, unknown>) &&
    typeof (ne as MouseEvent).stopPropagation === 'function'

  return isEventObj && isMouseEvt
}

function showEvent(_e: Event, payload: unknown) {
  if (!isVCalClickPayload(payload)) return
  const { event, nativeEvent } = payload

  const open = () => {
    selectedEvent.value = event
    selectedElement.value = nativeEvent.target as HTMLElement
    requestAnimationFrame(() => (selectedOpen.value = true))
  }

  if (selectedOpen.value) {
    selectedOpen.value = false
    requestAnimationFrame(open)
  } else {
    open()
  }

  nativeEvent.stopPropagation()
}

/* ====== Carga de eventos (pronto para backend) ====== */
const updateRange = async ({ start, end }: { start: { date: string }; end: { date: string } }) => {
  const requestId = ++lastRequestId
  loading.value = true
  loadError.value = null

  try {
    const useMock = String(import.meta.env.VITE_MOCK_CALENDAR).toLowerCase() === 'true'
    if (useMock) {
      const min = new Date(`${start.date}T00:00:00`)
      const max = new Date(`${end.date}T23:59:59`)
      const dayCount = Math.max(1, Math.round((max.getTime() - min.getTime()) / 86400000))
      const basePerClient = Math.max(3, Math.floor(dayCount / 3))
      const generated: CalEvent[] = []
      for (const client of clients) {
        const eventCount = basePerClient + Math.floor(Math.random() * 5)
        for (let i = 0; i < eventCount; i++) {
          const allDay = Math.random() < 0.25
          const firstTs =
            min.getTime() + Math.floor(Math.random() * (max.getTime() - min.getTime()))
          const startDate = new Date(firstTs - (firstTs % (15 * 60 * 1000)))
          const durationSlots = allDay ? 16 : Math.floor(Math.random() * 6) + 2
          const endDate = new Date(startDate.getTime() + durationSlots * 15 * 60 * 1000)
          generated.push({
            name: `Job - ${client.name}`,
            start: startDate,
            end: endDate,
            color: client.color,
            timed: !allDay,
            client: client.id,
            details: `${client.name} - conteúdo agendado`,
          })
        }
      }
      generated.sort((a, b) => a.start.getTime() - b.start.getTime())
      allEvents.value = generated
      return
    }
    const dtos = await fetchCalendarEvents({
      start: start.date,
      end: end.date,
      clientId: selectedClient.value !== ALL_VALUE ? selectedClient.value : undefined,
      view: type.value,
    })

    if (requestId !== lastRequestId) return // descarta resposta antiga

    const mapped = dtos.map((dto) =>
      mapDTOToCalEvent(
        dto,
        Object.fromEntries(clients.map((c) => [c.id, { color: c.color, name: c.name }])),
      ),
    )

    mapped.sort((a, b) => a.start.getTime() - b.start.getTime())
    allEvents.value = mapped
  } catch (err: unknown) {
    if (requestId !== lastRequestId) return
    loadError.value = err instanceof Error ? err.message : 'Erro ao carregar eventos'
    // Fallback: gera eventos simulados para não quebrar a tela quando a API falhar
    try {
      const min = new Date(`${start.date}T00:00:00`)
      const max = new Date(`${end.date}T23:59:59`)
      const dayCount = Math.max(1, Math.round((max.getTime() - min.getTime()) / 86400000))
      const basePerClient = Math.max(3, Math.floor(dayCount / 3))
      const generated: CalEvent[] = []
      for (const client of clients) {
        const eventCount = basePerClient + Math.floor(Math.random() * 5)
        for (let i = 0; i < eventCount; i++) {
          const allDay = Math.random() < 0.25
          const firstTs =
            min.getTime() + Math.floor(Math.random() * (max.getTime() - min.getTime()))
          const startDate = new Date(firstTs - (firstTs % (15 * 60 * 1000)))
          const durationSlots = allDay ? 16 : Math.floor(Math.random() * 6) + 2
          const endDate = new Date(startDate.getTime() + durationSlots * 15 * 60 * 1000)
          generated.push({
            name: `Job - ${client.name}`,
            start: startDate,
            end: endDate,
            color: client.color,
            timed: !allDay,
            client: client.id,
            details: `${client.name} - conteúdo agendado`,
          })
        }
      }
      generated.sort((a, b) => a.start.getTime() - b.start.getTime())
      allEvents.value = generated
    } catch {}
    // --- MOCK opcional (descomente enquanto o backend não existir) ---
    /*
    const min = new Date(`${start.date}T00:00:00`)
    const max = new Date(`${end.date}T23:59:59`)
    const dayCount = Math.max(1, Math.round((max.getTime() - min.getTime()) / 86400000))
    const basePerClient = Math.max(3, Math.floor(dayCount / 3))
    const generated: CalEvent[] = []
    for (const client of clients) {
      const eventCount = basePerClient + Math.floor(Math.random() * 5)
      for (let i = 0; i < eventCount; i++) {
        const allDay = Math.random() < 0.25
        const firstTs = min.getTime() + Math.floor(Math.random() * (max.getTime() - min.getTime()))
        const startDate = new Date(firstTs - (firstTs % (15 * 60 * 1000)))
        const durationSlots = allDay ? 16 : Math.floor(Math.random() * 6) + 2
        const endDate = new Date(startDate.getTime() + durationSlots * 15 * 60 * 1000)
        generated.push({
          name: `Job - ${client.name}`,
          start: startDate,
          end: endDate,
          color: client.color,
          timed: !allDay,
          client: client.id,
          details: `${client.name} - conteúdo/peça agendada`,
        })
      }
    }
    generated.sort((a, b) => a.start.getTime() - b.start.getTime())
    allEvents.value = generated
    */
  } finally {
    if (requestId === lastRequestId) loading.value = false
  }
}
</script>

<style scoped>
.calendar-container {
  min-height: calc(100vh - 70px);
}

.calendar-toolbar {
  background: #ffffff;
  border: #2d8cff 1px solid;
  border-radius: 10px;
}
.toolbar-btn-primary {
  box-shadow: 0 2px 10px rgba(45, 140, 255, 0.25);
  color: #fffffffb !important;
}
.calendar-select :deep(.v-field__outline) {
  --v-field-border-color: rgba(45, 140, 255, 0.55);
}
.calendar-select :deep(.v-field__input),
.calendar-toolbar :deep(.v-toolbar-title) {
  color: #0f2136;
}
.calendar-toolbar :deep(.v-btn .v-icon) {
  color: #0f2136;
}

.calendar-center {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}
.calendar-box {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  height: clamp(520px, calc(100vh - 240px), 780px);
}
.calendar-box :deep(.v-calendar) {
  height: 100%;
}

.calendar-container {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px);
}
.calendar-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: #2d8cff 1px solid;
}

.calendar-root {
  flex: 1;
  min-height: 0;
  height: 100%;
  padding: 5px;
}

.board-title {
  display: inline-block;
  font-weight: 900;
  font-size: 24px;
  color: #fff;
  padding: 6px 14px;
  border-radius: 12px;
}
.chip-blue {
  background: #2f7cf6;
}
.page-surface {
  background: #d9d9d9;
  min-height: calc(100vh - 80px);
}

.legend-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #ffffff;
  border: #2d8cff 1px solid;
  border-radius: 999px;
}

.legend-chip .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.topo {
  background: #2d8cff;
  border-radius: 8px;
  padding: 8px;
}

.v-sheet.rounded-lg {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

@media (max-width: 960px) {
  .v-sheet.rounded-lg {
    height: 560px !important;
  }
}
</style>
