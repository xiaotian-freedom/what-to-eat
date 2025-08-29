<template>
  <div
    class="font-sans flex justify-center items-center px-5 w-full h-screen"
    :class="`theme-gradient-${themeStore.currentTheme}`"
  >
    <!-- 卡片容器 -->
    <div class="card-container w-full h-[70vh] max-w-md">
      <!-- 收藏卡片 -->
      <div
        class="card-face bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative flex flex-col w-full h-full"
      >
        <!-- 顶部状态栏 -->
        <HeaderBar :title="$t('favorite.title')" :showBackButton="true" :centerTitle="true" />

        <!-- 内容区域 -->
        <div class="flex-1 flex flex-col p-6 overflow-y-auto">
          <!-- 收藏统计 -->
          <div class="mb-4">
            <div class="text-center">
              <div class="text-3xl mb-2">❤️</div>
              <h2 class="text-xl font-semibold text-gray-800">{{ $t('favorite.title') }}</h2>
              <p class="text-sm text-gray-600 mt-1">
                {{ $t('favorite.count', { count: favoriteStore.favoriteCount }) }}
              </p>
            </div>
          </div>

          <!-- 收藏列表 -->
          <div v-if="favoriteStore.hasFavorites" class="space-y-3">
            <div
              v-for="item in favoriteStore.favorites"
              :key="item.foodId"
              class="bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl p-4 border border-pink-100 hover:shadow-md transition-all duration-200"
            >
              <div class="flex items-center space-x-3">
                <!-- 菜品图片或图标 -->
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  :style="{ backgroundColor: item.backgroundColor || '#fbbf24' }"
                >
                  <span v-if="item.image">🍽️</span>
                  <span v-else>🍴</span>
                </div>

                <!-- 菜品信息 -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-800 truncate">{{ item.foodName }}</h3>
                  <div class="flex items-center space-x-2 mt-1">
                    <span
                      v-if="item.category"
                      class="text-xs bg-pink-200 text-pink-800 px-2 py-1 rounded-full"
                    >
                      {{ item.category }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ formatDate(item.addedAt) }}
                    </span>
                  </div>
                  <p v-if="item.note" class="text-sm text-gray-600 mt-1 italic">
                    "{{ item.note }}"
                  </p>
                </div>

                <!-- 操作按钮 -->
                <div class="flex items-center space-x-2">
                  <button
                    @click="editNote(item)"
                    class="p-2 text-gray-500 hover:text-blue-500 transition-colors duration-200"
                    :title="$t('favorite.editNote')"
                  >
                    ✏️
                  </button>
                  <button
                    @click="removeFavorite(item.foodId)"
                    class="p-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
                    :title="$t('favorite.remove')"
                  >
                    ❌
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="flex-1 flex flex-col items-center justify-center">
            <div class="text-center">
              <div class="text-6xl mb-4">💖</div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">
                {{ $t('favorite.empty.title') }}
              </h3>
              <p class="text-sm text-gray-600 mb-4">{{ $t('favorite.empty.desc') }}</p>
              <button
                @click="goToHome"
                class="bg-gradient-to-r from-pink-400 to-red-400 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                {{ $t('favorite.empty.goHome') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑备注弹窗 -->
    <van-dialog
      v-model:show="showNoteDialog"
      :title="$t('favorite.editNote')"
      show-cancel-button
      @confirm="saveNote"
    >
      <div class="p-4">
        <van-field
          v-model="editingNote"
          type="textarea"
          :placeholder="$t('favorite.notePlaceholder')"
          rows="3"
          autosize
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { showToast } from 'vant';

  import HeaderBar from '@/components/HeaderBar.vue';
  import { useFavoriteStore } from '@/stores/favorite';
  import { useThemeStore } from '@/stores/theme';

  const router = useRouter();
  const favoriteStore = useFavoriteStore();
  const themeStore = useThemeStore();

  // 响应式数据
  const showNoteDialog = ref(false);
  const editingNote = ref('');
  const editingFoodId = ref('');

  // 页面加载时加载收藏数据
  onMounted(() => {
    favoriteStore.loadFavorites();
  });

  // 格式化日期
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;

    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  // 移除收藏
  const removeFavorite = (foodId: string) => {
    const item = favoriteStore.favorites.find(f => f.foodId === foodId);
    if (item) {
      favoriteStore.removeFavorite(foodId);
      showToast(`${item.foodName} 已从收藏中移除`);
    }
  };

  // 编辑备注
  const editNote = (item: any) => {
    editingFoodId.value = item.foodId;
    editingNote.value = item.note || '';
    showNoteDialog.value = true;
  };

  // 保存备注
  const saveNote = () => {
    if (editingFoodId.value) {
      favoriteStore.updateFavoriteNote(editingFoodId.value, editingNote.value);
      showToast('备注已保存');
    }
  };

  // 返回首页
  const goToHome = () => {
    router.push('/home');
  };
</script>
