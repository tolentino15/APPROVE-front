<template>
  <v-app>
    <!-- MAIN -->
    <v-main>
      <v-container fluid class="pa-0">
        <v-sheet class="page-surface">
          <v-container class="py-6">
            <!-- Título e CTA -->
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="board-title chip-blue">Quadro</div>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                class="text-none font-weight-bold rounded-lg"
                style="height: 36px"
                @click="goToCadastroJob"
              >
                Criar novo Job
              </v-btn>
            </div>

            <!-- BOARD -->
            <div class="board-grid">
              <!-- COLUNA -->
              <div
                v-for="col in columns"
                :key="col.id"
                class="board-column"
                :class="['col-' + col.id, { 'is-over': dragOverColumnId === col.id }]"
                @dragover.prevent="onColumnDragOver(col.id)"
                @dragleave="onColumnDragLeave(col.id)"
                @drop="onColumnDrop(col.id)"
              >
                <!-- Cabeçalho da coluna -->
                <div class="column-header d-flex align-center justify-space-between">
                  <div class="text-subtitle-2 font-weight-bold">{{ col.title }}</div>
                  <v-btn size="28" icon variant="text"
                    ><v-icon size="18">mdi-dots-horizontal</v-icon></v-btn
                  >
                </div>

                <!-- Área de cartões -->
                <div class="column-cards">
                  <v-card
                    v-for="card in col.cards"
                    :key="card.id"
                    class="kanban-card rounded-lg elevation-1"
                    draggable="true"
                    @dragstart="onCardDragStart(card, col.id)"
                    @dragend="onCardDragEnd"
                  >
                    <v-card-text class="py-3">
                      <!-- Opcional: imagem no topo para alguns cards (igual ao mock) -->
                      <v-img
                        v-if="card.image"
                        :src="card.image"
                        alt=""
                        height="84"
                        cover
                        class="rounded-lg mb-2"
                      />
                      <div class="text-subtitle-2 font-weight-bold mb-1">Title</div>
                      <div class="text-caption text-medium-emphasis">
                        Subtitle Subtitle Subtitle Subtitle
                      </div>

                      <div class="d-flex align-center justify-end mt-2">
                        <v-icon size="16" class="text-medium-emphasis">mdi-message-bulleted</v-icon>
                      </div>
                    </v-card-text>
                  </v-card>

                  <!-- Placeholder quando coluna vazia -->
                  <div v-if="col.cards.length === 0" class="empty-hint text-medium-emphasis">
                    Arraste cards aqui
                  </div>
                </div>
              </div>
            </div>
          </v-container>
        </v-sheet>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

/* Estado geral */
const router = useRouter()

/* Tipos */
type ColumnKey = 'draft' | 'waiting' | 'fixing' | 'approved'

interface CardItem {
  id: string
  image?: string
}
interface Column {
  id: ColumnKey
  title: string
  cards: CardItem[]
}

/* Mock de dados */
const columns = ref<Column[]>([
  {
    id: 'draft',
    title: 'RASCUNHO',
    cards: [
      { id: 'c1' },
      {
        id: 'c2',
        image:
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  { id: 'waiting', title: 'AGUARDANDO', cards: [{ id: 'c3' }] },
  { id: 'fixing', title: 'EM AJUSTE', cards: [{ id: 'c4' }] },
  { id: 'approved', title: 'APROVADOS', cards: [{ id: 'c5' }] },
])

/* Drag & Drop (HTML5) */
const draggingCard = ref<{ cardId: string; from: ColumnKey } | null>(null)
const dragOverColumnId = ref<ColumnKey | null>(null)

function onCardDragStart(card: CardItem, from: ColumnKey) {
  draggingCard.value = { cardId: card.id, from }
}
function onCardDragEnd() {
  draggingCard.value = null
  dragOverColumnId.value = null
}
function onColumnDragOver(colId: ColumnKey) {
  dragOverColumnId.value = colId
}
function onColumnDragLeave(colId: ColumnKey) {
  if (dragOverColumnId.value === colId) dragOverColumnId.value = null
}
function onColumnDrop(targetColId: ColumnKey) {
  if (!draggingCard.value) return
  const { cardId, from } = draggingCard.value
  if (from === targetColId) return

  // remove do "from"
  const fromCol = columns.value.find((c) => c.id === from)
  const toCol = columns.value.find((c) => c.id === targetColId)
  if (!fromCol || !toCol) return
  const idx = fromCol.cards.findIndex((c) => c.id === cardId)
  if (idx === -1) return

  const [moved] = fromCol.cards.splice(idx, 1)
  toCol.cards.unshift(moved) // adiciona no topo
  draggingCard.value = null
  dragOverColumnId.value = null
}

/* Navegação (mesmo padrão) */
function goToCadastroJob() {
  router.push({ name: 'CadastroJob' })
}
</script>

<style scoped>
.v-application {
  background: #2b2b2b !important;
}

/* Faixa cinza do conteúdo */
.page-surface {
  background: #d9d9d9;
  min-height: calc(100vh - 80px);
  padding-top: 24px;
  padding-bottom: 32px;
}

/* Título "Quadro" como chip azul do mock */
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

/* GRID do board: 4 colunas com espaçamento largo */
.board-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(240px, 1fr));
  gap: 18px;
}

/* Coluna */
.board-column {
  background: #e0e0e0;
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  padding: 8px 10px 12px;
  min-height: 380px;
  display: flex;
  flex-direction: column;
}
.board-column.is-over {
  outline: 2px dashed rgba(47, 124, 246, 0.55);
  outline-offset: -4px;
}

/* Bordas coloridas por coluna (como no mock) */
.col-draft {
  border-color: #e27b7b;
} /* vermelho suave */
.col-waiting {
  border-color: #6dcc7e;
} /* verde suave */
.col-fixing {
  border-color: #8b8b8b;
} /* cinza */
.col-approved {
  border-color: #8b8b8b;
} /* cinza */

/* Header da coluna */
.column-header {
  padding: 6px 6px 4px;
}

/* Cards container */
.column-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 6px;
}

/* Card */
.kanban-card {
  background: #f8f8f8;
}
.kanban-card :deep(.v-card-text) {
  padding-left: 12px !important;
  padding-right: 12px !important;
}

/* Placeholder coluna vazia */
.empty-hint {
  text-align: center;
  padding: 18px 6px;
  font-size: 12px;
  border: 1px dashed rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  background: #efefef;
}

/* Responsivo */
@media (max-width: 1280px) {
  .board-grid {
    grid-template-columns: repeat(3, minmax(240px, 1fr));
  }
}
@media (max-width: 960px) {
  .board-grid {
    grid-template-columns: repeat(2, minmax(240px, 1fr));
  }
}
@media (max-width: 640px) {
  .board-grid {
    grid-template-columns: 1fr;
  }
}
</style>
