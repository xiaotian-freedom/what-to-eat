import { createRouter, createWebHistory } from 'vue-router';
import GuidePage from '@/views/Guide.vue';
import HomePage from '@/views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Guide',
    component: GuidePage,
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
