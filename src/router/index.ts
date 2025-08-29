import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import GuidePage from '@/views/GuidePage.vue';
import HomePage from '@/views/HomePage.vue';
import AddFoodPage from '@/views/AddFoodPage.vue';
import FoodManagementPage from '@/views/FoodManagementPage.vue';
import SettingsPage from '@/views/SettingsPage.vue';
import LoginPage from '@/views/LoginPage.vue';
import RegisterPage from '@/views/RegisterPage.vue';
const routes = [
  {
    path: '/',
    name: 'Guide',
    component: GuidePage,
    meta: { transition: 'fade' },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { transition: 'fade' },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
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

// Navigation guard for authentication (optional login)
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();
  const isAuthenticated = userStore.isAuthenticated;

  // If user is already authenticated and trying to access login, redirect to home
  if (to.path === '/login' && isAuthenticated) {
    next('/home');
  } else {
    // Allow access to all routes - login is optional
    next();
  }
});

export default router;
