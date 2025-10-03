<template>
  <v-container fluid class="pa-0">
    <v-sheet class="page-surface">
      <v-container class="py-6">
        <!-- Cabeçalho -->
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

        <!-- BOARD: altura fixa + colunas com scroll interno -->
        <div class="board-viewport">
          <div class="board-grid">
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
                <v-btn size="28" icon variant="text">
                  <v-icon size="18">mdi-dots-horizontal</v-icon>
                </v-btn>
              </div>

              <!-- Cards (com scroll interno quando passar da altura) -->
              <div class="column-cards">
                <v-card
                  v-for="(card, idx) in col.cards"
                  :key="`${col.id}-${card.id}-${idx}`"
                  class="kanban-card rounded-lg elevation-3"
                  draggable="true"
                  @dragstart="onCardDragStart(card, col.id)"
                  @dragend="onCardDragEnd"
                  @click.stop="openCard(card)"
                  style="cursor: pointer"
                >
                  <v-img
                    v-if="card.image"
                    :src="card.image"
                    alt=""
                    height="84"
                    cover
                    class="rounded-lg mb-2"
                  />
                  <v-card-text class="py-3">
                    <div class="text-subtitle-2 font-weight-bold mb-1">{{ card.title }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ card.subtitle }}
                    </div>
                    <div class="d-flex align-center justify-end mt-2">
                      <v-icon size="16" class="text-medium-emphasis">mdi-message-bulleted</v-icon>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Placeholder quando coluna vazia -->
                <div v-if="col.cards.length === 0" class="empty-hint text-medium-emphasis">
                  Arraste os cards aqui
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-container>
    </v-sheet>

    <!-- DIALOG DETALHE DO CARD -->
    <v-dialog v-model="detailsOpen" max-width="980" transition="dialog-transition" persistent>
      <v-card class="rounded-xl dialog-card">
        <v-card-text class="pa-6">
          <div class="d-flex align-start justify-space-between">
            <!-- Título + meta -->
            <div class="d-flex align-center flex-wrap" style="gap: 12px">
              <div class="text-h5 font-weight-black">{{ selectedCard?.title || 'TÍTULO' }}</div>
              <div class="text-body-2 text-medium-emphasis">
                {{ selectedCard?.client || 'Cliente' }} ·
                {{ selectedCard?.publishDate || 'Data de Publicação' }}
              </div>
              <v-chip
                v-if="selectedCard"
                :color="selectedCard.status === 'approved' ? 'green' : 'grey'"
                size="small"
                class="ml-2"
              >
                {{ selectedCard.status === 'approved' ? 'Aprovado' : 'Em Andamento' }}
              </v-chip>
            </div>

            <v-btn icon variant="text" @click="detailsOpen = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- GRID DO DIALOG -->
          <div class="details-grid">
            <!-- ESQUERDA: Descrição + Preview -->
            <div>
              <v-text-field
                v-model="selectedCardDraft.description"
                variant="solo-filled"
                density="comfortable"
                flat
                hide-details
                label="Descrição"
              />

              <div class="text-subtitle-1 font-weight-bold mt-4 mb-2">Post Preview</div>
              <v-img
                :src="selectedCard?.image"
                height="300"
                cover
                class="rounded-lg border-light"
              />
            </div>

            <!-- DIREITA: Comments -->
            <div>
              <div class="text-subtitle-1 font-weight-bold">Comments</div>
              <v-textarea
                v-model="newComment"
                variant="solo-filled"
                density="comfortable"
                flat
                hide-details
                placeholder="Escreva aqui"
                auto-grow
                class="mb-3"
              />
              <v-btn
                color="primary"
                class="text-none mb-4"
                size="small"
                @click="addComment"
                :disabled="!newComment.trim()"
              >
                Enviar
              </v-btn>

              <div class="comments-list">
                <div v-for="(c, i) in selectedCardDraft.comments" :key="i" class="comment-item">
                  <v-avatar size="28" class="mr-2">
                    <v-img :src="c.avatar" />
                  </v-avatar>
                  <div class="flex-1">
                    <div class="text-body-2 font-weight-bold">{{ c.author }}</div>
                    <div class="text-caption text-medium-emphasis">{{ c.text }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- STATUS + REDES -->
          <div class="d-flex flex-wrap align-center justify-space-between" style="gap: 12px">
            <div class="text-h6 font-weight-bold">Status</div>
            <div class="d-flex align-center" style="gap: 8px">
              <v-btn
                color="green"
                class="text-none"
                size="small"
                @click="setStatus('approved')"
                :variant="selectedCardDraft.status === 'approved' ? 'flat' : 'tonal'"
                >Aprovado</v-btn
              >

              <v-btn
                color="cyan-darken-1"
                class="text-none"
                size="small"
                @click="setStatus('adjust')"
                :variant="selectedCardDraft.status === 'adjust' ? 'flat' : 'tonal'"
                >Ajuste</v-btn
              >
            </div>

            <div class="d-flex align-center" style="gap: 10px">
              <v-btn
                icon
                variant="text"
                :class="{ 'social-active': selectedCardDraft.social.includes('instagram') }"
                @click="toggleSocial('instagram')"
              >
                <v-icon size="24">mdi-instagram</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="text"
                :class="{ 'social-active': selectedCardDraft.social.includes('facebook') }"
                @click="toggleSocial('facebook')"
              >
                <v-icon size="24">mdi-facebook</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="text"
                :class="{ 'social-active': selectedCardDraft.social.includes('whatsapp') }"
                @click="toggleSocial('whatsapp')"
              >
                <v-icon size="24">mdi-whatsapp</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn class="text-none" variant="tonal" @click="detailsOpen = false">Fechar</v-btn>
          <v-btn class="text-none" color="primary" @click="saveDetails">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

function goToCadastroJob() {
  router.push({ name: 'CadastroJob' })
}

/* Tipos */
type ColumnKey = 'draft' | 'waiting' | 'adjust' | 'approved'
interface CardItem {
  id: string
  title: string
  subtitle: string
  image?: string
}
interface Column {
  id: ColumnKey
  title: string
  cards: CardItem[]
}
interface CommentItem {
  author: string
  text: string
  avatar: string
}
interface CardDetails {
  id: string
  title: string
  client: string
  publishDate: string
  description: string
  image: string
  status: 'approved' | 'adjust' | 'pending'
  social: string[]
  comments: CommentItem[]
}

/* Dados do board (pode repetir id de card para testar — key usa idx) */
const columns = ref<Column[]>([
  {
    id: 'draft',
    title: 'RASCUNHO',
    cards: [
      {
        id: '1',
        title: 'Title',
        subtitle: 'Subtitle Subtitle Subtitle',
        image:
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop',
      },
      { id: '2', title: 'Title', subtitle: 'Subtitle Subtitle Subtitle' },
      { id: '2', title: 'Title', subtitle: 'Subtitle Subtitle Subtitle' },
      { id: '2', title: 'Title', subtitle: 'Subtitle Subtitle Subtitle' },
      { id: '2', title: 'Title', subtitle: 'Subtitle Subtitle Subtitle' },
      { id: '2', title: 'Title', subtitle: 'Subtitle Subtitle Subtitle' },
      { id: '2', title: 'Title', subtitle: 'Subtitle Subtitle Subtitle' },
      { id: '2', title: 'Title', subtitle: 'Subtitle Subtitle Subtitle' },
      { id: '2', title: 'Title', subtitle: 'Subtitle Subtitle Subtitle' },
      { id: '2', title: 'Title', subtitle: 'Subtitle Subtitle Subtitle' },
      { id: '2', title: 'Title', subtitle: 'Subtitle Subtitle Subtitle' },
    ],
  },
  {
    id: 'waiting',
    title: 'AGUARDANDO',
    cards: [{ id: '3', title: 'Title', subtitle: 'Subtitle Subtitle Subtitle' }],
  },
  {
    id: 'adjust',
    title: 'EM AJUSTE',
    cards: [{ id: '4', title: 'Title', subtitle: 'Subtitle Subtitle Subtitle' }],
  },
  {
    id: 'approved',
    title: 'APROVADOS',
    cards: [{ id: '5', title: 'Title', subtitle: 'Subtitle Subtitle Subtitle' }],
  },
])

/* DnD */
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

  const fromCol = columns.value.find((c) => c.id === from)
  const toCol = columns.value.find((c) => c.id === targetColId)
  if (!fromCol || !toCol) return
  const idx = fromCol.cards.findIndex((c) => c.id === cardId)
  if (idx === -1) return

  const [moved] = fromCol.cards.splice(idx, 1)
  toCol.cards.unshift(moved)
  draggingCard.value = null
  dragOverColumnId.value = null
}

