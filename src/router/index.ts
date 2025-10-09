import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' // type-only (verbatimModuleSyntax)

// ---- Tipos simples de papel/role ----
export type UserRole = 'admin' | 'client'

// ---- Helpers de auth (troque depois por Pinia/decodificar JWT) ----
function getToken(): string | null {
  return localStorage.getItem('token')
}
function getCurrentRole(): UserRole | null {
  const r = localStorage.getItem('role')
  return r === 'admin' || r === 'client' ? r : null
}
function isAuthenticated(): boolean {
  return !!getToken() && !!getCurrentRole()
}

// ---- Rotas com meta.layout e meta.roles ----
const routes: RouteRecordRaw[] = [
  // LOGIN (pública, sem chrome, layout de auth)
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginScreen.vue'),
    meta: {
      public: true,
      hideChrome: true,
      layout: 'auth', // o App.vue escolhe o AuthLayout quando meta.layout === 'auth'
    },
  },

  // DASHBOARD / HOME (somente ADMIN)
  {
    path: '/',
    name: 'HomeAdmin',
    component: () => import('@/views/HomeAdmin.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'] as UserRole[],
      layout: 'default',
    },
  },

  // BOARD (ADMIN e CLIENTE)
  {
    path: '/board',
    name: 'BoardAdmin',
    component: () => import('@/views/BoardAdmin.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'client'] as UserRole[],
      layout: 'default',
    },
  },

  // CALENDÁRIO (ADMIN e CLIENTE)
  {
    path: '/calendar',
    name: 'CalendarAdmin',
    component: () => import('@/views/CalendarAdmin.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'client'] as UserRole[],
      layout: 'default',
    },
  },

  // CADASTRO DE CLIENTE (somente ADMIN)
  {
    path: '/clientes/cadastro',
    name: 'CadastroCliente',
    component: () => import('@/views/CadastroCliente.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'] as UserRole[],
      layout: 'default',
    },
  },

  // CADASTRO DE JOB (somente ADMIN)
  {
    path: '/jobs/cadastro',
    name: 'CadastroJob',
    component: () => import('@/views/CadastroJob.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'] as UserRole[],
      layout: 'default',
    },
  },

  // 404 simples (pública)
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: {
      template: '<div style="padding:24px">Página não encontrada. <a href="/">Voltar</a></div>',
    },
    meta: { public: true, layout: 'default' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ---- Guard global de autenticação e autorização ----
router.beforeEach((to) => {
  const isPublic = to.meta?.public === true
  const needsAuth = to.meta?.requiresAuth === true
  const role = getCurrentRole()

  // 1) Bloqueia não logados em rotas privadas
  if (!isPublic && needsAuth && !isAuthenticated()) {
    return {
      name: 'Login',
      query: { redirect: to.fullPath },
    }
  }

  // 2) Checa papel/role
  const allowedRoles = (to.meta?.roles as UserRole[] | undefined) ?? undefined
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Não autorizado — manda para a home do perfil
    return role === 'client' ? { name: 'BoardAdmin' } : { name: 'HomeAdmin' }
  }

  // 3) Se já estiver logado e tentar ir para /login, redireciona para a home do perfil
  if (isPublic && to.name === 'Login' && isAuthenticated()) {
    return role === 'client' ? { name: 'BoardAdmin' } : { name: 'HomeAdmin' }
  }

  // ok
  return true
})

export default router
