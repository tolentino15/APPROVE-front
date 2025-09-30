<template>
  <v-app>
    <!-- Topbar -->
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

    <!-- Drawer -->
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

    <!-- MAIN -->
    <v-main>
      <v-container fluid class="pa-0">
        <v-sheet class="page-surface">
          <v-container class="py-8">
            <v-row>
              <v-col cols="12">
                <div class="text-h5 font-weight-black" style="color: #222">Cadastro novo Job</div>

                <v-card class="form-card rounded-xl elevation-1 mt-6">
                  <v-card-text class="pa-6">
                    <v-form ref="formRef" @submit.prevent="submit">
                      <!-- Nome -->
                      <div class="form-group">
                        <div class="label">Nome</div>
                        <v-text-field
                          v-model="form.nome"
                          :rules="[rules.required]"
                          variant="outlined"
                          density="comfortable"
                          flat
                          hide-details="auto"
                          placeholder="Insira o nome do cliente"
                          required
                        />
                      </div>

                      <!-- Descrição -->
                      <div class="form-group">
                        <div class="label">Descrição</div>
                        <v-textarea
                          v-model="form.descricao"
                          variant="outlined"
                          density="comfortable"
                          flat
                          hide-details="auto"
                          auto-grow
                          placeholder="Descreva o job"
                        />
                      </div>

                      <!-- Linha com Cliente, Data e Redes -->
                      <v-row class="mt-1" dense>
                        <v-col cols="12" md="4">
                          <div class="label">Cliente</div>
                          <v-select
                            v-model="form.clienteId"
                            :items="clientes"
                            item-title="nome"
                            item-value="id"
                            :rules="[rules.required]"
                            variant="solo-filled"
                            density="comfortable"
                            flat
                            hide-details="auto"
                            placeholder="Contato com o cliente"
                            required
                          />
                        </v-col>

                        <v-col cols="12" md="4">
                          <div class="label">Data de Publicação</div>
                          <v-text-field
                            v-model="form.dataPublicacao"
                            :rules="[rules.required]"
                            type="date"
                            variant="solo-filled"
                            density="comfortable"
                            flat
                            hide-details="auto"
                            placeholder="Contato com o cliente"
                            required
                          />
                        </v-col>

                        <!-- Redes sociais selecionáveis -->
                        <v-col cols="12" md="4">
                          <div class="label">Redes Sociais</div>
                          <v-btn-toggle
                            v-model="form.redes"
                            multiple
                            class="social-toggle d-flexflex-wrap mt-1"
                            density="comfortable"
                          >
                            <v-btn
                              value="instagram"
                              icon
                              :aria-pressed="form.redes.includes('instagram')"
                            >
                              <v-icon size="24">mdi-instagram</v-icon>
                            </v-btn>
                            <v-btn
                              value="twitter"
                              icon
                              :aria-pressed="form.redes.includes('twitter')"
                            >
                              <v-icon size="24">mdi-twitter</v-icon>
                            </v-btn>
                            <v-btn
                              value="facebook"
                              icon
                              :aria-pressed="form.redes.includes('facebook')"
                            >
                              <v-icon size="24">mdi-facebook</v-icon>
                            </v-btn>
                            <v-btn
                              value="whatsapp"
                              icon
                              :aria-pressed="form.redes.includes('whatsapp')"
                            >
                              <v-icon size="32">mdi-whatsapp</v-icon>
                            </v-btn>
                            <v-btn
                              value="tiktok"
                              icon
                              :aria-pressed="form.redes.includes('tiktok')"
                            >
                              <v-icon size="32">mdi-tiktok</v-icon>
                            </v-btn>
                          </v-btn-toggle>
                        </v-col>
                      </v-row>

                      <!-- Arquivo (dropzone) -->
                      <div class="form-group mt-1">
                        <div class="label">Arquivo</div>
                        <v-sheet
                          class="dropzone rounded-lg elevation-0 d-flex align-center justify-center"
                          color="white"
                          @click="pickAsset"
                          @dragover.prevent="dragOver = true"
                          @dragleave.prevent="dragOver = false"
                          @drop.prevent="handleDrop"
                        >
                          <div class="text-center">
                            <v-icon size="40">mdi-tray-arrow-up</v-icon>
                            <div class="text-body-2 mt-2">
                              Arraste o arquivo aqui ou clique para enviar
                            </div>
                            <div v-if="assetName" class="text-caption mt-1 text-medium-emphasis">
                              {{ assetName }}
                            </div>
                          </div>
                          <input
                            ref="assetInput"
                            type="file"
                            class="d-none"
                            @change="handleFileChange"
                          />
                        </v-sheet>
                      </div>

                      <v-btn
                        type="submit"
                        color="primary"
                        class="text-none font-weight-bold rounded-lg btn-cadastrar"
                        style="height: 36px"
                        :loading="saving"
                        :disabled="saving"
                      >
                        Cadastrar
                      </v-btn>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-sheet>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { VForm } from 'vuetify/components'