/* Dialog */
const detailsOpen = ref(false)
const selectedCard = ref<CardDetails | null>(null)
const selectedCardDraft = ref<CardDetails>({
  id: '',
  title: '',
  client: '',
  publishDate: '',
  description: '',
  image: '',
  status: 'pending',
  social: [],
  comments: [],
})
const newComment = ref('')

function openCard(card: CardItem) {
  const base: CardDetails = {
    id: card.id,
    title: card.title,
    client: 'Cliente',
    publishDate: 'Data de Publicação',
    description: card.subtitle,
    image: card.image ?? 'https://via.placeholder.com/600x400',
    status: 'pending',
    social: [],
    comments: [
      {
        author: 'Cliente 1',
        text: 'Comentário de exemplo...',
        avatar: 'https://i.pravatar.cc/100?img=1',
      },
      {
        author: 'Admin',
        text: 'Comentário de exemplo...',
        avatar: 'https://i.pravatar.cc/100?img=2',
      },
    ],
  }
  selectedCard.value = base
  selectedCardDraft.value = JSON.parse(JSON.stringify(base))
  detailsOpen.value = true
}
function setStatus(s: CardDetails['status']) {
  selectedCardDraft.value.status = s
}
function toggleSocial(s: string) {
  const arr = selectedCardDraft.value.social
  const i = arr.indexOf(s)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(s)
}
function addComment() {
  const txt = newComment.value.trim()
  if (!txt) return
  selectedCardDraft.value.comments.push({
    author: 'Você',
    text: txt,
    avatar: 'https://i.pravatar.cc/100?img=3',
  })
  newComment.value = ''
}
function saveDetails() {
  if (!selectedCard.value) return
  selectedCard.value = JSON.parse(JSON.stringify(selectedCardDraft.value))
  detailsOpen.value = false
}
</script>

