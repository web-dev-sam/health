import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from './pages/LandingPage.vue'
import HomePage from './pages/HomePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LandingPage },
    { path: '/additives', component: HomePage },
    { path: '/sweeteners', component: () => import('./pages/SweetenerPage.vue') },
    { path: '/preservatives', component: () => import('./pages/PreservativesPage.vue') },
    { path: '/emulsifiers', component: () => import('./pages/EmulsifiersPage.vue') },
    { path: '/rfb', component: () => import('./pages/RFBPage.vue') },
    { path: '/nutr', redirect: 'https://nutr.webry.com' },
  ],
})

export default router
