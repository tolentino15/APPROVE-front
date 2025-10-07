<template>
  <v-container fluid class="pa-0">
    <v-sheet class="page-surface">
      <v-container class="py-6">
        <!-- Toolbar -->
        <v-toolbar flat class="mb-3">
          <v-btn class="me-4" color="grey-darken-2" variant="outlined" @click="setToday">
            Hoje
          </v-btn>

          <v-btn color="grey-darken-2" size="small" variant="text" icon @click="prev">
            <v-icon size="small">mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn color="grey-darken-2" size="small" variant="text" icon @click="next">
            <v-icon size="small">mdi-chevron-right</v-icon>
          </v-btn>

          <v-toolbar-title v-if="calendar">
            {{ calendar.title }}
          </v-toolbar-title>

          <v-spacer />

          <v-select
            v-model="selectedClient"
            :items="clientOptions"
            item-title="label"
            item-value="value"
            label="Cliente"
            density="comfortable"
            variant="outlined"
            hide-details
            style="max-width: 220px"
            class="mr-3"
            @update:model-value="reloadCurrentRange"
          />

          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn color="grey-darken-2" variant="outlined" v-bind="props">
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
        <v-sheet height="720" class="rounded-lg overflow-hidden">
          <v-progress-linear v-if="loading" indeterminate color="primary" />
          <v-calendar
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
  month: 'Mes',
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

/* eventos */
type CalEvent = {
  name: string
  start: Date
  end: Date
  color: string
  timed: boolean
  client: string
  details?: string
}

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
.page-surface {
  background: #d9d9d9;
  min-height: calc(100vh - 80px);
}

.legend-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 999px;
}

.legend-chip .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
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
