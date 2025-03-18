import { createRouter, createWebHistory } from 'vue-router';
import GuidePage from '@/views/Guide.vue';
import HomePage from '@/views/Home.vue';
import AddFoodPage from '@/views/AddFood.vue';
import FoodManagementPage from '@/views/FoodManagement.vue';
const routes = [
  {
    path: '/',
    name: 'Guide',
    component: GuidePage,
    meta: { transition: 'fade' },
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { transition: 'fade' },
  },
  {
    path: '/add-food',
    name: 'AddFood',
    component: AddFoodPage,
    meta: { transition: 'fade' },
  },
  {
    path: '/food-management',
    name: 'FoodManagement',
    component: FoodManagementPage,
    meta: { transition: 'fade' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
