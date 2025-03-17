<template>
  <div
    id="step2"
    class="w-80 bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative"
    :class="[
      isActive ? 'flex' : 'hidden',
      isFlying ? 'fly-up-out' : '',
      animationsEnabled ? 'animation-ready' : '',
    ]"
  >
    <div
      class="w-full h-full bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-100 flex flex-col items-center justify-between p-6 relative"
    >
      <!-- 顶部跳过按钮 -->
      <div class="self-end">
        <button
          class="py-1.5 px-3 bg-white bg-opacity-50 backdrop-filter backdrop-blur-sm border border-white border-opacity-30 rounded-full text-sm text-gray-700 ripple-btn"
          @click="$emit('skip')"
        >
          跳过
        </button>
      </div>

      <!-- 中间插图区域 -->
      <div class="flex-1 flex flex-col items-center justify-center relative w-full">
        <!-- 装饰图形 -->
        <div class="absolute inset-0 flex items-center justify-center opacity-20">
          <div class="w-48 h-48 rounded-full bg-indigo-500 absolute"></div>
          <div class="w-40 h-40 rounded-full bg-purple-500 absolute -left-10"></div>
        </div>

        <!-- 引导内容：图示 -->
        <div class="relative z-10 mb-6 flex flex-col items-center">
          <!-- 自定义菜品管理插图 -->
          <div
            class="w-64 h-52 bg-white/50 backdrop-filter backdrop-blur-md rounded-2xl shadow-lg p-4 mb-6 transform rotate-3 float-animation"
          >
            <div class="w-full h-full flex flex-col">
              <div class="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1 text-purple-500"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                我的菜品列表
              </div>

              <!-- 菜品列表示例 -->
              <div class="space-y-2 flex-1">
                <div
                  class="flex items-center bg-white bg-opacity-70 rounded-lg p-1.5 transform transition-all hover:scale-105"
                  style="
                    animation: fadeIn 0.5s ease-out forwards;
                    opacity: 0;
                    animation-delay: 0.2s;
                  "
                >
                  <div
                    class="w-8 h-8 rounded-lg overflow-hidden mr-2 pulse-animation"
                    style="animation-delay: 0.5s"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1555126634-323283e090fa"
                      class="w-full h-full object-cover"
                      alt="菜品"
                    />
                  </div>
                  <span class="text-xs font-medium text-gray-700">红烧肉</span>
                </div>
                <div
                  class="flex items-center bg-white bg-opacity-70 rounded-lg p-1.5 transform transition-all hover:scale-105"
                  style="
                    animation: fadeIn 0.5s ease-out forwards;
                    opacity: 0;
                    animation-delay: 0.4s;
                  "
                >
                  <div
                    class="w-8 h-8 rounded-lg overflow-hidden mr-2 pulse-animation"
                    style="animation-delay: 1s"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1585032226651-759b368d7246"
                      class="w-full h-full object-cover"
                      alt="菜品"
                    />
                  </div>
                  <span class="text-xs font-medium text-gray-700">麻婆豆腐</span>
                </div>
                <div
                  class="flex items-center bg-white bg-opacity-70 rounded-lg p-1.5 transform transition-all hover:scale-105"
                  style="
                    animation: fadeIn 0.5s ease-out forwards;
                    opacity: 0;
                    animation-delay: 0.6s;
                  "
                >
                  <div
                    class="w-8 h-8 rounded-lg overflow-hidden mr-2 pulse-animation"
                    style="animation-delay: 1.5s"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1512058556646-c4da40fba323"
                      class="w-full h-full object-cover"
                      alt="菜品"
                    />
                  </div>
                  <span class="text-xs font-medium text-gray-700">汉堡</span>
                </div>
              </div>

              <!-- 添加按钮示意 -->
              <div class="mt-2">
                <div
                  class="py-1 px-2 bg-purple-100 rounded-md text-purple-600 text-xs font-medium inline-flex items-center transform transition-all hover:scale-105 pulse-animation"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="mr-1"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  添加菜品
                </div>
              </div>
            </div>
          </div>

          <!-- 添加漂浮的食物图标背景 -->
          <div
            class="absolute -right-5 top-10 w-16 h-16 opacity-50 float-animation"
            style="animation-delay: 0.7s"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              class="w-full h-full text-purple-300"
            >
              <path d="M15 11h.01M11 15h.01M16 16h.01M10 10h.01" />
              <path
                d="M19 9c0-1.3-2.5-1.5-3.5-1.5-1.2 0-3.6.2-4 1.5-2.6.2-4.5 1.3-4.5 3.5 0 .7.2.9.9 1.5M20 13c.2 0 .4-.8.4-1.5 0-1.3-.9-2.5-2.4-2.5"
              />
            </svg>
          </div>
          <div
            class="absolute -left-4 bottom-20 w-12 h-12 opacity-40 float-animation"
            style="animation-delay: 1.2s"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              class="w-full h-full text-indigo-400"
            >
              <path d="M11 12H3M4 8h15M17 16H5" />
            </svg>
          </div>
          <div
            class="absolute right-10 -bottom-5 w-14 h-14 opacity-45 float-animation"
            style="animation-delay: 0.2s"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              class="w-full h-full text-pink-300"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
        </div>

        <!-- 引导内容：文字说明 -->
        <div class="text-center z-10">
          <h2
            class="text-2xl font-bold text-gray-800 mb-2"
            style="animation: popUp 0.5s ease-out forwards"
          >
            自定义你的菜单
          </h2>
          <p
            class="text-gray-600 mb-1 text-sm"
            style="animation: slideUp 0.5s ease-out forwards; animation-delay: 0.2s; opacity: 0"
          >
            添加你喜欢的菜品到列表中
          </p>
          <p
            class="text-gray-600 text-sm"
            style="animation: slideUp 0.5s ease-out forwards; animation-delay: 0.4s; opacity: 0"
          >
            再也不用担心没有选择范围
          </p>
        </div>
      </div>

      <!-- 底部控制区域 -->
      <div class="w-full mt-6">
        <!-- 分页指示器 -->
        <div class="flex justify-center mb-4">
          <div class="w-2.5 h-2.5 rounded-full bg-gray-300 mx-1"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-purple-500 mx-1"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-gray-300 mx-1"></div>
        </div>

        <!-- 按钮 -->
        <button
          class="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg transform transition hover:scale-105 active:scale-95"
          @click="$emit('next', 3)"
        >
          下一步
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { watch, ref } from 'vue';

  const props = defineProps({
    isActive: {
      type: Boolean,
      default: false,
    },
    isFlying: {
      type: Boolean,
      default: false,
    },
  });

  defineEmits(['skip', 'next']);

  // 控制动画开始的变量
  const animationsEnabled = ref(false);

  // 监听isActive变化，延迟启动动画
  watch(
    () => props.isActive,
    newVal => {
      if (newVal) {
        // 当组件变为激活状态时，延迟300ms后启用动画
        animationsEnabled.value = false;
        setTimeout(() => {
          animationsEnabled.value = true;
        }, 300);
      } else {
        animationsEnabled.value = false;
      }
    }
  );
</script>

<style scoped>
  /* 基础动画类 */
  .animation-ready .float-animation {
    animation: float 3s ease-in-out infinite;
  }

  .animation-ready .pulse-animation {
    animation: pulse 2s ease-in-out infinite;
  }

  .animation-ready [style*='animation: fadeIn'] {
    animation: fadeIn 0.5s ease-out forwards;
  }

  .animation-ready [style*='animation: slideUp'] {
    animation: slideUp 0.5s ease-out forwards;
  }

  .animation-ready [style*='animation: popUp'] {
    animation: popUp 0.5s ease-out forwards;
  }

  /* 动画定义 */
  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes popUp {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    70% {
      transform: scale(1.05);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
