import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'HomeAdmin', component: () => import('../views/HomeAdmin.vue') },
    { path: '/login', name: 'Login', component: () => import('../views/LoginScreen.vue') },
    {
      path: '/home-cliente',
      name: 'HomeCliente',
      component: () => import('../views/HomeCliente.vue'),
    },
    {
      path: '/board-cliente',
      name: 'BoardCliente',
      component: () => import('../views/BoardCliente.vue'),
    },
    {
      path: '/cadastro-cliente',
      name: 'CadastroCliente',
      component: () => import('../views/CadastroCliente.vue'),
    },
    {
      path: '/cadastro-job',
      name: 'CadastroJob',
      component: () => import('../views/CadastroJob.vue'),
    },
    {
      path: '/board-admin',
      name: 'BoardAdmin',
      component: () => import('../views/BoardAdmin.vue'),
    },
    {
      path: '/calendario',
      name: 'CalendarAdmin',
      component: () => import('../views/CalendarAdmin.vue'),
    },
  ],
})

export default router
