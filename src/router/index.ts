import { createRouter, createWebHistory } from 'vue-router';
import GuidePage from '@/views/GuidePage.vue';
import HomePage from '@/views/HomePage.vue';
import AddFoodPage from '@/views/AddFoodPage.vue';
import FoodManagementPage from '@/views/FoodManagementPage.vue';
import SettingsPage from '@/views/SettingsPage.vue';
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
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    meta: { transition: 'fade' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
