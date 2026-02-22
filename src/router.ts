import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/sweeteners', component: () => import('./pages/SweetenerPage.vue') },
    { path: '/preservatives', component: () => import('./pages/PreservativesPage.vue') },
    { path: '/emulsifiers', component: () => import('./pages/EmulsifiersPage.vue') },
  ],
})

export default router
