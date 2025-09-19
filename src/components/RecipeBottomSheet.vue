<template>
  <BottomSheet
    :visible="visible"
    maxHeight="85vh"
    backgroundStyle="linear-gradient(135deg, var(--color-background), var(--color-surface))"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <!-- 标题区域 -->
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-2 recipe-title">
          {{ t('recipe.detail.title', { dishName }) }}
        </h2>
        <div class="flex items-center justify-center space-x-2 text-sm recipe-subtitle">
          <span class="px-2 py-1 rounded-full recipe-tag-primary">{{
            t('recipe.detail.detailedSteps')
          }}</span>
          <span class="px-2 py-1 rounded-full recipe-tag-secondary">{{
            t('recipe.detail.estimatedTime', { time: estimatedTime })
          }}</span>
          <span class="px-2 py-1 rounded-full recipe-tag-accent">{{
            t('recipe.detail.difficulty', { difficulty })
          }}</span>
        </div>
      </div>

      <!-- 流式加载状态 -->
      <div v-if="streamingLoading" class="flex flex-col items-center justify-center py-5 space-y-4">
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 recipe-loading-spinner"></div>
          <span class="recipe-loading-text">{{ t('recipe.detail.aiGenerating') }}</span>
        </div>

        <!-- 生成状态指示 - 移到顶部 -->
        <div class="w-full">
          <div class="rounded-lg p-4 shadow-sm recipe-status-card">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm recipe-status-label">{{
                t('recipe.detail.generationStatus')
              }}</span>
              <span class="text-xs recipe-status-text">{{ getGenerationStatus() }}</span>
            </div>
            <div class="w-full recipe-progress-bg rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-500 recipe-progress-bar"
                :style="{ width: getProgressWidth() }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 分块内容展示 -->
        <div class="w-full space-y-6">
          <!-- 菜品介绍 -->
          <div class="rounded-xl p-4 shadow-sm recipe-content-card">
            <h3 class="text-lg font-semibold mb-3 flex items-center recipe-content-title">
              <span class="mr-2">📖</span> {{ t('recipe.content.introduction') }}
            </h3>
            <div v-if="partialRecipe?.introduction" class="recipe-content-text leading-relaxed">
              {{ partialRecipe.introduction }}
            </div>
            <div v-else class="space-y-2">
              <div class="h-4 recipe-skeleton-bg rounded animate-pulse"></div>
              <div class="h-4 recipe-skeleton-bg rounded animate-pulse w-3/4"></div>
              <div class="h-4 recipe-skeleton-bg rounded animate-pulse w-1/2"></div>
            </div>
          </div>

          <!-- 食材清单 -->
          <div class="rounded-xl p-4 shadow-sm recipe-content-card">
            <h3 class="text-lg font-semibold mb-3 flex items-center recipe-content-title">
              <span class="mr-2">🥬</span> {{ t('recipe.content.ingredients') }}
            </h3>
            <div
              v-if="partialRecipe?.ingredients && partialRecipe.ingredients.length > 0"
              class="grid grid-cols-1 gap-2"
            >
              <div
                v-for="(ingredient, index) in partialRecipe.ingredients"
                :key="index"
                class="flex items-center justify-between py-2 px-3 rounded-lg recipe-ingredient-item"
              >
                <span class="recipe-ingredient-name">{{ ingredient.name }}</span>
                <span class="text-sm recipe-ingredient-amount font-medium">{{
                  ingredient.amount
                }}</span>
              </div>
            </div>
            <div v-else class="space-y-2">
              <div
                class="flex items-center justify-between py-2 px-3 recipe-skeleton-item rounded-lg"
              >
                <div class="h-4 recipe-skeleton-bg rounded animate-pulse w-20"></div>
                <div class="h-4 recipe-skeleton-bg rounded animate-pulse w-16"></div>
              </div>
              <div
                class="flex items-center justify-between py-2 px-3 recipe-skeleton-item rounded-lg"
              >
                <div class="h-4 recipe-skeleton-bg rounded animate-pulse w-24"></div>
                <div class="h-4 recipe-skeleton-bg rounded animate-pulse w-12"></div>
              </div>
              <div
                class="flex items-center justify-between py-2 px-3 recipe-skeleton-item rounded-lg"
              >
                <div class="h-4 recipe-skeleton-bg rounded animate-pulse w-16"></div>
                <div class="h-4 recipe-skeleton-bg rounded animate-pulse w-20"></div>
              </div>
            </div>
          </div>

          <!-- 制作步骤 -->
          <div class="rounded-xl p-4 shadow-sm recipe-content-card">
            <h3 class="text-lg font-semibold mb-3 flex items-center recipe-content-title">
              <span class="mr-2">👨‍🍳</span> {{ t('recipe.content.steps') }}
            </h3>
            <div v-if="partialRecipe?.steps && partialRecipe.steps.length > 0" class="space-y-4">
              <div v-for="(step, index) in partialRecipe.steps" :key="index" class="flex space-x-3">
                <div
                  class="flex-shrink-0 w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold recipe-step-number"
                >
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <p class="recipe-step-description leading-relaxed">{{ step.description }}</p>
                  <div v-if="step.tips" class="mt-2 p-2 rounded-lg recipe-step-tips">
                    <p class="text-sm recipe-step-tips-text">
                      {{ t('recipe.content.tip', { tip: step.tips }) }}
                    </p>
                  </div>
                  <div v-if="step.time" class="mt-1 text-xs recipe-step-time">
                    {{ t('recipe.content.estimatedTime', { time: step.time }) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="space-y-4">
              <div class="flex space-x-3">
                <div
                  class="flex-shrink-0 w-8 h-8 recipe-skeleton-bg rounded-full animate-pulse"
                ></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 recipe-skeleton-bg rounded animate-pulse"></div>
                  <div class="h-4 recipe-skeleton-bg rounded animate-pulse w-3/4"></div>
                </div>
              </div>
              <div class="flex space-x-3">
                <div
                  class="flex-shrink-0 w-8 h-8 recipe-skeleton-bg rounded-full animate-pulse"
                ></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 recipe-skeleton-bg rounded animate-pulse"></div>
                  <div class="h-4 recipe-skeleton-bg rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 烹饪小贴士 -->
          <div class="rounded-xl p-4 shadow-sm recipe-content-card">
            <h3 class="text-lg font-semibold mb-3 flex items-center recipe-content-title">
              <span class="mr-2">💡</span> {{ t('recipe.content.tips') }}
            </h3>
            <div v-if="partialRecipe?.tips && partialRecipe.tips.length > 0" class="space-y-2">
              <div
                v-for="(tip, index) in partialRecipe.tips"
                :key="index"
                class="flex items-center space-x-2 p-2 rounded-lg recipe-tip-item"
              >
                <span class="recipe-tip-bullet">•</span>
                <span class="text-sm recipe-tip-text">{{ tip }}</span>
              </div>
            </div>
            <div v-else class="space-y-2">
              <div class="flex items-center space-x-2 p-2 recipe-skeleton-item rounded-lg">
                <div class="w-2 h-2 recipe-skeleton-dot rounded-full"></div>
                <div class="h-4 recipe-skeleton-bg rounded animate-pulse w-full"></div>
              </div>
              <div class="flex items-center space-x-2 p-2 recipe-skeleton-item rounded-lg">
                <div class="w-2 h-2 recipe-skeleton-dot rounded-full"></div>
                <div class="h-4 recipe-skeleton-bg rounded animate-pulse w-4/5"></div>
              </div>
            </div>
          </div>

          <!-- 营养价值 -->
          <div class="rounded-xl p-4 shadow-sm recipe-content-card">
            <h3 class="text-lg font-semibold mb-3 flex items-center recipe-content-title">
              <span class="mr-2">🥗</span> {{ t('recipe.content.nutrition') }}
            </h3>
            <div
              v-if="partialRecipe?.nutrition"
              class="recipe-content-text text-sm leading-relaxed"
            >
              {{ partialRecipe.nutrition }}
            </div>
            <div v-else class="space-y-2">
              <div class="h-4 recipe-skeleton-bg rounded animate-pulse"></div>
              <div class="h-4 recipe-skeleton-bg rounded animate-pulse w-3/4"></div>
              <div class="h-4 recipe-skeleton-bg rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 传统加载状态 -->
      <div v-else-if="loading" class="flex flex-col items-center justify-center py-12 space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 recipe-loading-spinner"></div>
        <p class="recipe-loading-text">{{ t('recipe.detail.aiGenerating') }}</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-12 space-y-4">
        <div class="text-6xl">😔</div>
        <p class="recipe-error-text text-center">{{ error }}</p>
        <button
          @click="$emit('retry')"
          class="px-4 py-2 text-white rounded-lg transition-colors recipe-retry-button"
        >
          {{ t('recipe.detail.retry') }}
        </button>
      </div>

      <!-- 做法内容 -->
      <div v-else-if="recipe" class="space-y-6">
        <!-- 菜品介绍 -->
        <div v-if="recipe.introduction" class="rounded-xl p-4 shadow-sm recipe-content-card">
          <h3 class="text-lg font-semibold mb-2 flex items-center recipe-content-title">
            <span class="mr-2">📖</span> {{ t('recipe.content.introduction') }}
          </h3>
          <p class="recipe-content-text leading-relaxed">{{ recipe.introduction }}</p>
        </div>

        <!-- 食材清单 -->
        <div
          v-if="recipe.ingredients && recipe.ingredients.length > 0"
          class="rounded-xl p-4 shadow-sm recipe-content-card"
        >
          <h3 class="text-lg font-semibold mb-3 flex items-center recipe-content-title">
            <span class="mr-2">🥬</span> {{ t('recipe.content.ingredients') }}
          </h3>
          <div class="grid grid-cols-1 gap-2">
            <div
              v-for="(ingredient, index) in recipe.ingredients"
              :key="index"
              class="flex items-center justify-between py-2 px-3 rounded-lg recipe-ingredient-item"
            >
              <span class="recipe-ingredient-name">{{ ingredient.name }}</span>
              <span class="text-sm recipe-ingredient-amount font-medium">{{
                ingredient.amount
              }}</span>
            </div>
          </div>
        </div>

        <!-- 制作步骤 -->
        <div
          v-if="recipe.steps && recipe.steps.length > 0"
          class="rounded-xl p-4 shadow-sm recipe-content-card"
        >
          <h3 class="text-lg font-semibold mb-3 flex items-center recipe-content-title">
            <span class="mr-2">👨‍🍳</span> {{ t('recipe.content.steps') }}
          </h3>
          <div class="space-y-4">
            <div v-for="(step, index) in recipe.steps" :key="index" class="flex space-x-3">
              <div
                class="flex-shrink-0 w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold recipe-step-number"
              >
                {{ index + 1 }}
              </div>
              <div class="flex-1">
                <p class="recipe-step-description leading-relaxed">{{ step.description }}</p>
                <div v-if="step.tips" class="mt-2 p-2 rounded-lg recipe-step-tips">
                  <p class="text-sm recipe-step-tips-text">
                    {{ t('recipe.content.tip', { tip: step.tips }) }}
                  </p>
                </div>
                <div v-if="step.time" class="mt-1 text-xs recipe-step-time">
                  {{ t('recipe.content.estimatedTime', { time: step.time }) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 烹饪小贴士 -->
        <div
          v-if="recipe.tips && recipe.tips.length > 0"
          class="rounded-xl p-4 shadow-sm recipe-content-card"
        >
          <h3 class="text-lg font-semibold mb-3 flex items-center recipe-content-title">
            <span class="mr-2">💡</span> {{ t('recipe.content.tips') }}
          </h3>
          <div class="space-y-2">
            <div
              v-for="(tip, index) in recipe.tips"
              :key="index"
              class="flex items-center space-x-2 p-2 rounded-lg recipe-tip-item"
            >
              <span class="recipe-tip-bullet">•</span>
              <span class="text-sm recipe-tip-text">{{ tip }}</span>
            </div>
          </div>
        </div>

        <!-- 营养价值 -->
        <div v-if="recipe.nutrition" class="rounded-xl p-4 shadow-sm recipe-content-card">
          <h3 class="text-lg font-semibold mb-3 flex items-center recipe-content-title">
            <span class="mr-2">🥗</span> {{ t('recipe.content.nutrition') }}
          </h3>
          <p class="text-sm leading-relaxed recipe-content-text">{{ recipe.nutrition }}</p>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div v-if="recipe" class="flex space-x-3 pt-4">
        <button
          @click="shareRecipe"
          class="flex-1 py-3 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 recipe-share-button"
        >
          <span>📤</span>
          <span>{{ t('recipe.detail.shareRecipe') }}</span>
        </button>
        <button
          @click="saveRecipe"
          class="flex-1 py-3 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 recipe-save-button"
        >
          <span>💖</span>
          <span>{{ t('recipe.detail.saveRecipe') }}</span>
        </button>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BottomSheet from './BottomSheet.vue';
  import { showSuccessToast } from 'vant';
  import { useFavoriteStore } from '@/stores/favorite';

  // 食材接口
  interface Ingredient {
    name: string;
    amount: string;
  }

  // 制作步骤接口
  interface CookingStep {
    description: string;
    time?: string;
    tips?: string;
  }

  // 菜谱接口
  interface Recipe {
    introduction?: string;
    ingredients?: Ingredient[];
    steps?: CookingStep[];
    tips?: string[];
    nutrition?: string;
    estimatedTime?: string;
    difficulty?: string;
  }

  const props = defineProps<{
    visible: boolean;
    dishName: string;
    recipe: Recipe | null;
    loading: boolean;
    error: string | null;
    streamingLoading?: boolean;
    streamingContent?: string;
    partialRecipe?: Recipe | null;
  }>();

  defineEmits<{
    (e: 'close'): void;
    (e: 'retry'): void;
  }>();

  const { t } = useI18n();
  const favoriteStore = useFavoriteStore();

  // 计算预计时间
  const estimatedTime = computed(() => {
    return props.recipe?.estimatedTime || '约30分钟';
  });

  // 计算难度
  const difficulty = computed(() => {
    return props.recipe?.difficulty || '中等';
  });

  // 分享做法
  const shareRecipe = () => {
    if (!props.recipe) return;

    // 构建分享文本
    let content = '';

    if (props.recipe.introduction) {
      content += `${t('recipe.share.introduction', { intro: props.recipe.introduction })}\n\n`;
    }

    if (props.recipe.ingredients && props.recipe.ingredients.length > 0) {
      content += `${t('recipe.share.ingredients')}\n`;
      props.recipe.ingredients.forEach(ingredient => {
        content += `• ${ingredient.name} ${ingredient.amount}\n`;
      });
      content += '\n';
    }

    if (props.recipe.steps && props.recipe.steps.length > 0) {
      content += `${t('recipe.share.steps')}\n`;
      props.recipe.steps.forEach((step, index) => {
        content += `${index + 1}. ${step.description}\n`;
      });
    }

    const shareText = t('recipe.detail.shareText', {
      dishName: props.dishName,
      content,
    });

    // 使用 Web Share API 或复制到剪贴板
    if (navigator.share) {
      navigator
        .share({
          title: t('recipe.detail.title', { dishName: props.dishName }),
          text: shareText,
        })
        .catch(console.error);
    } else {
      // 复制到剪贴板
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          showSuccessToast(t('recipe.detail.recipeCopied'));
        })
        .catch(() => {
          console.log('分享内容：', shareText);
          showSuccessToast(t('recipe.detail.recipeReady'));
        });
    }
  };

  // 收藏做法
  const saveRecipe = () => {
    if (!props.dishName) return;

    // 创建菜品对象
    const food = {
      id: `recipe_${Date.now()}`,
      name: props.dishName,
      category: '家常菜',
      image: '',
      backgroundColor: '#ec4899',
    };

    // 添加到收藏
    const success = favoriteStore.addFavorite(food);
    if (success) {
      showSuccessToast(t('recipe.detail.recipeSaved'));
    } else {
      showSuccessToast(t('recipe.detail.alreadySaved'));
    }
  };

  // 获取生成状态文本
  const getGenerationStatus = (): string => {
    if (props.partialRecipe) {
      // 检查当前正在生成的内容
      const hasIntro = !!props.partialRecipe.introduction;
      const hasIngredients = !!(
        props.partialRecipe.ingredients && props.partialRecipe.ingredients.length > 0
      );
      const hasSteps = !!(props.partialRecipe.steps && props.partialRecipe.steps.length > 0);
      const hasTips = !!(props.partialRecipe.tips && props.partialRecipe.tips.length > 0);
      const hasNutrition = !!props.partialRecipe.nutrition;

      // 根据完成情况返回当前状态
      if (!hasIntro) {
        return t('recipe.detail.generatingIntro');
      } else if (!hasIngredients) {
        return t('recipe.detail.generatingIngredients');
      } else if (!hasSteps) {
        return t('recipe.detail.generatingSteps');
      } else if (!hasTips) {
        return t('recipe.detail.generatingTips');
      } else if (!hasNutrition) {
        return t('recipe.detail.generatingNutrition');
      } else {
        return t('recipe.detail.almostDone');
      }
    }
    return t('recipe.detail.preparing');
  };

  // 获取进度条宽度
  const getProgressWidth = (): string => {
    if (props.partialRecipe) {
      // 根据已完成的内容计算进度
      let progress = 0;

      if (props.partialRecipe.introduction) {
        progress += 20; // 介绍占20%
      }
      if (props.partialRecipe.ingredients && props.partialRecipe.ingredients.length > 0) {
        progress += 20; // 食材占20%
      }
      if (props.partialRecipe.steps && props.partialRecipe.steps.length > 0) {
        progress += 30; // 步骤占30%
      }
      if (props.partialRecipe.tips && props.partialRecipe.tips.length > 0) {
        progress += 15; // 小贴士占15%
      }
      if (props.partialRecipe.nutrition) {
        progress += 15; // 营养占15%
      }

      return `${Math.min(progress, 100)}%`;
    }
    return '10%';
  };
</script>

<style scoped>
  /* 标签样式 */
  .recipe-tag-primary {
    background-color: var(--color-primary);
    opacity: 0.9;
    color: white;
    transition: all 0.2s ease;
  }

  .recipe-tag-secondary {
    background-color: var(--color-secondary);
    opacity: 0.9;
    color: white;
    transition: all 0.2s ease;
  }

  .recipe-tag-accent {
    background-color: var(--color-accent);
    opacity: 0.9;
    color: white;
    transition: all 0.2s ease;
  }

  /* 加载状态样式 */
  .recipe-loading-spinner {
    border-color: var(--color-primary);
  }

  .recipe-loading-text {
    color: var(--color-textSecondary);
  }

  /* 状态卡片样式 */
  .recipe-status-card {
    border: 1px solid var(--color-border);
    background-color: var(--color-surface);
    box-shadow: 0 2px 8px var(--color-shadow);
  }

  .recipe-status-label {
    color: var(--color-textSecondary);
  }

  .recipe-status-text {
    color: var(--color-primary);
    font-weight: 500;
  }

  .recipe-progress-bg {
    background-color: var(--color-border);
  }

  .recipe-progress-bar {
    background: linear-gradient(to right, var(--color-primary), var(--color-accent));
  }

  /* 内容卡片样式 */
  .recipe-content-card {
    border: 1px solid var(--color-border);
    background-color: var(--color-surface);
    box-shadow: 0 4px 12px var(--color-shadow);
    transition: all 0.3s ease;
  }

  /* 骨架屏样式 */
  .recipe-skeleton-bg {
    background-color: var(--color-border);
  }

  .recipe-skeleton-item {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
  }

  .recipe-skeleton-dot {
    background-color: var(--color-textSecondary);
  }

  /* 食材样式 */
  .recipe-ingredient-item {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    transition: all 0.2s ease;
  }

  .recipe-ingredient-amount {
    color: var(--color-primary);
    font-weight: 600;
  }

  .recipe-ingredient-name {
    color: var(--color-text);
    font-weight: 500;
  }

  /* 步骤样式 */
  .recipe-step-description {
    color: var(--color-text);
    line-height: 1.6;
  }

  .recipe-step-time {
    color: var(--color-textSecondary);
    font-style: italic;
  }

  .recipe-step-number {
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .recipe-step-tips {
    background-color: var(--color-surface);
    border-left: 4px solid var(--color-accent);
    border-radius: 8px;
  }

  .recipe-step-tips-text {
    color: var(--color-accent);
    font-weight: 500;
  }

  /* 小贴士样式 */
  .recipe-tip-text {
    color: var(--color-text);
    line-height: 1.5;
  }

  .recipe-tip-item {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    transition: all 0.2s ease;
  }

  .recipe-tip-bullet {
    color: var(--color-accent);
    font-weight: bold;
  }

  /* 文本样式 */
  .recipe-title {
    color: var(--color-text);
    text-shadow: 0 1px 2px var(--color-shadow);
  }

  .recipe-subtitle {
    color: var(--color-textSecondary);
  }

  .recipe-content-title {
    color: var(--color-text);
    border-bottom: 2px solid var(--color-primary);
    padding-bottom: 0.5rem;
  }

  .recipe-content-text {
    color: var(--color-textSecondary);
    line-height: 1.6;
  }

  /* 错误状态样式 */
  .recipe-error-text {
    color: var(--color-textSecondary);
    font-size: 0.95rem;
  }

  /* 按钮样式 */
  .recipe-retry-button {
    background: var(--color-primary);
    box-shadow: 0 4px 12px var(--color-shadow);
    transition: all 0.2s ease;
  }

  .recipe-retry-button:active {
    transform: scale(0.95);
    box-shadow: 0 2px 8px var(--color-shadow);
  }

  .recipe-share-button {
    background: var(--color-primary);
    box-shadow: 0 4px 12px var(--color-shadow);
    transition: all 0.2s ease;
  }

  .recipe-share-button:active {
    transform: scale(0.95);
    box-shadow: 0 2px 8px var(--color-shadow);
  }

  .recipe-save-button {
    background: linear-gradient(135deg, #ec4899, #dc2626);
    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
    transition: all 0.2s ease;
  }

  .recipe-save-button:active {
    transform: scale(0.95);
    box-shadow: 0 2px 8px rgba(236, 72, 153, 0.4);
  }

  /* 响应式优化 */
  @media (max-width: 640px) {
    .recipe-content-card,
    .recipe-status-card {
      margin-left: 0.5rem;
      margin-right: 0.5rem;
    }

    .recipe-title {
      font-size: 1.5rem;
    }

    .recipe-content-title {
      font-size: 1.1rem;
    }
  }

  /* 深色主题特殊处理 */
  body.theme-dark .recipe-content-card {
    border-color: var(--color-border);
  }

  body.theme-dark .recipe-ingredient-item,
  body.theme-dark .recipe-tip-item {
    background-color: var(--color-surface);
    border-color: var(--color-border);
  }

  body.theme-dark .recipe-skeleton-bg {
    background-color: var(--color-border);
  }

  /* 主题过渡动画 */
  .recipe-content-card,
  .recipe-ingredient-item,
  .recipe-tip-item,
  .recipe-retry-button,
  .recipe-share-button,
  .recipe-save-button {
    transition: all 0.3s ease;
  }

  /* 确保间距正常工作 */
  .space-y-6 > * + * {
    margin-top: 1.5rem;
  }

  .space-y-4 > * + * {
    margin-top: 1rem;
  }

  .space-y-2 > * + * {
    margin-top: 0.5rem;
  }
</style>
