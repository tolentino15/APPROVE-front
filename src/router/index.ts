// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getToken, getRole } from '@/auth'
import type { UserRole } from '@/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginScreen.vue'),
    meta: { hideChrome: true },
  },
  {
    path: '/',
    name: 'HomeAdmin',
    component: () => import('@/views/HomeAdmin.vue'),
    meta: { requiresAuth: true, roles: ['admin'] as UserRole[] },
  },
  {
    path: '/board',
    name: 'BoardAdmin',
    component: () => import('@/views/BoardAdmin.vue'),
    meta: { requiresAuth: true, roles: ['client'] as UserRole[] },
  },
  {
    path: '/calendar',
    name: 'CalendarAdmin',
    component: () => import('@/views/CalendarAdmin.vue'),
    meta: { requiresAuth: true, roles: ['admin'] as UserRole[] },
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

function homeFor(role: UserRole) {
  return role === 'admin' ? { name: 'HomeAdmin' } : { name: 'BoardAdmin' }
}

router.beforeEach((to) => {
  const token = getToken()
  const role = getRole()

  if (!to.meta?.requiresAuth) {
    if (to.name === 'Login' && token && role) return homeFor(role)
    return true
  }

  if (!token || !role) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  const allowed = to.meta.roles as UserRole[] | undefined
  if (allowed && !allowed.includes(role)) return homeFor(role)

  return true
})

export default router
