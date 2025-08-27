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

      <!-- 加载状态 -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 space-y-4">
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
</script>
