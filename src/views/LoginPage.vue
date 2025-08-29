<template>
  <div
    class="font-sans flex justify-center items-center px-5 w-full h-screen relative overflow-hidden"
    :class="`theme-gradient-${themeStore.currentTheme}`"
  >
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Floating geometric shapes -->
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
      <div class="floating-shape shape-5"></div>

      <!-- Gradient orbs -->
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>

      <!-- Animated grid pattern -->
      <div class="grid-pattern"></div>
    </div>

    <!-- Main Content Container -->
    <div class="relative z-10 w-full max-w-md">
      <!-- Floating Logo Section -->
      <div class="floating-logo-container mb-8">
        <div class="logo-orb">
          <div class="logo-inner">
            <img src="@/assets/icons/utensils.svg" alt="Logo" class="w-8 h-8" />
          </div>
          <div class="logo-glow"></div>
        </div>
        <div class="logo-text">
          <h1 class="text-xl font-bold">美食推荐</h1>
          <p class="text-sm opacity-70 mt-1">发现你的下一餐</p>
        </div>
      </div>

      <!-- Glassmorphism Login Card -->
      <div class="glass-card">
        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6 mt-8">
          <!-- Username Field -->
          <div class="floating-input-group">
            <div class="input-container">
              <div class="input-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <input
                v-model="form.username"
                type="text"
                placeholder="用户名"
                class="floating-input"
                :class="{ 'input-focused': usernameFocused }"
                @focus="usernameFocused = true"
                @blur="usernameFocused = false"
              />
              <div class="input-line"></div>
            </div>
          </div>

          <!-- Password Field -->
          <div class="floating-input-group">
            <div class="input-container">
              <div class="input-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <circle cx="12" cy="16" r="1"></circle>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="密码"
                class="floating-input"
                :class="{ 'input-focused': passwordFocused }"
                @focus="passwordFocused = true"
                @blur="passwordFocused = false"
              />
              <div class="input-line"></div>
              <button
                v-if="form.password"
                type="button"
                class="password-toggle"
                @click="togglePasswordVisibility"
              >
                <svg
                  v-if="showPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>

          <!-- Forgot Password Link -->
          <div class="text-right">
            <button
              type="button"
              @click="handleForgotPassword"
              class="text-sm hover:underline transition-all duration-300 hover:scale-105"
            >
              忘记密码？
            </button>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="loading"
            class="login-button ripple-btn"
            :class="{ loading: loading }"
          >
            <span class="button-content">
              <span v-if="!loading">登录</span>
              <span v-else class="loading-text">
                <span class="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                登录中
              </span>
            </span>
            <div class="button-glow"></div>
          </button>

          <!-- Register Link -->
          <div class="text-center">
            <span class="text-sm opacity-70">还没有账户？</span>
            <button
              type="button"
              @click="handleRegister"
              class="text-sm font-medium ml-1 hover:underline transition-all duration-300 hover:scale-105"
            >
              立即注册
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import { useThemeStore } from '@/stores/theme';
  import { showSuccessToast, showFailToast } from 'vant';

  const router = useRouter();
  const userStore = useUserStore();
  const themeStore = useThemeStore();

  // Form data
  const form = reactive({
    username: '',
    password: '',
    rememberMe: false,
  });

  // Form validation errors
  const errors = reactive({
    username: '',
    password: '',
  });

  // Loading state
  const loading = ref(false);

  // Input focus states
  const usernameFocused = ref(false);
  const passwordFocused = ref(false);

  // Password visibility state
  const showPassword = ref(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    errors.username = '';
    errors.password = '';

    if (!form.username.trim()) {
      errors.username = '请输入用户名';
      isValid = false;
    }

    if (!form.password) {
      errors.password = '请输入密码';
      isValid = false;
    } else if (form.password.length < 6) {
      errors.password = '密码长度至少6位';
      isValid = false;
    }

    return isValid;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) return;

    loading.value = true;
    try {
      const success = await userStore.login({
        username: form.username,
        password: form.password,
      });

      if (success) {
        showSuccessToast('登录成功');

        // Save remember me preference
        if (form.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('savedUsername', form.username);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('savedUsername');
        }

        // Redirect to home page
        router.replace('/home');
      } else {
        showFailToast('登录失败，请检查用户名和密码');
      }
    } catch (error) {
      showFailToast('登录失败，请稍后重试');
      console.error('Login error:', error);
    } finally {
      loading.value = false;
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    showFailToast('功能开发中...');
  };

  // Handle register
  const handleRegister = () => {
    showFailToast('功能开发中...');
  };

  // Load saved credentials on mount
  const loadSavedCredentials = () => {
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe === 'true') {
      const savedUsername = localStorage.getItem('savedUsername');
      if (savedUsername) {
        form.username = savedUsername;
        form.rememberMe = true;
      }
    }
  };

  // Load saved credentials when component mounts
  loadSavedCredentials();
