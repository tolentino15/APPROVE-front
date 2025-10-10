<template>
  <v-app>
    <v-main class="auth-bg d-flex flex-column align-center justify-center">
      <!-- Logo -->
      <div class="text-center mb-6">
        <v-img
          src="/Logo.png"
          alt="Approv"
          width="4500"
          height="80"
          contain
          eager
          class="mx-auto"
        />
      </div>

      <v-card class="auth-card rounded-lg" elevation="8">
        <v-card-text class="pa-6">
          <v-form ref="formRef" v-model="formValid" @submit.prevent="onSubmit">
            <v-alert
              v-if="errorMsg"
              type="error"
              variant="tonal"
              class="mb-4"
              :text="errorMsg"
              density="comfortable"
            />

            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              autocomplete="username"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required, rules.email]"
              hide-details="auto"
              class="mb-3"
            />

            <v-text-field
              v-model="form.password"
              :type="showPwd ? 'text' : 'password'"
              label="Senha"
              autocomplete="current-password"
              variant="outlined"
              density="comfortable"
              :append-inner-icon="showPwd ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPwd = !showPwd"
              :rules="[rules.required, rules.min(6)]"
              hide-details="auto"
              class="mb-4"
            />

            <div class="d-flex align-center justify-space-between mb-4">
              <v-btn
                color="primary"
                class="text-none font-weight-bold"
                :loading="loading"
                type="submit"
              >
                Entrar
              </v-btn>

              <v-btn variant="text" size="small" class="text-none px-0" @click="recoverPassword">
                Esqueci minha senha
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { VForm } from 'vuetify/components'

/** Router para redirecionar após login */
const router = useRouter()
const route = useRoute()

/** Estado do formulário */
const formRef = ref<VForm | null>(null)
const formValid = ref(false)
const showPwd = ref(false)
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const form = ref({
  email: '',
  password: '',
})

/** Regras de validação */
const rules = {
  required: (v: string) => (!!v && v.toString().trim() !== '') || 'Obrigatório',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Informe um email válido',
  min: (n: number) => (v: string) => (v?.length ?? 0) >= n || `Mínimo de ${n} caracteres`,
}

/**
 * MOCK de autenticação para demonstração.
 * Troque pelo seu fetch/axios para a API.
 * Retorne o papel do usuário (admin/cliente) e o token.
 */

//  // depois do login bem-sucedido:
// localStorage.setItem('token', data.token)
// localStorage.setItem('role', data.role) // 'admin' | 'client'

// const redirect = (route.query.redirect as string) || null
// if (redirect) {
//   router.replace(redirect)
// } else {
//   router.replace(data.role === 'client' ? { name: 'BoardAdmin' } : { name: 'HomeAdmin' })
// }

async function fakeLoginApi(
  email: string,
  password: string,
): Promise<{ role: 'admin' | 'client'; token: string }> {
  await new Promise((r) => setTimeout(r, 700)) // simula latência

  // Regras fictícias p/ demo:
  if (email.toLowerCase().includes('admin')) {
    return { role: 'admin', token: 'mock-token-admin' }
  }
  if (email && password) {
    return { role: 'client', token: 'mock-token-client' }
  }
  throw new Error('Credenciais inválidas')
}

/** Submeter */
async function onSubmit() {
  errorMsg.value = null

  const ok = await formRef.value?.validate()
  if (!ok) return

  loading.value = true
  try {
    // Mock/real login (controlado por VITE_MOCK_AUTH)
    const useMock = String(import.meta.env.VITE_MOCK_AUTH).toLowerCase() === 'true'
    if (useMock) {
      const { role, token } = await fakeLoginApi(form.value.email, form.value.password)
      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
      const redirect = (route.query.redirect as string) || null
      if (redirect) {
        router.replace(redirect)
      } else {
        router.push(role === 'admin' ? { name: 'HomeAdmin' } : { name: 'BoardAdmin' })
      }
      return
    }
    // >>> TROQUE POR CHAMADA REAL AO BACKEND <<<
    const { role, token } = await fakeLoginApi(form.value.email, form.value.password)

    // Armazena token (ajuste para sua estratégia real)
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)

    // Redirecionamento por papel
    if (role === 'admin') {
      router.push({ name: 'HomeAdmin' }) // dashboard admin
    } else {
      // ajuste para a rota da área do cliente quando existir
      router.push({ name: 'BoardAdmin' }) // placeholder: leve para o board
    }
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : 'Falha no login'
  } finally {
    loading.value = false
  }
}

/** Ações auxiliares */
function recoverPassword() {
  // leve para "esqueci a senha" (quando existir)
  // router.push({ name: 'RecoverPassword' })
  alert('Fluxo de recuperação de senha será implementado.')
}
</script>

<style scoped>
/* Fundo em degradê */
.auth-bg {
  min-height: 100vh;
  background: linear-gradient(180deg, #1e50a1 0%, #0f2136 75%);
  padding: 48px 16px;
}

/* Logo “Approv” */
.brand {
  font-weight: 800;
  font-size: clamp(42px, 6vw, 72px);
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  user-select: none;
}
.brand-check {
  color: #00c896;
}

/* Card do formulário */
.auth-card {
  width: 360px;
  max-width: 92vw;
  backdrop-filter: blur(6px);
}
</style>
