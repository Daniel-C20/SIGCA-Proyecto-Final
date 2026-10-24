import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' };
  },
  routes: [
    { path: '/', name: 'home', component: () => import('../views/PublicHome.vue') },
    { path: '/admin/login', name: 'login', component: () => import('../views/AdminLogin.vue'), meta: { guestOnly: true } },
    { path: '/admin', name: 'admin', component: () => import('../views/AdminDashboard.vue'), meta: { requiresAuth: true, roles: ['ADMINISTRADOR'] } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth) {
    if (!auth.token) return { name: 'login', query: { next: to.fullPath } };
    const user = await auth.loadCurrentUser();
    if (!user) return { name: 'login' };
    if (to.meta.roles && !to.meta.roles.includes(user.role)) return { name: 'home' };
  }
  if (to.meta.guestOnly && auth.token) {
    const user = await auth.loadCurrentUser();
    if (user?.role === 'ADMINISTRADOR') return { name: 'admin' };
  }
});

export default router;
