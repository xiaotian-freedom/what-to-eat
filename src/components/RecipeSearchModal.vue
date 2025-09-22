<template>
  <BottomSheet
    :visible="visible"
    maxHeight="60vh"
    :title="$t('recipe.searchTitle')"
    backgroundStyle="linear-gradient(135deg, var(--color-background), var(--color-surface))"
    :enableKeyboardAdaptation="true"
    @close="$emit('close')"
  >
    <div class="space-y-6">
      <!-- 输入区域 -->
      <div class="space-y-4">
        <div class="relative">
          <input
            v-model="dishName"
            type="text"
            :placeholder="$t('recipe.searchPlaceholder')"
            class="w-full px-4 py-3 text-lg rounded-xl border-2 transition-all duration-200 focus:outline-none recipe-search-input"
            :style="{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }"
            @keyup.enter="handleSearch"
            @input="handleInput"
            @focus="handleInputFocus"
            ref="inputRef"
          />
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span class="text-2xl">🍳</span>
          </div>
        </div>

        <!-- 搜索按钮 -->
        <button
          @click="handleSearch"
          :disabled="!dishName.trim() || loading"
          class="w-full py-3 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 recipe-search-button"
          :class="{ 'opacity-50 cursor-not-allowed': !dishName.trim() || loading }"
        >
          <span v-if="loading" class="animate-spin">⏳</span>
          <span v-else>🔍</span>
          <span>{{ loading ? $t('loading.default') : $t('recipe.searchButton') }}</span>
        </button>
      </div>

      <!-- 最近搜索 -->
      <div v-if="!dishName.trim() && recentSearches.length > 0" class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium recipe-recent-title">{{ $t('recipe.recentSearches') }}</h3>
          <button
            @click="clearRecentSearches"
            class="p-2 rounded-md transition-all duration-200 recipe-clear-button hover:opacity-80"
            :style="{
              color: 'var(--color-textSecondary)',
            }"
            :title="$t('recipe.clearHistory')"
          >
            🗑️
          </button>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="search in recentSearches"
            :key="search"
            @click="selectDish(search)"
            class="px-3 py-2 text-sm rounded-lg transition-all duration-200 recipe-recent-item"
            :style="{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }"
          >
            {{ search }}
          </button>
        </div>
      </div>

      <!-- 热门推荐 -->
      <div v-if="!dishName.trim()" class="space-y-3">
        <h3 class="text-sm font-medium recipe-popular-title">{{ $t('recipe.popularDishes') }}</h3>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="dish in popularDishes"
            :key="dish"
            @click="selectDish(dish)"
            class="px-3 py-2 text-sm rounded-lg transition-all duration-200 recipe-popular-item"
            :style="{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }"
          >
            {{ dish }}
          </button>
        </div>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
  import { ref, watch, nextTick } from 'vue';
  import BottomSheet from './BottomSheet.vue';
  import { useKeyboardAdaptation } from '@/composables/useKeyboardAdaptation';

  interface Props {
    visible: boolean;
  }

  interface Emits {
    (e: 'close'): void;
    (e: 'search', dishName: string): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const dishName = ref('');
  const loading = ref(false);
  const inputRef = ref<HTMLInputElement | null>(null);

  // 键盘适配
  const { scrollToInput } = useKeyboardAdaptation();

  // 最近搜索历史
  const recentSearches = ref<string[]>([]);
  const STORAGE_KEY = 'recipe_recent_searches';
  const MAX_RECENT_SEARCHES = 8; // 最多保存8个最近搜索

  // 热门菜品推荐
  const popularDishes = ref([
    '宫保鸡丁',
    '麻婆豆腐',
    '红烧肉',
    '糖醋里脊',
    '鱼香肉丝',
    '回锅肉',
    '水煮鱼',
    '酸辣土豆丝',
  ]);

  // 加载最近搜索历史
  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const searches = JSON.parse(stored);
        if (Array.isArray(searches)) {
          recentSearches.value = searches;
        }
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error);
      recentSearches.value = [];
    }
  };

  // 保存搜索历史
  const saveRecentSearches = (searchTerm: string) => {
    try {
      // 移除重复项
      const filtered = recentSearches.value.filter(item => item !== searchTerm);
      // 添加到开头
      const newSearches = [searchTerm, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      recentSearches.value = newSearches;
      // 保存到本地存储
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSearches));
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  };

  // 清除搜索历史
  const clearRecentSearches = () => {
    recentSearches.value = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('清除搜索历史失败:', error);
    }
  };

  // 监听弹窗显示状态，自动聚焦输入框
  watch(
    () => props.visible,
    newVisible => {
      if (newVisible) {
        // 加载最近搜索历史
        loadRecentSearches();
        nextTick(() => {
          inputRef.value?.focus();
          // 如果输入框聚焦，确保它可见
          if (inputRef.value) {
            scrollToInput(inputRef.value);
          }
        });
      } else {
        // 关闭时清空输入
        dishName.value = '';
        loading.value = false;
      }
    }
  );

  // 处理输入
  const handleInput = () => {
    // 可以在这里添加输入验证逻辑
  };

  // 处理输入框聚焦
  const handleInputFocus = () => {
    if (inputRef.value) {
      // 延迟一下确保键盘弹起
      setTimeout(() => {
        scrollToInput(inputRef.value!);
      }, 300);
    }
  };

  // 选择热门菜品
  const selectDish = (dish: string) => {
    dishName.value = dish;
    handleSearch();
  };

  // 处理搜索
  const handleSearch = () => {
    const trimmedName = dishName.value.trim();
    if (!trimmedName) return;

    // 保存搜索历史
    saveRecentSearches(trimmedName);

    loading.value = true;

    // 延迟一下让用户看到加载状态
    setTimeout(() => {
      emit('search', trimmedName);
      loading.value = false;
      emit('close');
    }, 300);
  };
