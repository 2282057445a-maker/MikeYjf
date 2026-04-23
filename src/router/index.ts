import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('../views/Login.vue'),
      meta: { title: '登录' }
    },
    { path: '/', redirect: '/login' },
    {
      path: '/app',
      component: MainLayout,
      children: [
        {
          path: 'dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: { title: 'Dashboard' }
        },
        {
          path: 'chat',
          component: () => import('../views/Chat.vue'),
          meta: { title: 'Chat', fullscreen: true }
        },
        {
          path: 'settings',
          component: () => import('../views/Settings.vue'),
          meta: { title: 'Settings' }
        },
      ],
    },
  ],
})

// 动态设置浏览器标签页标题
router.afterEach((to) => {
  const title = to.meta?.title as string
  document.title = title ? `${title} · MikeChat` : 'MikeChat'
})

export default router
