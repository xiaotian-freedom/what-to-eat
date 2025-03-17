<template>
  <div
    id="step1"
    class="w-80 bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative"
    :class="[isActive ? 'flex' : 'hidden', isFlying ? 'fly-up-out' : '']"
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
          <div class="w-48 h-48 rounded-full bg-purple-500 absolute"></div>
          <div class="w-40 h-40 rounded-full bg-pink-500 absolute -right-10"></div>
        </div>

        <!-- 引导内容：图示 -->
        <div class="relative z-10 mb-6 h-60 flex items-center justify-center">
          <!-- 浮动动画的食物图片 -->
          <div class="w-28 h-28 absolute top-0 left-10 float-animation">
            <div
              class="w-full h-full rounded-full bg-white bg-opacity-70 backdrop-filter backdrop-blur-md shadow-lg flex items-center justify-center"
            >
              <div class="w-20 h-20 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1512058556646-c4da40fba323"
                  class="w-full h-full object-cover"
                  alt="汉堡"
                />
              </div>
            </div>
          </div>
          <div class="w-24 h-24 absolute top-10 right-4 float-animation float-animation-delay-1">
            <div
              class="w-full h-full rounded-full bg-white bg-opacity-70 backdrop-filter backdrop-blur-md shadow-lg flex items-center justify-center"
            >
              <div class="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1585032226651-759b368d7246"
                  class="w-full h-full object-cover"
                  alt="麻婆豆腐"
                />
              </div>
            </div>
          </div>
          <div class="w-20 h-20 absolute bottom-0 left-16 float-animation float-animation-delay-2">
            <div
              class="w-full h-full rounded-full bg-white bg-opacity-70 backdrop-filter backdrop-blur-md shadow-lg flex items-center justify-center"
            >
              <div class="w-14 h-14 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1563379926898-05f4575a45d8"
                  class="w-full h-full object-cover"
                  alt="水煮鱼"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 引导内容：文字说明 -->
        <div class="text-center z-10">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">不知道吃什么？</h2>
          <p class="text-gray-600 mb-1 text-sm">点击随机按钮，让我来帮你决定！</p>
          <p class="text-gray-600 text-sm">精美动画，高效决策，不再纠结。</p>
        </div>
      </div>

      <!-- 底部控制区域 -->
      <div class="w-full mt-6">
        <!-- 分页指示器 -->
        <div class="flex justify-center mb-4">
          <div class="w-2.5 h-2.5 rounded-full bg-purple-500 mx-1"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-gray-300 mx-1"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-gray-300 mx-1"></div>
        </div>

        <!-- 按钮 -->
        <button
          class="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg transform transition hover:scale-105 active:scale-95"
          @click="$emit('next', 2)"
        >
          下一步
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
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

  defineEmits(['skip', 'next']);
</script>
