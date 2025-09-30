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
      </div>
    </v-app-bar>

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

    <!-- MAIN -->
    <v-main>
      <!-- superfície clara ocupando a área do conteúdo -->
      <v-container fluid class="pa-0">
        <v-sheet class="page-surface">
          <v-container class="py-8">
            <v-row>
              <v-col cols="12">
                <!-- Título grande sobre a faixa cinza -->
                <div class="text-h5 font-weight-black" style="color: #222">
                  Cadastro novo cliente
                </div>

                <!-- Card do formulário, branco e contido -->
                <v-card class="form-card rounded-xl elevation-1 mt-6">
                  <v-card-text class="pa-6">
                    <!-- ====== FORM ====== -->
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

                      <!-- Email -->
                      <div class="form-group">
                        <div class="label">Email</div>
                        <v-text-field
                          v-model="form.email"
                          :rules="[rules.required, rules.email]"
                          type="email"
                          variant="outlined"
                          density="comfortable"
                          flat
                          hide-details="auto"
                          placeholder="Insira o Email do Cliente"
                          required
                        />
                      </div>

                      <!-- Senha -->
                      <div class="form-group">
                        <div class="label">Senha para login</div>
                        <v-text-field
                          v-model="form.senha"
                          :type="showPwd ? 'text' : 'password'"
                          :rules="[rules.required, rules.min6]"
                          variant="outlined"
                          density="comfortable"
                          flat
                          hide-details="auto"
                          placeholder="Insira a senha que será utilizada para login do cliente"
                          :append-inner-icon="showPwd ? 'mdi-eye-off' : 'mdi-eye'"
                          @click:append-inner="showPwd = !showPwd"
                          required
                        />
                      </div>

                      <!-- Logo (dropzone) -->
                      <div class="form-group">
                        <div class="label">Logo do Cliente</div>
                        <v-sheet
                          class="dropzone rounded-lg elevation-0 d-flex align-center justify-center"
                          color="white"
                          @click="pickLogo"
                          @dragover.prevent="dragOver = true"
                          @dragleave.prevent="dragOver = false"
                          @drop.prevent="handleDrop"
                        >
                          <div class="text-center">
                            <v-icon size="40">mdi-tray-arrow-up</v-icon>
                            <div class="text-body-2 mt-2">
                              Arraste o arquivo aqui ou clique para enviar
                            </div>
                            <div v-if="logoFileName" class="text-caption mt-1 text-medium-emphasis">
                              {{ logoFileName }}
                            </div>
                          </div>
                          <input
                            ref="logoInput"
                            type="file"
                            accept="image/*"
                            class="d-none"
                            @change="handleFileChange"
                          />
                        </v-sheet>
                      </div>

                      <!-- Descrição -->
                      <div class="form-group">
                        <div class="label">Descrição</div>
                        <v-textarea
                          v-model="form.descricao"
                          variant="outlined"
                          density="comfortable"
                          flat
                          hide-details
                          auto-grow
                          placeholder="Insira descrição sobre cliente"
                        />
                      </div>

                      <v-btn
                        type="submit"
                        color="primary"
                        class="text-none font-weight-bold rounded-lg btn-cadastrar"
                        style="height: 36px"
                        :loading="saving"
                        :disabled="saving"
                      >
                        Cadastrar Cliente
                      </v-btn>
                    </v-form>
                    <!-- ====== /FORM ====== -->
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

const router = useRouter()
const drawer = ref(true)
const avatarUrl = 'https://avatars.githubusercontent.com/u/9919?s=64&v=4'
const saving = ref(false)

/** Mock de criação de cliente (trocar por chamada ao backend depois) */
function createClientMock(payload: {
  nome: string
  email: string
  senha: string
  descricao: string
  logo: File | null
}) {
  // Simula um retorno do backend
  const id = Date.now()
  return Promise.resolve({ id, ...payload })
}

const form = ref({
  nome: '',
  email: '',
  senha: '',
  descricao: '',
  logo: null as File | null,
})

/** v-form ref + regras */
import { VForm } from 'vuetify/components'

const formRef = ref<InstanceType<typeof VForm> | null>(null)

const rules = {
  required: (v: string | null | undefined) => !!(v && String(v).trim()) || 'Campo obrigatório',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Email inválido',
  min6: (v: string) => (v?.length ?? 0) >= 6 || 'Mínimo de 6 caracteres',
}

const showPwd = ref(false)
const logoInput = ref<HTMLInputElement | null>(null)
const logoFileName = ref<string>('')
const dragOver = ref(false)

function pickLogo() {
  logoInput.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (file) {
    form.value.logo = file
    logoFileName.value = file.name
  }
  if (target) target.value = ''
}

function handleDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    form.value.logo = file
    logoFileName.value = file.name
  }
}

/* Navegação (mesmo padrão do seu app) */
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

/* Submit com validação do v-form */
async function submit() {
  const res = await formRef.value?.validate()
  if (!res?.valid) return

  saving.value = true
  try {
    const payload = { ...form.value }
    // TODO: trocar por chamada real (ex.: await api.post('/clientes', payload))
    const novoCliente = await createClientMock(payload)

    // Redireciona para o Dashboard após criar
    await router.push({ name: 'HomeAdmin', query: { createdClientId: String(novoCliente.id) } })
  } catch (err) {
    console.error('Erro ao criar cliente:', err)
    // aqui você pode mostrar um snackbar/toast de erro
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.v-application {
  background: #2b2b2b !important; /* fundo geral do app */
}

/* Superfície clara abaixo do app-bar */
.page-surface {
  background: #d9d9d9;
  min-height: calc(100vh - 80px); /* altura total menos a app-bar */
  padding-top: 24px;
  padding-bottom: 56px;
}

/* Título da página */
.page-title {
  color: #222;
  letter-spacing: -0.5px;
}

/* Card branco centralizado */
.form-card {
  background: #ffffff;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
}

/* Labels acima dos campos */
.form-group + .form-group {
  margin-top: 12px;
}
.label {
  font-size: 14px;
  color: #222;
  margin-bottom: 6px;
  font-weight: 600;
}

/* Aparência dos inputs outlined */
.form-card :deep(.v-field--variant-solo) {
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
}

/* Dropzone para upload do logo */
.dropzone {
  height: 140px;
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

/* Botões */
.v-btn {
  text-transform: none;
}
.btn-cadastrar {
  margin-top: 24px;
  margin-bottom: 4px;
}

/* Responsivo */
@media (max-width: 1024px) {
  .form-card {
    margin: 0 12px;
  }
}
</style>
