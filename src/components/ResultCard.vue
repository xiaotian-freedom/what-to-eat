<template>
  <div
    id="resultPage"
    class="card-face bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative flex flex-col w-full h-full"
  >
    <!-- 顶部状态栏 -->
    <HeaderBar
      :title="$t('pages.result')"
      :showBackButton="true"
      :centerTitle="true"
      @back="$emit('choose-again')"
    />

    <!-- 内容区域 -->
    <div
      class="h-full overflow-y-auto flex flex-col items-center p-6 relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
    >
      <!-- 选中结果展示 -->
      <div
        class="w-[160px] h-[160px] rounded-full bg-white backdrop-filter backdrop-blur-lg shadow-xl flex flex-col items-center justify-center flex-shrink-0"
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
            class="w-full h-full rounded-full flex items-center justify-center"
            :style="{ backgroundColor: selectedDish.backgroundColor || 'var(--color-primary)' }"
          >
            <span
              class="text-6xl font-bold"
              :style="{
                textShadow: getTextShadow(
                  getContrastTextColor(
                    selectedDish.backgroundColor || getThemeColor('--color-primary')
                  )
                ),
              }"
            >
              {{ selectedDish.name.charAt(0) }}
            </span>
          </div>

          <!-- 底部名称显示 -->
          <div
            class="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-filter backdrop-blur-sm p-2 text-center overflow-hidden"
          >
            <div
              class="marquee-container"
              :class="{ 'is-marquee': needsMarquee && isMarqueeActive }"
            >
              <p class="text-lg font-medium text-white marquee-text" ref="dishNameRef">
                {{ selectedDish?.name }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 菜品介绍区域 - 使用flex-1和min-h-0确保正确的滚动行为 -->
      <div class="w-full flex-1 min-h-0 flex flex-col">
        <div
          v-if="selectedDish && selectedDish.description"
          class="w-full max-w-sm mt-6 px-4 max-h-36 flex flex-col"
        >
          <div
            class="backdrop-filter backdrop-blur-lg rounded-2xl p-4 shadow-lg flex-1 min-h-0 overflow-y-auto overscroll-contain theme-transition"
            :style="{
              backgroundColor: 'var(--color-surface)',
              opacity: 0.8,
              boxShadow: '0 10px 15px -3px var(--color-shadow)',
            }"
            style="-webkit-overflow-scrolling: touch; scrollbar-width: thin"
          >
            <!-- 菜品详细信息 -->
            <div class="space-y-3">
              <!-- 描述信息 -->
              <div v-if="selectedDish.description" class="text-center">
                <p class="text-sm leading-relaxed" :style="{ color: 'var(--color-textSecondary)' }">
                  {{ selectedDish.description }}
                </p>
              </div>

              <!-- 标签展示 -->
              <div
                v-if="selectedDish.tags && selectedDish.tags.length > 0"
                class="flex flex-wrap justify-center gap-2"
              >
                <span
                  v-for="tag in selectedDish.tags"
                  :key="tag"
                  class="px-2 py-1 text-xs rounded-full theme-transition"
                  :style="{
                    background: getTransparentGradient(),
                    color: 'var(--color-primary)',
                  }"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- 特色标识 -->
              <div class="flex justify-center space-x-2">
                <span
                  v-if="selectedDish.isComfortFood"
                  class="text-xs px-2 py-1 rounded-full theme-transition"
                  :style="{
                    background: getTransparentColor('accent', 0.15),
                    color: 'var(--color-accent)',
                  }"
                >
                  🫂 安慰食物
                </span>
                <span
                  v-if="selectedDish.isPopular"
                  class="text-xs px-2 py-1 rounded-full theme-transition"
                  :style="{
                    background: getTransparentColor('primary', 0.15),
                    color: '#dc2626',
                  }"
                >
                  🔥 热门菜品
                </span>
                <span
                  v-if="selectedDish.nutrition?.isHealthy"
                  class="text-xs px-2 py-1 rounded-full theme-transition"
                  :style="{
                    background: getTransparentColor('primary', 0.15),
                    color: '#059669',
                  }"
                >
                  🥗 健康推荐
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 底部按钮区域 -->
      <div class="flex-shrink-0 pt-6 w-full">
        <ActionButtons
          :disabled="false"
          :showMainButtons="false"
          :recipeLoading="recipeLoading"
          @chooseAgain="$emit('choose-again')"
          @shareResult="$emit('share-result')"
          @viewRecipe="handleViewRecipe"
        />
      </div>
    </div>

    <!-- 做法展示底部抽屉 -->
    <RecipeBottomSheet
      :visible="showRecipeSheet"
      :dishName="selectedDish?.name || ''"
      :recipe="recipeData"
      :loading="recipeLoading"
      :error="recipeError"
      :streamingLoading="streamingLoading"
      :streamingContent="streamingContent"
      :partialRecipe="partialRecipe"
      @close="closeRecipeSheet"
      @retry="retryGetRecipe"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, nextTick, onUnmounted } from 'vue';
  import { showFailToast, closeToast } from 'vant';

  import type { Food } from '@/types';
  import ActionButtons from './ActionButtons.vue';
  import HeaderBar from '@/components/HeaderBar.vue';
  import RecipeBottomSheet from './RecipeBottomSheet.vue';
  import { deepseekService } from '@/utils/deepseekService';
  import {
    getThemeColor,
    getContrastTextColor,
    getTextShadow,
    getTransparentGradient,
    getTransparentColor,
  } from '@/utils/colorUtils';

  const props = defineProps<{
    selectedDish: Food | null;
  }>();

  // 存储图片加载失败的状态
  const imageLoadFailed = ref(false);

  // 菜品名称引用和跑马灯控制
  const dishNameRef = ref<HTMLElement | null>(null);
  const needsMarquee = ref(false);
  const marqueeDistance = ref(159); // 默认值
  const isMarqueeActive = ref(false); // 控制跑马灯是否激活
  let marqueeTimeout: number | null = null; // 存储定时器ID

  // 做法相关状态
  const showRecipeSheet = ref(false);
  const recipeLoading = ref(false);
  const recipeData = ref<any>(null);
  const recipeError = ref<string | null>(null);

  // 流式相关状态
  const streamingLoading = ref(false);
  const streamingContent = ref('');
  const partialRecipe = ref<any>(null);

  // AI 请求控制器
  let currentAbortController: AbortController | null = null;

  // 处理图片加载失败
  const handleImageError = (): void => {
    imageLoadFailed.value = true;
  };

  // 检查是否应该显示图片
  const shouldShowImage = (): boolean => {
    return !!(props.selectedDish?.image && !imageLoadFailed.value);
  };

  // 计算圆形容器底部的实际可用宽度
  const calculateCircleBottomWidth = (radius: number, distanceFromBottom: number): number => {
    // 使用勾股定理计算圆弧在指定高度处的宽度
    // radius = 90px (180px/2), distanceFromBottom 是从圆底部的距离
    const heightFromCenter = radius - distanceFromBottom;
    const halfWidth = Math.sqrt(radius * radius - heightFromCenter * heightFromCenter);
    return halfWidth * 2;
  };

  // 检查是否需要跑马灯效果
  const checkTextOverflow = async () => {
    await nextTick();
    if (dishNameRef.value && props.selectedDish?.name) {
      const container = dishNameRef.value.parentElement;
      if (container) {
        const textWidth = dishNameRef.value.scrollWidth;

        // 圆形容器半径 90px，名称区域大约距离底部 16px（考虑padding和文字高度）
        const radius = 90;
        const distanceFromBottom = 16; // 调整为更合理的距离
        const availableWidth = calculateCircleBottomWidth(radius, distanceFromBottom);

        // 减去左右padding (约20px，考虑视觉效果)
        const usableWidth = availableWidth - 10;

        // 更新跑马灯距离 - 现在是文字从右侧进入的起始位置
        marqueeDistance.value = Math.max(usableWidth, 120); // 最小120px

        needsMarquee.value = textWidth > usableWidth;

        // 设置CSS变量用于动画 - 文字从容器右侧外部开始
        if (container.parentElement) {
          container.parentElement.style.setProperty(
            '--marquee-distance',
            `${marqueeDistance.value}px`
          );
        }

        // 如果文字过长，延迟激活跑马灯效果
        if (needsMarquee.value) {
          // 先重置为居中状态
          isMarqueeActive.value = false;
          // 清除之前的定时器
          if (marqueeTimeout) {
            clearTimeout(marqueeTimeout);
          }
          // 延迟2秒后激活跑马灯
          marqueeTimeout = setTimeout(() => {
            isMarqueeActive.value = true;
          }, 2000);
        } else {
          // 如果不需要跑马灯，确保保持居中
          isMarqueeActive.value = false;
          // 清除定时器
          if (marqueeTimeout) {
            clearTimeout(marqueeTimeout);
            marqueeTimeout = null;
          }
        }
      }
    }
  };

  // 监听菜品变化，重新检测文本溢出
  watch(
    () => props.selectedDish?.name,
    () => {
      checkTextOverflow();
    },
    { immediate: true }
  );

  // 处理查看做法
  const handleViewRecipe = async () => {
    if (!props.selectedDish) {
      showFailToast('请先选择一道菜');
      return;
    }

    // 如果已经有缓存的做法数据，直接显示
    if (recipeData.value) {
      showRecipeSheet.value = true;
      return;
    }

    // 重置状态
    recipeLoading.value = false;
    streamingLoading.value = true;
    recipeError.value = null;
    streamingContent.value = '';
    partialRecipe.value = null;
    recipeData.value = null;

    // 创建新的 AbortController
    currentAbortController = new AbortController();

    // 立即显示弹窗，开始流式加载
    showRecipeSheet.value = true;

    try {
      // 尝试使用智能流式API
      await deepseekService.getRecipeSmartStream(
        props.selectedDish.name,
        // onChunk: 处理每个数据块
        (chunk: string) => {
          streamingContent.value += chunk;
        },
        // onPartialRecipe: 处理部分菜谱
        (partial: any) => {
          partialRecipe.value = partial;
        },
        // onComplete: 处理完成
        (recipe: any) => {
          recipeData.value = recipe;
          streamingLoading.value = false;
          partialRecipe.value = null;
          currentAbortController = null; // 清理控制器
          // 弹窗已经在开始时显示了，这里不需要再设置
        },
        // onError: 处理错误
        (error: string) => {
          console.error('智能流式获取失败，尝试传统方式:', error);
          // 如果智能流式失败，降级到传统方式
          fallbackToTraditionalMethod();
        },
        // 传入 AbortController
        currentAbortController
      );
    } catch (error) {
      console.error('智能流式API调用失败:', error);
      // 如果智能流式API不可用，降级到传统方式
      fallbackToTraditionalMethod();
    }
  };

  // 降级到传统获取方式
  const fallbackToTraditionalMethod = async () => {
    streamingLoading.value = false;
    recipeLoading.value = true;
    recipeError.value = null;

    // 确保弹窗显示（如果还没有显示的话）
    if (!showRecipeSheet.value) {
      showRecipeSheet.value = true;
    }

    try {
      const recipe = await deepseekService.getRecipe(
        props.selectedDish!.name,
        currentAbortController || undefined
      );
      recipeData.value = recipe;
      currentAbortController = null; // 清理控制器
      // 弹窗已经在开始时显示了，这里不需要再设置
    } catch (error) {
      console.error('获取做法失败:', error);
      recipeError.value = error instanceof Error ? error.message : '获取做法失败，请稍后重试';
      showFailToast(recipeError.value);
    } finally {
      recipeLoading.value = false;
      closeToast();
    }
  };

  // 重新获取做法
  const retryGetRecipe = () => {
    recipeData.value = null;
    recipeError.value = null;
    streamingContent.value = '';
    partialRecipe.value = null;
    handleViewRecipe();
  };

  // 关闭做法抽屉
  const closeRecipeSheet = () => {
    // 如果正在加载，取消 AI 请求
    if (currentAbortController && (streamingLoading.value || recipeLoading.value)) {
      console.log('用户关闭弹窗，取消正在进行的 AI 请求');
      currentAbortController.abort();
      currentAbortController = null;
    }

    // 重置加载状态
    streamingLoading.value = false;
    recipeLoading.value = false;

    showRecipeSheet.value = false;
  };

  // 组件卸载时清理定时器和请求
  onUnmounted(() => {
    if (marqueeTimeout) {
      clearTimeout(marqueeTimeout);
    }

    // 清理正在进行的 AI 请求
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
  });

  defineEmits<{
    (e: 'choose-again'): void;
    (e: 'share-result'): void;
  }>();
