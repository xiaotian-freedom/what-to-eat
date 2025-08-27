<template>
  <BottomSheet
    :visible="visible"
    :maxHeight="'85vh'"
    :customClass="'bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50'"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <!-- 标题区域 -->
      <div class="text-center border-b border-orange-200 pb-4">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ dishName }} 做法</h2>
        <div class="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <span class="px-2 py-1 bg-orange-100 rounded-full">🍳 详细步骤</span>
          <span class="px-2 py-1 bg-yellow-100 rounded-full">⏱️ {{ estimatedTime }}</span>
          <span class="px-2 py-1 bg-red-100 rounded-full">👨‍🍳 {{ difficulty }}</span>
        </div>
      </div>

      <!-- 流式加载状态 -->
      <div v-if="streamingLoading" class="flex flex-col items-center justify-center py-8 space-y-4">
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span class="text-gray-600">🤖 AI 正在为您生成详细做法...</span>
        </div>

        <!-- 生成状态指示 - 移到顶部 -->
        <div class="w-full max-w-md">
          <div class="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600">生成状态</span>
              <span class="text-xs text-orange-600">{{ getGenerationStatus() }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                :style="{ width: getProgressWidth() }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 分块内容展示 -->
        <div class="w-full space-y-4">
          <!-- 菜品介绍 -->
          <div class="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span class="mr-2">📖</span> 菜品介绍
            </h3>
            <div v-if="partialRecipe?.introduction" class="text-gray-600 leading-relaxed">
              {{ partialRecipe.introduction }}
            </div>
            <div v-else class="space-y-2">
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>

          <!-- 食材清单 -->
          <div class="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span class="mr-2">🥬</span> 食材清单
            </h3>
            <div
              v-if="partialRecipe?.ingredients && partialRecipe.ingredients.length > 0"
              class="grid grid-cols-1 gap-2"
            >
              <div
                v-for="(ingredient, index) in partialRecipe.ingredients"
                :key="index"
                class="flex items-center justify-between py-2 px-3 bg-orange-50 rounded-lg"
              >
                <span class="text-gray-700">{{ ingredient.name }}</span>
                <span class="text-sm text-orange-600 font-medium">{{ ingredient.amount }}</span>
              </div>
            </div>
            <div v-else class="space-y-2">
              <div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
              <div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
              </div>
              <div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
            </div>
          </div>

          <!-- 制作步骤 -->
          <div class="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span class="mr-2">👨‍🍳</span> 制作步骤
            </h3>
            <div v-if="partialRecipe?.steps && partialRecipe.steps.length > 0" class="space-y-4">
              <div v-for="(step, index) in partialRecipe.steps" :key="index" class="flex space-x-3">
                <div
                  class="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold"
                >
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <p class="text-gray-700 leading-relaxed">{{ step.description }}</p>
                  <div
                    v-if="step.tips"
                    class="mt-2 p-2 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
                  >
                    <p class="text-sm text-yellow-700">💡 小贴士：{{ step.tips }}</p>
                  </div>
                  <div v-if="step.time" class="mt-1 text-xs text-gray-500">
                    ⏱️ 预计时间：{{ step.time }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="space-y-4">
              <div class="flex space-x-3">
                <div class="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
              <div class="flex space-x-3">
                <div class="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 烹饪小贴士 -->
          <div class="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span class="mr-2">💡</span> 烹饪小贴士
            </h3>
            <div v-if="partialRecipe?.tips && partialRecipe.tips.length > 0" class="space-y-2">
              <div
                v-for="(tip, index) in partialRecipe.tips"
                :key="index"
                class="flex items-start space-x-2 p-2 bg-yellow-50 rounded-lg"
              >
                <span class="text-yellow-600 mt-0.5">•</span>
                <span class="text-gray-700 text-sm">{{ tip }}</span>
              </div>
            </div>
            <div v-else class="space-y-2">
              <div class="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                <div class="w-2 h-2 bg-gray-300 rounded-full mt-1"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              </div>
              <div class="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                <div class="w-2 h-2 bg-gray-300 rounded-full mt-1"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
              </div>
            </div>
          </div>

          <!-- 营养价值 -->
          <div class="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span class="mr-2">🥗</span> 营养价值
            </h3>
            <div v-if="partialRecipe?.nutrition" class="text-gray-600 text-sm leading-relaxed">
              {{ partialRecipe.nutrition }}
            </div>
            <div v-else class="space-y-2">
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 传统加载状态 -->
      <div v-else-if="loading" class="flex flex-col items-center justify-center py-12 space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p class="text-gray-600">🤖 AI 正在为您生成详细做法...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-12 space-y-4">
        <div class="text-6xl">😔</div>
        <p class="text-gray-600 text-center">{{ error }}</p>
        <button
          @click="$emit('retry')"
          class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          重新获取
        </button>
      </div>

      <!-- 做法内容 -->
      <div v-else-if="recipe" class="space-y-6">
        <!-- 菜品介绍 -->
        <div
          v-if="recipe.introduction"
          class="bg-white rounded-xl p-4 shadow-sm border border-orange-100"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-2 flex items-center">
            <span class="mr-2">📖</span> 菜品介绍
          </h3>
          <p class="text-gray-600 leading-relaxed">{{ recipe.introduction }}</p>
        </div>

        <!-- 食材清单 -->
        <div
          v-if="recipe.ingredients && recipe.ingredients.length > 0"
          class="bg-white rounded-xl p-4 shadow-sm border border-orange-100"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span class="mr-2">🥬</span> 食材清单
          </h3>
          <div class="grid grid-cols-1 gap-2">
            <div
              v-for="(ingredient, index) in recipe.ingredients"
              :key="index"
              class="flex items-center justify-between py-2 px-3 bg-orange-50 rounded-lg"
            >
              <span class="text-gray-700">{{ ingredient.name }}</span>
              <span class="text-sm text-orange-600 font-medium">{{ ingredient.amount }}</span>
            </div>
          </div>
        </div>

        <!-- 制作步骤 -->
        <div
          v-if="recipe.steps && recipe.steps.length > 0"
          class="bg-white rounded-xl p-4 shadow-sm border border-orange-100"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span class="mr-2">👨‍🍳</span> 制作步骤
          </h3>
          <div class="space-y-4">
            <div v-for="(step, index) in recipe.steps" :key="index" class="flex space-x-3">
              <div
                class="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold"
              >
                {{ index + 1 }}
              </div>
              <div class="flex-1">
                <p class="text-gray-700 leading-relaxed">{{ step.description }}</p>
                <div
                  v-if="step.tips"
                  class="mt-2 p-2 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
                >
                  <p class="text-sm text-yellow-700">💡 小贴士：{{ step.tips }}</p>
                </div>
                <div v-if="step.time" class="mt-1 text-xs text-gray-500">
                  ⏱️ 预计时间：{{ step.time }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 烹饪小贴士 -->
        <div
          v-if="recipe.tips && recipe.tips.length > 0"
          class="bg-white rounded-xl p-4 shadow-sm border border-orange-100"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span class="mr-2">💡</span> 烹饪小贴士
          </h3>
          <div class="space-y-2">
            <div
              v-for="(tip, index) in recipe.tips"
              :key="index"
              class="flex items-start space-x-2 p-2 bg-yellow-50 rounded-lg"
            >
              <span class="text-yellow-600 mt-0.5">•</span>
              <span class="text-gray-700 text-sm">{{ tip }}</span>
            </div>
          </div>
        </div>

        <!-- 营养价值 -->
        <div
          v-if="recipe.nutrition"
          class="bg-white rounded-xl p-4 shadow-sm border border-orange-100"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span class="mr-2">🥗</span> 营养价值
          </h3>
          <p class="text-gray-600 text-sm leading-relaxed">{{ recipe.nutrition }}</p>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div v-if="recipe" class="flex space-x-3 pt-4 border-t border-orange-200">
        <button
          @click="shareRecipe"
          class="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>📤</span>
          <span>分享做法</span>
        </button>
        <button
          @click="saveRecipe"
          class="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>⭐</span>
          <span>收藏做法</span>
        </button>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import BottomSheet from './BottomSheet.vue';
  import { showSuccessToast } from 'vant';

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
    let shareText = `🍳 ${props.dishName} 的做法\n\n`;

    if (props.recipe.introduction) {
      shareText += `📖 介绍：${props.recipe.introduction}\n\n`;
    }

    if (props.recipe.ingredients && props.recipe.ingredients.length > 0) {
      shareText += `🥬 食材：\n`;
      props.recipe.ingredients.forEach(ingredient => {
        shareText += `• ${ingredient.name} ${ingredient.amount}\n`;
      });
      shareText += '\n';
    }

    if (props.recipe.steps && props.recipe.steps.length > 0) {
      shareText += `👨‍🍳 步骤：\n`;
      props.recipe.steps.forEach((step, index) => {
        shareText += `${index + 1}. ${step.description}\n`;
      });
    }

    shareText += '\n✨ 来自"今天吃什么"应用';

    // 使用 Web Share API 或复制到剪贴板
    if (navigator.share) {
      navigator
        .share({
          title: `${props.dishName} 的做法`,
          text: shareText,
        })
        .catch(console.error);
    } else {
      // 复制到剪贴板
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          showSuccessToast('做法已复制到剪贴板');
        })
        .catch(() => {
          console.log('分享内容：', shareText);
          showSuccessToast('做法内容已准备好分享');
        });
    }
  };

  // 收藏做法
  const saveRecipe = () => {
    // TODO: 实现收藏功能，可以保存到本地存储或用户收藏列表
    showSuccessToast('做法已收藏');
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
        return '生成介绍中...';
      } else if (!hasIngredients) {
        return '生成食材清单中...';
      } else if (!hasSteps) {
        return '生成制作步骤中...';
      } else if (!hasTips) {
        return '生成烹饪小贴士中...';
      } else if (!hasNutrition) {
        return '生成营养价值中...';
      } else {
        return '即将完成...';
      }
    }
    return '准备中...';
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
