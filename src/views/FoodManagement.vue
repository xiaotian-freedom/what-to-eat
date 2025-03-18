<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import HeaderBar from '@/components/HeaderBar.vue';
  import { useFoodStore } from '@/stores';
  import { showConfirmDialog } from 'vant';
  import IconEmpty from '@/assets/icons/empty.svg';

  const router = useRouter();
  const foodStore = useFoodStore();

  // 页面加载时获取数据
  onMounted(() => {
    foodStore.loadFoodItems();
  });

  // 删除菜品
  const deleteFood = (id: string, name: string): void => {
    showConfirmDialog({
      title: '确认删除',
      message: `确定要删除"${name}"吗？`,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24',
    })
      .then(() => {
        // 用户点击确认按钮
        foodStore.deleteFood(id);
      })
      .catch(() => {
        // 用户点击取消按钮或关闭弹窗
      });
  };

  // 编辑菜品
  const editFood = (id: string): void => {
    router.push(`/add-food?id=${id}`);
  };

  // 添加新菜品
  const addNewDish = (): void => {
    router.push('/add-food');
  };
</script>

<template>
  <div
    class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 w-screen h-screen font-sans flex justify-center items-center px-5"
  >
    <!-- 菜品管理页面模拟设备 -->
    <div
      class="w-full bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative mx-auto flex flex-col device-container"
    >
      <!-- 顶部状态栏 -->
      <HeaderBar
        title="菜品管理"
        rightIcon="https://unpkg.com/lucide-static@latest/icons/plus.svg"
        :onRightIconClick="addNewDish"
      />

      <!-- 内容区域 - 菜品列表 -->
      <div
        class="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden h-[500px]"
      >
        <!-- 可滚动的菜品列表 -->
        <div class="overflow-y-auto p-3">
          <div class="space-y-3">
            <!-- 菜品项 -->
            <van-swipe-cell
              v-for="(item, index) in foodStore.foodItems"
              :key="item.id"
              class="wave-in"
              :style="`animation-delay: ${0.05 * (index + 1)}s`"
            >
              <template #default>
                <div
                  class="bg-white/60 backdrop-filter backdrop-blur-lg rounded-xl p-3 flex items-center shadow-sm"
                >
                  <!-- 替换图片区域，添加条件渲染 -->
                  <template v-if="item.image">
                    <img
                      :src="item.image"
                      class="w-16 h-16 rounded-full object-cover mr-3 shadow-lg"
                      :alt="item.name"
                    />
                  </template>
                  <div
                    v-else
                    class="w-16 h-16 rounded-full mr-3 shadow-lg flex items-center justify-center text-white font-bold text-xl"
                    :style="`background-color: ${item.backgroundColor || item.categoryColor}`"
                  >
                    {{ item.name.charAt(0) }}
                  </div>

                  <div class="flex-1">
                    <h3 class="font-medium text-gray-800">{{ item.name }}</h3>
                    <p class="text-xs text-gray-500 flex items-center">
                      <span
                        class="inline-block w-2 h-2 rounded-full mr-1"
                        :style="{ backgroundColor: item.categoryColor }"
                      ></span>
                      {{ item.category }}
                    </p>
                  </div>
                </div>
              </template>
              <template #right>
                <div class="flex h-full">
                  <button
                    @click="editFood(item.id)"
                    class="h-full flex items-center justify-center px-4 bg-blue-500 text-white"
                  >
                    编辑
                  </button>
                  <button
                    @click="deleteFood(item.id, item.name)"
                    class="h-full flex items-center justify-center px-4 bg-red-500 text-white"
                  >
                    删除
                  </button>
                </div>
              </template>
            </van-swipe-cell>

            <!-- 空状态提示 -->
            <div
              v-if="foodStore.foodItems.length === 0"
              class="flex flex-col items-center justify-center"
            >
              <img :src="IconEmpty" alt="空状态" class="w-32 h-32 mx-auto mt-16" />
              <p class="text-center text-gray-500 mt-6">还没有添加任何菜品</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 删除按钮效果 */
  .delete-btn {
    transition: all 0.2s ease;
  }

  .delete-btn:hover {
    background-color: rgba(254, 202, 202, 0.8);
    transform: scale(1.1);
  }

  /* 分类标签动画 */
  .category-tag {
    transition: all 0.2s ease;
  }

  .category-tag:hover:not(.active-tag) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .active-tag {
    position: relative;
  }

  .active-tag::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 50%;
    width: 20px;
    height: 3px;
    background: linear-gradient(to right, #a855f7, #ec4899);
    transform: translateX(-50%);
    border-radius: 3px;
  }

  /* 波浪展示动画 */
  @keyframes waveIn {
    0% {
      opacity: 0;
      transform: translateY(20px) translateX(10px);
    }

    60% {
      opacity: 1;
      transform: translateY(-7px) translateX(-5px);
    }

    80% {
      transform: translateY(3px) translateX(2px);
    }

    100% {
      opacity: 1;
      transform: translateY(0) translateX(0);
    }
  }

  .wave-in {
    opacity: 0;
    animation: waveIn 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  }

  /* 替换现有的 fade-in 类和动画 */
  .fade-in {
    animation: waveIn 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  }

  /* 添加按钮动画 */
  .add-btn {
    transition: all 0.3s ease;
  }

  .add-btn:hover {
    transform: rotate(90deg);
    background: linear-gradient(to right, #a855f7, #ec4899);
  }

  /* 空状态样式 */
  .custom-empty {
    padding: 32px 0;
  }

  .custom-empty-description {
    text-align: center;
    font-size: 14px;
    color: #969799;
    line-height: 1.6;
  }

  /* 左滑操作按钮样式 */
  :deep(.van-swipe-cell__right) {
    height: 100%;
  }

  .van-swipe-cell {
    border-radius: 0.75rem;
    overflow: hidden;
  }
</style>