</script>

<style scoped>
  /* 自定义滚动条样式 */
  .overflow-y-auto::-webkit-scrollbar {
    width: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 2px;
  }

  /* 确保在移动端也能正常滚动 */
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1);
  }

  /* 跑马灯样式 */
  .marquee-container {
    position: relative;
    width: 100%;
    height: 1.5rem; /* 约等于text-lg的行高 */
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden; /* 确保文字可以隐藏在容器外 */
    transition: justify-content 0.5s ease;
  }

  .marquee-text {
    white-space: nowrap;
    transition: transform 0.5s ease;
  }

  /* 当需要跑马灯时的样式 */
  .marquee-container.is-marquee {
    justify-content: flex-start;
  }

  .marquee-container.is-marquee .marquee-text {
    animation: marquee 6s linear infinite;
    animation-delay: 0.5s; /* 延迟0.5秒开始动画，让过渡更平滑 */
  }

  /* 圆形容器底部名称区域 */
  .absolute.bottom-0 {
    --marquee-distance: 159px; /* 默认值，会被JavaScript动态更新 */
  }

  @keyframes marquee {
    0% {
      transform: translateX(var(--marquee-distance)); /* 从右侧容器外开始 */
    }
    100% {
      transform: translateX(-100%); /* 向左移动直到文字完全消失 */
    }
  }
</style>