</script>

<style scoped>
  /* 标题样式 */
  .recipe-search-title {
    color: var(--color-text);
    text-shadow: 0 1px 2px var(--color-shadow);
  }

  .recipe-search-subtitle {
    color: var(--color-textSecondary);
    line-height: 1.5;
  }

  /* 输入框样式 */
  .recipe-search-input {
    transition: all 0.2s ease;
  }

  .recipe-search-input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .recipe-search-input::placeholder {
    color: var(--color-textSecondary);
    opacity: 0.7;
  }

  /* 搜索按钮样式 */
  .recipe-search-button {
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    box-shadow: 0 4px 12px var(--color-shadow);
    transition: all 0.2s ease;
  }

  .recipe-search-button:not(:disabled):active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px var(--color-shadow);
  }

  .recipe-search-button:not(:disabled):hover {
    box-shadow: 0 6px 16px var(--color-shadow);
  }

  /* 最近搜索样式 */
  .recipe-recent-title {
    color: var(--color-textSecondary);
  }

  .recipe-clear-button {
    transition: all 0.2s ease;
  }

  .recipe-clear-button:hover {
    background-color: var(--color-textSecondary);
    color: var(--color-surface);
  }

  .recipe-recent-item {
    transition: all 0.2s ease;
  }

  .recipe-recent-item:hover {
    background-color: var(--color-border);
    transform: translateY(-1px);
  }

  .recipe-recent-item:active {
    transform: translateY(0);
  }

  /* 热门推荐样式 */
  .recipe-popular-title {
    color: var(--color-textSecondary);
  }

  .recipe-popular-item {
    transition: all 0.2s ease;
  }

  .recipe-popular-item:hover {
    background-color: var(--color-border);
    transform: translateY(-1px);
  }

  .recipe-popular-item:active {
    transform: translateY(0);
  }

  /* 响应式优化 */
  @media (max-width: 640px) {
    .recipe-search-title {
      font-size: 1.5rem;
    }

    .recipe-search-input {
      font-size: 1rem;
    }
  }

  /* 深色主题特殊处理 */
  body.theme-dark .recipe-search-input {
    background-color: var(--color-surface);
    border-color: var(--color-border);
  }

  body.theme-dark .recipe-recent-item,
  body.theme-dark .recipe-popular-item {
    background-color: var(--color-surface);
    border-color: var(--color-border);
  }

  /* 主题过渡动画 */
  .recipe-search-input,
  .recipe-search-button,
  .recipe-recent-item,
  .recipe-popular-item {
    transition: all 0.3s ease;
  }
</style>
