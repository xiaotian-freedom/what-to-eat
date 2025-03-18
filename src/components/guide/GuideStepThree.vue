<template>
  <div
    id="step3"
    class="w-[80%] bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative"
    :class="[isActive ? 'flex' : 'hidden', isFlying ? 'fly-up-out' : '']"
  >
    <div
      class="w-full h-full bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-100 flex flex-col items-center justify-between p-6 relative"
    >
      <!-- 中间插图区域 -->
      <div class="flex-1 flex flex-col items-center justify-center relative w-full">
        <!-- 装饰图形 -->
        <div class="absolute inset-0 pointer-events-none">
          <div class="w-full h-full rotate-slow opacity-20">
            <div class="w-48 h-48 rounded-full bg-purple-600 absolute top-10 -left-20"></div>
            <div class="w-48 h-48 rounded-full bg-pink-500 absolute bottom-10 -right-20"></div>
            <div class="w-32 h-32 rounded-full bg-indigo-500 absolute top-40 right-10"></div>
          </div>
        </div>

        <!-- 引导内容：成功准备好的图示 -->
        <div class="relative z-10 mb-6 flex flex-col items-center">
          <!-- 主要视觉元素：一个大的成功图标或应用logo -->
          <div
            class="w-36 h-36 rounded-full bg-white bg-opacity-60 backdrop-filter backdrop-blur-md flex items-center justify-center shadow-xl mb-8 pulse-animation"
          >
            <div
              class="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
            >
              <img :src="UtensilsIcon" class="w-12 h-12" />
            </div>
          </div>

          <!-- 动画元素：三个小圆点围绕主元素旋转 -->
          <div
            class="absolute w-48 h-48 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-slow"
          >
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div
                class="w-6 h-6 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 shadow-md float-animation"
              ></div>
            </div>
            <div class="absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2">
              <div
                class="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 shadow-md float-animation"
                style="animation-delay: 0.5s"
              ></div>
            </div>
            <div class="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2">
              <div
                class="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-teal-500 shadow-md float-animation"
                style="animation-delay: 1s"
              ></div>
            </div>
          </div>
        </div>

        <!-- 引导内容：文字说明 -->
        <div class="text-center z-10 max-w-xs">
          <h2 class="text-2xl font-bold text-gray-800 mb-3">一切准备就绪！</h2>
          <p class="text-gray-600 mb-3 text-sm">您的美食决策助手已经准备好了</p>
          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-start">
              <div
                class="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-2"
              >
                <img :src="CheckIcon" class="w-3 h-3 text-white" />
              </div>
              <p class="text-sm text-gray-600">随机选择喜爱的美食</p>
            </div>
            <div class="flex items-center justify-start">
              <div
                class="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-2"
              >
                <img :src="CheckIcon" class="w-3 h-3 text-white" />
              </div>
              <p class="text-sm text-gray-600">自定义个人菜品库</p>
            </div>
            <div class="flex items-center justify-start">
              <div
                class="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-2"
              >
                <img :src="CheckIcon" class="w-3 h-3 text-white" />
              </div>
              <p class="text-sm text-gray-600">精美动画与统计数据</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部控制区域 -->
      <div class="w-full mt-4">
        <!-- 分页指示器 -->
        <div class="flex justify-center mb-4">
          <div class="w-2.5 h-2.5 rounded-full bg-gray-300 mx-1"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-gray-300 mx-1"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-purple-500 mx-1"></div>
        </div>

        <!-- 按钮 -->
        <button
          class="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center justify-center"
          @click="$emit('start')"
        >
          <img :src="SmileIcon" class="w-5 h-5 mr-2" />
          开始使用
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import UtensilsIcon from '@/assets/icons/utensils.svg';
  import CheckIcon from '@/assets/icons/check.svg';
  import SmileIcon from '@/assets/icons/smile.svg';
  defineProps({
    isActive: {
      type: Boolean,
      default: false,
    },
    isFlying: {
      type: Boolean,
      default: false,
    },
  });

  defineEmits(['start']);
</script>