<style scoped>
/* superfície clara como antes */
.page-surface {
  background: #d9d9d9;
  /* altura total visível menos a app-bar */
  height: calc(100vh - 80px);
  padding-top: 24px;
  padding-bottom: 24px;
}

/* Faz o container interno virar uma coluna flex:
   - header em cima
   - board-viewport ocupando o restante da altura */
.page-surface > .v-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Título chip azul (mock) */
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

/* VIEWPORT do board ocupa todo o espaço restante
   (sem calc frágil) e evita scroll externo */
.board-viewport {
  height: calc(100% - 56px); /* 56px ~ altura do cabeçalho (título+botão). Ajuste se mudar */
  overflow: hidden; /* o scroll fica nas colunas */
}

/* GRID do board */
.board-grid {
  height: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(250px, 1fr));
  gap: 18px;
}
/* Colunas com bordas coloridas */
.board-column {
  background: #d6d6d6;
  border: 2px solid rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  padding: 8px 10px 12px;
  display: flex;
  flex-direction: column;
  min-height: 0; /* importante para o overflow do filho funcionar */
}
.board-column.is-over {
  outline: 2px dashed rgba(47, 124, 246, 0.55);
  outline-offset: -4px;
}
.col-draft {
  border-color: #666666;
}
.col-waiting {
  border-color: #d40000;
}
.col-adjust {
  border-color: #d68b00;
}
.col-approved {
  border-color: #07d100;
}

/* Header da coluna */
.column-header {
  flex: 0 0 auto;
  padding: 6px 6px 4px;
}

/* Área de cards com scroll vertical */
.column-cards {
  flex: 1 1 0;
  min-height: 0; /* fundamental para scroll em flex-child */
  overflow-y: auto; /* <-- aqui o scroll */
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 6px;
}

/* Cards */
.kanban-card {
  background: #ffffff;
}
.kanban-card :deep(.v-card-text) {
  padding-left: 12px !important;
  padding-right: 12px !important;
}

/* Placeholder quando coluna vazia */
.empty-hint {
  text-align: center;
  padding: 18px 6px;
  font-size: 12px;
  border: 1px dashed rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  background: #ffffff;
}

/* Dialog */
.dialog-transition-enter-active,
.dialog-transition-leave-active {
  transition: opacity 0.18s ease;
}
.dialog-transition-enter-from,
.dialog-transition-leave-to {
  opacity: 0;
}

.dialog-card {
  background: #fff;
}
.details-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 16px 24px;
}
.border-light {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

/* comments */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.comment-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  background: #f8f8f8;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  padding: 8px;
}

/* social selecionado */
.social-active {
  background: rgb(var(--v-theme-primary)) !important;
  color: #fff !important;
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
