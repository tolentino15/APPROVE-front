<template>
  <v-container fluid class="pa-0">
    <v-sheet class="page-surface">
      <v-container class="py-6">
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
          />

          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn color="grey-darken-2" variant="outlined" v-bind="props">
                <span>{{ typeToLabel[type] }}</span>
                <v-icon end>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Dia</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Semana</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Mes</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 dias</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>

        <div class="d-flex align-center flex-wrap mb-2" style="gap: 12px">
          <div v-for="client in clients" :key="client.id" class="legend-chip">
            <span class="dot" :style="{ background: client.color }"></span>
            <span class="text-caption">{{ client.name }}</span>
          </div>
        </div>

        <v-sheet height="720" class="rounded-lg overflow-hidden">
          <v-calendar
            ref="calendar"
            v-model="focus"
            :events="filteredEvents"
            :type="type"
            color="primary"
            @change="updateRange"
            @click:date="viewDay"
            @click:event="showEvent"
            @click:more="viewDay"
          />

          <v-menu
            v-model="selectedOpen"
            :activator="selectedElement"
            :close-on-content-click="false"
            location="end"
          >
            <v-card min-width="360" color="grey-lighten-4" flat>
              <v-toolbar :color="selectedEvent?.color ?? 'primary'" dark density="comfortable">
                <v-toolbar-title class="text-truncate">
                  {{ selectedEvent?.name ?? '' }}
                </v-toolbar-title>
                <v-spacer />
                <v-btn icon>
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
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
import { computed, onMounted, ref } from 'vue'
import type { VCalendar } from 'vuetify/labs/VCalendar'

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

const calendar = ref<InstanceType<typeof VCalendar> | null>(null)
const focus = ref<string>(new Date().toISOString().slice(0, 10))
const type = ref<'month' | 'week' | 'day' | '4day'>('month')

const ALL_VALUE = 'all'
const selectedClient = ref<string>(ALL_VALUE)

const clientOptions = computed(() => [
  { label: 'Todos', value: ALL_VALUE },
  ...clients.map((client) => ({ label: client.name, value: client.id })),
])

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
  if (filter === ALL_VALUE) {
    return allEvents.value
  }
  return allEvents.value.filter((event) => event.client === filter)
})

const clientMap = computed<Record<string, Client>>(() => {
  return clients.reduce(
    (map, client) => {
      map[client.id] = client
      return map
    },
    {} as Record<string, Client>,
  )
})

const selectedEvent = ref<CalEvent | null>(null)
const selectedElement = ref<HTMLElement | null>(null)
const selectedOpen = ref(false)

const selectedEventClient = computed(() => {
  const event = selectedEvent.value
  if (!event) return ''
  return clientMap.value[event.client]?.name ?? event.client
})

onMounted(() => {
  calendar.value?.checkChange()
})

function setToday() {
  focus.value = ''
}

function prev() {
  calendar.value?.prev()
}

function next() {
  calendar.value?.next()
}

function viewDay(_nativeEvt: unknown, { date }: { date: string }) {
  focus.value = date
  type.value = 'day'
}

function showEvent(nativeEvent: MouseEvent, { event }: { event: CalEvent }) {
  const open = () => {
    selectedEvent.value = event
    selectedElement.value = nativeEvent.target as HTMLElement
    requestAnimationFrame(() => {
      selectedOpen.value = true
    })
  }

  if (selectedOpen.value) {
    selectedOpen.value = false
    requestAnimationFrame(() => open())
  } else {
    open()
  }

  nativeEvent.stopPropagation()
}

function updateRange({ start, end }: { start: { date: string }; end: { date: string } }) {
  const min = new Date(`${start.date}T00:00:00`)
  const max = new Date(`${end.date}T23:59:59`)

  const dayCount = Math.max(1, Math.round((max.getTime() - min.getTime()) / 86400000))
  const basePerClient = Math.max(3, Math.floor(dayCount / 3))

  const generated: CalEvent[] = []

  for (const client of clients) {
    const eventCount = basePerClient + rnd(0, 4)

    for (let index = 0; index < eventCount; index += 1) {
      const allDay = rnd(0, 3) === 0
      const firstTs = rnd(min.getTime(), max.getTime())
      const startDate = new Date(firstTs - (firstTs % (15 * 60 * 1000)))
      const durationSlots = allDay ? rnd(8, 32) : rnd(2, 8)
      const endDate = new Date(startDate.getTime() + durationSlots * 15 * 60 * 1000)

      generated.push({
        name: `Job - ${client.name}`,
        start: startDate,
        end: endDate,
        color: client.color,
        timed: !allDay,
        client: client.id,
        details: `${client.name} - conteudo/peca agendada`,
      })
    }
  }

  generated.sort((a, b) => a.start.getTime() - b.start.getTime())

  allEvents.value = generated
}

function rnd(a: number, b: number) {
  return Math.floor((b - a + 1) * Math.random()) + a
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
