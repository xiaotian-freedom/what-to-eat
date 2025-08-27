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
      class="h-full flex flex-col items-center p-6 relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
    >
      <!-- 选中结果展示 -->
      <div
        class="w-[180px] h-[180px] rounded-full bg-white backdrop-filter backdrop-blur-lg shadow-xl flex flex-col items-center justify-center"
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
            :style="{ backgroundColor: selectedDish.backgroundColor || '#4A5568' }"
          >
            <span class="text-white text-6xl font-bold">{{ selectedDish.name.charAt(0) }}</span>
          </div>

          <!-- 底部名称显示 -->
          <div
            class="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-filter backdrop-blur-sm p-2 text-center"
          >
            <p class="text-lg font-medium text-white">{{ selectedDish?.name }}</p>
            <!-- AI 扩展推荐标识 -->
            <div v-if="isAIExtendedRecommendation" class="flex items-center justify-center mt-1">
              <span
                class="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full"
              >
                🤖 AI 推荐
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 菜品介绍区域 -->
      <div v-if="selectedDish && selectedDish.description" class="w-full max-w-sm mt-6 px-4">
        <div
          class="bg-white/80 backdrop-filter backdrop-blur-lg rounded-2xl p-4 shadow-lg max-h-36 overflow-y-auto overscroll-contain"
          style="-webkit-overflow-scrolling: touch; scrollbar-width: thin"
        >
          <!-- 菜品详细信息 -->
          <div class="space-y-3">
            <!-- 描述信息 -->
            <div v-if="selectedDish.description" class="text-center">
              <p class="text-gray-600 text-sm leading-relaxed">{{ selectedDish.description }}</p>
            </div>

            <!-- 标签展示 -->
            <div
              v-if="selectedDish.tags && selectedDish.tags.length > 0"
              class="flex flex-wrap justify-center gap-2"
            >
              <span
                v-for="tag in selectedDish.tags"
                :key="tag"
                class="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 text-xs rounded-full"
              >
                {{ tag }}
              </span>
            </div>

            <!-- 特色标识 -->
            <div class="flex justify-center space-x-2">
              <span
                v-if="selectedDish.isComfortFood"
                class="text-xs px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full"
              >
                🫂 安慰食物
              </span>
              <span
                v-if="selectedDish.isPopular"
                class="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full"
              >
                🔥 热门菜品
              </span>
              <span
                v-if="selectedDish.nutrition?.isHealthy"
                class="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full"
              >
                🥗 健康推荐
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮区域 -->
      <div class="mt-auto pt-6 w-full">
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
  import { ref, computed } from 'vue';
  import { showFailToast, closeToast } from 'vant';

  import type { Food } from '@/types';
  import ActionButtons from './ActionButtons.vue';
  import HeaderBar from '@/components/HeaderBar.vue';
  import RecipeBottomSheet from './RecipeBottomSheet.vue';
  import { deepseekService } from '@/utils/deepseekService';

  const props = defineProps<{
    selectedDish: Food | null;
  }>();

  // 存储图片加载失败的状态
  const imageLoadFailed = ref(false);

  // 做法相关状态
  const showRecipeSheet = ref(false);
  const recipeLoading = ref(false);
  const recipeData = ref<any>(null);
  const recipeError = ref<string | null>(null);

  // 流式相关状态
  const streamingLoading = ref(false);
  const streamingContent = ref('');
  const partialRecipe = ref<any>(null);

  // 处理图片加载失败
  const handleImageError = (): void => {
    imageLoadFailed.value = true;
  };

  // 检查是否应该显示图片
  const shouldShowImage = (): boolean => {
    return !!(props.selectedDish?.image && !imageLoadFailed.value);
  };

  // 检查是否为 AI 扩展推荐
  const isAIExtendedRecommendation = computed(() => {
    return (
      props.selectedDish?.category === '智能推荐' && props.selectedDish?.tags?.includes('AI推荐')
    );
  });

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
          // 弹窗已经在开始时显示了，这里不需要再设置
        },
        // onError: 处理错误
        (error: string) => {
          console.error('智能流式获取失败，尝试传统方式:', error);
          // 如果智能流式失败，降级到传统方式
          fallbackToTraditionalMethod();
        }
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
      const recipe = await deepseekService.getRecipe(props.selectedDish!.name);
      recipeData.value = recipe;
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
    showRecipeSheet.value = false;
  };

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

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.5);
  }

  /* 确保在移动端也能正常滚动 */
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1);
  }
</style>