</script>

<style scoped>
  /* Animated Background Elements */
  .floating-shape {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
    opacity: 0.1;
    animation: float 6s ease-in-out infinite;
  }

  .shape-1 {
    width: 80px;
    height: 80px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  .shape-2 {
    width: 120px;
    height: 120px;
    top: 20%;
    right: 15%;
    animation-delay: 2s;
  }

  .shape-3 {
    width: 60px;
    height: 60px;
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
  }

  .shape-4 {
    width: 100px;
    height: 100px;
    bottom: 30%;
    right: 10%;
    animation-delay: 1s;
  }

  .shape-5 {
    width: 40px;
    height: 40px;
    top: 60%;
    left: 50%;
    animation-delay: 3s;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
    }
  }

  /* Gradient Orbs */
  .gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.3;
    animation: orbFloat 8s ease-in-out infinite;
  }

  .orb-1 {
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, var(--color-primary), transparent);
    top: -100px;
    left: -100px;
    animation-delay: 0s;
  }

  .orb-2 {
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, var(--color-secondary), transparent);
    bottom: -75px;
    right: -75px;
    animation-delay: 4s;
  }

  .orb-3 {
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, var(--color-accent), transparent);
    top: 50%;
    right: 10%;
    animation-delay: 2s;
  }

  @keyframes orbFloat {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(30px, -30px) scale(1.1);
    }
  }

  /* Grid Pattern */
  .grid-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: gridMove 20s linear infinite;
  }

  @keyframes gridMove {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(50px, 50px);
    }
  }

  /* Floating Logo */
  .floating-logo-container {
    text-align: center;
    animation: logoFloat 4s ease-in-out infinite;
  }

  @keyframes logoFloat {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .logo-orb {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
  }

  .logo-inner {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    position: relative;
    z-index: 2;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .logo-glow {
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    border-radius: 50%;
    opacity: 0.3;
    filter: blur(20px);
    animation: logoGlow 3s ease-in-out infinite;
  }

  @keyframes logoGlow {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.5;
    }
  }

  /* Logo Text */
  .logo-text {
    text-align: center;
    margin-top: 16px;
  }

  .logo-text h1 {
    color: var(--color-text);
    margin-bottom: 4px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .logo-text p {
    color: var(--color-textSecondary);
    font-size: 14px;
    opacity: 0.8;
  }

  /* Glassmorphism Card */
  .glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    padding: 40px 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;
  }

  .glass-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    border-radius: 24px;
    z-index: -1;
  }

  /* Card Header */
  .card-header {
    text-align: center;
    margin-bottom: 30px;
  }

  .card-header h2 {
    color: var(--color-text);
    margin-bottom: 8px;
  }

  .card-header p {
    color: var(--color-textSecondary);
  }

  /* Floating Input Groups */
  .floating-input-group {
    position: relative;
  }

  .input-container {
    position: relative;
    margin-bottom: 20px;
  }

  .input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-textSecondary);
    z-index: 2;
    transition: all 0.3s ease;
  }

  .floating-input {
    width: 100%;
    padding: 16px 16px 16px 48px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: var(--color-text);
    font-size: 16px;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .floating-input::placeholder {
    color: var(--color-textSecondary);
    opacity: 0.7;
  }

  .floating-input:focus {
    outline: none;
    border-color: var(--color-primary);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .floating-input:focus + .input-icon {
    color: var(--color-primary);
    transform: translateY(-50%) scale(1.1);
  }

  .input-line {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
    transition: width 0.3s ease;
  }

  .input-focused .input-line {
    width: 100%;
  }

  .password-toggle {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--color-textSecondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  .password-toggle:hover {
    color: var(--color-primary);
    background: rgba(255, 255, 255, 0.1);
  }

  /* Login Button */
  .login-button {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .login-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  .login-button:active {
    transform: translateY(0);
  }

  .login-button.loading {
    pointer-events: none;
  }

  .button-content {
    position: relative;
    z-index: 2;
  }

  .button-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .login-button:hover .button-glow {
    opacity: 0.3;
  }

  /* Loading Animation */
  .loading-text {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .loading-dots {
    display: flex;
    gap: 4px;
  }

  .loading-dots span {
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    animation: loadingDot 1.4s ease-in-out infinite both;
  }

  .loading-dots span:nth-child(1) {
    animation-delay: -0.32s;
  }
  .loading-dots span:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes loadingDot {
    0%,
    80%,
    100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .glass-card {
      padding: 30px 20px;
    }

    .floating-shape {
      display: none;
    }

    .gradient-orb {
      opacity: 0.2;
    }
  }

  /* Dark theme adjustments */
  body.theme-dark .glass-card {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }

  body.theme-dark .floating-input {
    background: rgba(30, 41, 59, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }

  body.theme-dark .floating-input:focus {
    background: rgba(30, 41, 59, 0.7);
  }
</style>
