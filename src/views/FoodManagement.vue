<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import HeaderBar from '@/components/HeaderBar.vue';

  const router = useRouter();

  // 菜品数据
  const foodItems = ref([
    {
      id: 1,
      name: '红烧肉',
      category: '家常菜',
      categoryColor: 'bg-purple-400',
      image: 'https://images.unsplash.com/photo-1555126634-323283e090fa',
    },
    {
      id: 2,
      name: '麻婆豆腐',
      category: '家常菜',
      categoryColor: 'bg-purple-400',
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246',
    },
    {
      id: 3,
      name: '水煮鱼',
      category: '家常菜',
      categoryColor: 'bg-purple-400',
      image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8',
    },
    {
      id: 4,
      name: '宫保鸡丁',
      category: '家常菜',
      categoryColor: 'bg-purple-400',
      image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e',
    },
    {
      id: 5,
      name: '葱爆羊肉',
      category: '快餐',
      categoryColor: 'bg-blue-400',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947',
    },
    {
      id: 6,
      name: '蚝油生菜',
      category: '小吃',
      categoryColor: 'bg-pink-400',
      image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564',
    },
  ]);

  // 处理返回操作
  const handleBack = () => {
    router.back();
  };

  // 删除菜品
  const deleteFood = (id, name) => {
    if (confirm(`确定要删除"${name}"吗？`)) {
      const index = foodItems.value.findIndex(item => item.id === id);
      if (index !== -1) {
        foodItems.value.splice(index, 1);
      }
    }
  };
</script>

<template>
  <div
    class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 w-screen h-screen font-sans"
  >
    <!-- 设备模拟框架 -->
    <div class="flex justify-center items-center p-4 h-full">
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
          class="flex-1 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden"
        >
          <!-- 可滚动的菜品列表 -->
          <div class="flex-1 overflow-y-auto custom-scrollbar px-4 py-3">
            <div class="space-y-3">
              <!-- 菜品项 -->
              <div
                v-for="(item, index) in foodItems"
                :key="item.id"
                class="bg-white bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-xl p-3 flex items-center shadow-sm food-card wave-in"
                :style="`animation-delay: ${0.05 * (index + 1)}s`"
              >
                <div class="w-16 h-16 rounded-lg overflow-hidden mr-3 shadow">
                  <img :src="item.image" class="w-full h-full object-cover" :alt="item.name" />
                </div>
                <div class="flex-1">
                  <h3 class="font-medium text-gray-800">{{ item.name }}</h3>
                  <p class="text-xs text-gray-500 flex items-center">
                    <span
                      :class="['inline-block w-2 h-2 rounded-full mr-1', item.categoryColor]"
                    ></span>
                    {{ item.category }}
                  </p>
                </div>
                <button
                  @click="deleteFood(item.id, item.name)"
                  class="p-2 rounded-full bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm border border-gray-100 delete-btn ripple-btn"
                >
                  <img
                    src="https://unpkg.com/lucide-static@latest/icons/trash-2.svg"
                    class="w-4 h-4 text-red-500"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 移除点击蓝色背景 */
  a,
  button {
    -webkit-tap-highlight-color: transparent;
    outline: none;
  }

  /* 卡片悬停效果 */
  .food-card {
    transition: all 0.3s ease;
    will-change: transform, opacity;
    /* 性能优化 */
  }

  .food-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  }

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

  /* 设备容器固定高度 */
  .device-container {
    height: 80%;
  }
</style>