const router = useRouter()
const drawer = ref(true)
const avatarUrl = 'https://avatars.githubusercontent.com/u/9919?s=64&v=4'

/* ===== Tipos ===== */
type SocialKey = 'instagram' | 'twitter' | 'facebook' | 'whatsapp' | 'tiktok'

interface JobForm {
  nome: string
  descricao: string
  clienteId: number | null
  dataPublicacao: string // yyyy-mm-dd
  redes: SocialKey[] // <<-- novo: redes selecionadas
  arquivo: File | null
}
interface CreatedJob extends JobForm {
  id: number
}

/* v-form */
const formRef = ref<InstanceType<typeof VForm> | null>(null)

/* Regras (sem any) */
const rules = {
  required: (v: unknown) => {
    if (typeof v === 'string') return v.trim().length > 0 || 'Campo obrigatório'
    if (typeof v === 'number') return true
    if (v instanceof Date) return !isNaN(v.getTime()) || 'Campo obrigatório'
    return (v !== null && v !== undefined) || 'Campo obrigatório'
  },
}

/* Mock de clientes p/ o select */
const clientes = ref<Array<{ id: number; nome: string }>>([
  { id: 1, nome: 'Posto Shell' },
  { id: 2, nome: 'Posto Ipiranga' },
  { id: 3, nome: 'Posto BR' },
])

/* Estado do formulário (tipado) */
const form = ref<JobForm>({
  nome: '',
  descricao: '',
  clienteId: null,
  dataPublicacao: '',
  redes: [],
  arquivo: null,
})

/* Upload */
const assetInput = ref<HTMLInputElement | null>(null)
const assetName = ref<string>('')
const dragOver = ref(false)

function pickAsset() {
  assetInput.value?.click()
}
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement | null
  const file = target?.files?.[0] ?? null
  form.value.arquivo = file
  assetName.value = file?.name ?? ''
  if (target) target.value = ''
}
function handleDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0] ?? null
  form.value.arquivo = file
  assetName.value = file?.name ?? ''
}

/* Criação mock (tipado) + redirect */
const saving = ref(false)
function createJobMock(payload: JobForm): Promise<CreatedJob> {
  const id = Date.now()
  return Promise.resolve({ id, ...payload })
}

async function submit() {
  const res = await formRef.value?.validate()
  if (!res?.valid) return

  saving.value = true
  try {
    const novoJob = await createJobMock(form.value)
    await router.push({ name: 'HomeAdmin', query: { createdJobId: String(novoJob.id) } })
  } catch (err) {
    console.error('Erro ao criar job:', err)
  } finally {
    saving.value = false
  }
}

/* Navegação */
function goToDashboard() {
  router.push({ name: 'HomeAdmin' })
}
function goToBoardAdmin() {
  router.push({ name: 'BoardAdmin' })
}
function goToCalendarAdmin() {
  router.push({ name: 'CalendarAdmin' })
}
function goToCadastroCliente() {
  router.push({ name: 'CadastroCliente' })
}
</script>

<style scoped>
.v-application {
  background: #2b2b2b !important;
}

/* Faixa cinza de conteúdo */
.page-surface {
  background: #d9d9d9;
  min-height: calc(100vh - 80px);
  padding-top: 24px;
  padding-bottom: 56px;
}

/* Card branco amplo */
.form-card {
  background: #fff;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
}

/* Labels */
.form-group + .form-group {
  margin-top: 12px;
}
.label {
  font-size: 14px;
  color: #222;
  margin-bottom: 6px;
  font-weight: 600;
}

/* Inputs outlined com borda suave */
.form-card :deep(.v-field--variant-solo) {
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
}
/* Mostrar “borda” vermelha quando houver erro */
.form-card :deep(.v-field--error .v-field__overlay) {
  border-color: rgb(var(--v-theme-error));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-error), 0.2);
}

/* Dropzone */
.dropzone {
  height: 180px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  transition:
    box-shadow 0.2s,
    transform 0.1s;
  cursor: pointer;
}
.dropzone:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}
.dropzone:active {
  transform: scale(0.997);
}

/* Botão */
.v-btn {
  text-transform: none;
}
.btn-cadastrar {
  margin-top: 24px;
  margin-bottom: 4px;
}

/* Rede social ativa: deixe mais escuro para feedback visual */
.social-toggle :deep(.v-btn) {
  width: 90px;
  height: 100px;
}

.social-toggle :deep(.v-icon) {
  font-size: 40px;
}
.social-toggle :deep(.v-btn--active) {
  background: rgb(var(--v-theme-primary));
  color: white;
}

/* Responsivo */
@media (max-width: 1024px) {
  .form-card {
    margin: 0 12px;
  }
}
</style>
