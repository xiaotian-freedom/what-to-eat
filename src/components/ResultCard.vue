<template>
  <div
    id="resultPage"
    class="card-face bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative flex flex-col w-full h-full"
  >
    <!-- 顶部状态栏 -->
    <HeaderBar title="选择结果" :showBackButton="false" :centerTitle="true" />

    <!-- 内容区域 -->
    <div
      class="h-full flex flex-col items-center p-6 relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
    >
      <!-- 选中结果展示 -->
      <div
        class="w-64 h-64 rounded-full bg-white backdrop-filter backdrop-blur-lg shadow-xl flex flex-col items-center justify-center mt-3"
      >
        <div class="w-full h-full rounded-full overflow-hidden shadow-lg relative">
          <!-- 有图片时显示图片 -->
          <template v-if="shouldShowImage()">
            <img
              :src="selectedDish!.image"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
          </template>

          <!-- 无图片时显示背景颜色和首字母 -->
          <div
            v-else-if="selectedDish"
            class="w-full h-full flex items-center justify-center"
            :style="{ backgroundColor: selectedDish.backgroundColor || '#4A5568' }"
          >
            <span class="text-white text-6xl font-bold">{{ selectedDish.name.charAt(0) }}</span>
          </div>

          <!-- 底部名称显示 -->
          <div
            class="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-filter backdrop-blur-sm p-2 text-center"
          >
            <p class="text-lg font-medium text-white">{{ selectedDish?.name }}</p>
          </div>
        </div>
      </div>

      <!-- 底部按钮区域 -->
      <div class="mt-auto pt-6 w-full">
        <ActionButtons
          :disabled="false"
          :showMainButtons="false"
          @chooseAgain="$emit('choose-again')"
          @shareResult="$emit('share-result')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import type { Dish } from '@/types';
  import ActionButtons from './ActionButtons.vue';
  import HeaderBar from '@/components/HeaderBar.vue';

  const props = defineProps<{
    selectedDish: Dish | null;
  }>();

  // 存储图片加载失败的状态
  const imageLoadFailed = ref(false);

  // 处理图片加载失败
  const handleImageError = (): void => {
    imageLoadFailed.value = true;
  };

  // 检查是否应该显示图片
  const shouldShowImage = (): boolean => {
    return !!(props.selectedDish?.image && !imageLoadFailed.value);
  };

  defineEmits<{
    (e: 'choose-again'): void;
    (e: 'share-result'): void;
  }>();
</script>
