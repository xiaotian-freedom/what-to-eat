<template>
  <div
    class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 font-sans w-full h-screen device-container px-5 flex justify-center items-center"
  >
    <div
      id="addFoodPage"
      class="card-face bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative w-full"
    >
      <!-- 使用封装的顶部状态栏组件 -->
      <HeaderBar
        :title="isEdit ? $t('pages.editFood') : $t('pages.addFood')"
        :showBackButton="true"
        :onBack="goBack"
      />

      <!-- 标签页切换 -->
      <van-tabs v-model:active="activeTab" class="custom-tabs">
        <van-tab :title="$t('tabs.presetDishes')" name="preset">
          <!-- 预设菜品区域 -->
          <div class="preset-dishes-container">
            <!-- 搜索框 -->
            <div class="search-container mb-4">
              <van-field
                v-model="searchKeyword"
                :placeholder="$t('search.placeholder')"
                class="search-field"
                :border="false"
                clearable
              >
                <template #left-icon>
                  <van-icon name="search" class="text-gray-400" />
                </template>
              </van-field>
            </div>

            <!-- 菜品网格 -->
            <div class="dishes-grid">
              <div
                v-for="dish in filteredDishes"
                :key="dish.name"
                class="dish-card"
                :class="{
                  'already-added': isDishAdded(dish.name),
                  'show-remove': showRemoveButtons.has(dish.name),
                }"
                @click="handleDishClick(dish, $event)"
              >
                <div class="dish-image-container">
                  <img :src="dish.image" :alt="dish.name" class="dish-image" />
                  <div class="dish-overlay">
                    <van-icon name="plus" class="add-icon" />
                    <van-icon name="success" class="success-icon" />
                  </div>
                  <!-- 移除按钮 -->
                  <div
                    v-if="showRemoveButtons.has(dish.name)"
                    class="remove-button"
                    @click="removeDish(dish, $event)"
                  >
                    <van-icon name="cross" class="remove-icon" />
                  </div>
                </div>
                <div class="dish-info">
                  <h3 class="dish-name">{{ dish.name }}</h3>
                  <p class="dish-desc">{{ dish.desc }}</p>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="filteredDishes.length === 0" class="empty-state">
              <van-icon name="search" class="empty-icon" />
              <p class="empty-text">{{ $t('search.noResults') }}</p>
            </div>
          </div>
        </van-tab>

        <van-tab :title="$t('tabs.customAdd')" name="custom">
          <!-- 自定义添加区域 -->
          <div class="custom-add-container">
            <!-- 上传图片区域 -->
            <div class="mb-8 flex justify-center pt-8">
              <div
                class="w-44 h-44 rounded-full bg-white/50 backdrop-filter backdrop-blur-sm border-2 border-white border-opacity-60 flex flex-col items-center justify-center shadow-lg relative image-upload-area cursor-pointer focus:outline-none focus:ring-0"
                @click="triggerFileInput"
              >
                <div
                  class="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center"
                >
                  <img
                    :src="previewSrc"
                    class="w-full h-full object-cover"
                    :style="{ opacity: imageSelected ? '1' : '0.7' }"
                    @error="handleImageError"
                  />
                </div>
                <div
                  class="absolute inset-0 rounded-full flex items-center justify-center bg-black/30 backdrop-filter backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300 focus:outline-none image-overlay"
                  :style="{
                    opacity: imageSelected ? '0' : '1',
                    pointerEvents: imageSelected ? 'none' : 'auto',
                  }"
                >
                  <div
                    class="p-3 rounded-full bg-white bg-opacity-80 shadow-lg upload-icon-pulse focus:outline-none"
                  >
                    <img :src="IconCamera" class="w-6 h-6" />
                  </div>
                </div>
                <input
                  type="file"
                  ref="fileInput"
                  class="hidden"
                  accept="image/*"
                  @change="onFileChange"
                />
              </div>
            </div>

            <!-- 简化的表单输入区域 -->
            <div class="space-y-4 mt-8">
              <div class="space-y-1">
                <van-field
                  v-model="foodName"
                  :placeholder="t('form.dishNamePlaceholder')"
                  class="rounded-xl !py-3 !px-4 !text-base !border-1 !border-purple-500"
                  :border="false"
                  input-align="center"
                  clearable
                />
              </div>
            </div>

            <!-- 底部按钮区域 -->
            <button
              @click="submitForm"
              class="w-full py-4 my-5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg transform transition flex items-center justify-center focus:outline-none focus:ring-0"
            >
              <img :src="IconConfirm" class="w-5 h-5 mr-2" />
              {{ isEdit ? $t('common.save') : $t('common.add') }}
            </button>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>
<script setup lang="ts">
  import IconCamera from '@/assets/icons/camera.svg';
  import IconConfirm from '@/assets/icons/confirm.svg';
  import ImgTofu from '@/assets/images/tofu.jpg';
  import HeaderBar from '@/components/HeaderBar.vue';
  import { dishList } from '@/data/dishList';
  import { useFoodStore } from '@/stores';
  import type { Food } from '@/types/food';
  import { ColorManager } from '@/utils/ColorManager';
  import { upload } from '@/utils/qiniu';
  import { getUploadToken, initQiniu } from '@/utils/upload';
  import { closeToast, showFailToast, showLoadingToast, showSuccessToast, showToast } from 'vant';
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';

  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  // 菜品store
  const foodStore = useFoodStore();
  // 文件输入框
  const fileInput = ref<HTMLInputElement | null>(null);
  // 菜品名称
  const foodName = ref('');
  // 预览图片
  const previewSrc = ref(ImgTofu);
  // 是否选择图片
  const imageSelected = ref(false);
  // 是否为编辑模式
  const isEdit = ref(false);
  // 编辑菜品id
  const editFoodId = ref<string | null>(null);
  // 图片加载失败状态
  const imageLoadFailed = ref(false);
  // 标签页激活状态
  const activeTab = ref('preset');
  // 搜索关键词
  const searchKeyword = ref('');

  // 显示移除按钮的菜品集合
  const showRemoveButtons = ref<Set<string>>(new Set());

  // 预设菜品数据 - 使用导入的dishList
  const presetDishes = ref(dishList);

  // 过滤预设菜品 - 使用computed实现响应式搜索
  const filteredDishes = computed(() => {
    if (!searchKeyword.value.trim()) {
      return presetDishes.value;
    }
    const keyword = searchKeyword.value.toLowerCase();
    return presetDishes.value.filter(
      dish => dish.name.toLowerCase().includes(keyword) || dish.desc.toLowerCase().includes(keyword)
    );
  });

  // 在组件挂载时检查是否为编辑模式
  onMounted(() => {
    // 重置图片加载失败状态
    imageLoadFailed.value = false;

    if (route.query.id) {
      isEdit.value = true;
      editFoodId.value = route.query.id as string;

      // 获取要编辑的菜品数据
      const foodToEdit = foodStore.getFoodById(editFoodId.value);
      if (foodToEdit) {
        foodName.value = foodToEdit.name;
        if (foodToEdit.image) {
          previewSrc.value = foodToEdit.image;
          imageSelected.value = true;
        } else if (foodToEdit.backgroundColor) {
          // 如果没有图片，可以显示背景色
          previewSrc.value = ImgTofu;
          imageSelected.value = false;
        }
      }
    }
    // 预设菜品已经在computed中处理，无需手动初始化

    // 添加点击外部区域关闭移除按钮的事件监听
    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dish-card')) {
        showRemoveButtons.value.clear();
      }
    };

    document.addEventListener('click', handleClickOutside);

    // 组件卸载时移除事件监听
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

  // 触发文件选择
  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  // 文件选择后预览
  const onFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // 验证文件类型和大小
    if (!file.type.startsWith('image/')) {
      showToast(t('form.imageRequired'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast(t('messages.imageSizeLimit'));
      return;
    }
    uploadToQiniu(file);
  };

  // 上传到七牛云
  const uploadToQiniu = async (file: File) => {
    try {
      showLoadingToast('上传中...');
      const uploadToken = await getUploadToken();
      if (uploadToken && uploadToken.data.status === 0 && uploadToken.data.code === 200) {
        initQiniu(uploadToken.data.data.uptoken, file.name, uploadToken.data.data.domain);
        upload(
          file,
          (res: any) => {
            showToast(t('messages.uploadSuccess'));
            const imgUrl = uploadToken.data.data.domain + '/' + res.key;
            console.log(imgUrl, 'imgUrl');
            updateFoodImage(imgUrl);
          },
          (error: any) => {
            console.log(error);
            showFailToast(t('messages.uploadFailed'));
          },
          () => {
            closeToast();
          }
        );
      } else {
        showFailToast(t('messages.uploadTokenFailed'));
      }
    } catch (error) {
      console.log(error);
      showFailToast(t('messages.uploadRetry'));
    } finally {
      // 重置 input
      if (fileInput.value) {
        fileInput.value.value = '';
        fileInput.value.capture = '';
      }
    }
  };

  // 处理图片加载失败
  const handleImageError = (): void => {
    imageLoadFailed.value = true;
    // 重置为默认图片
    previewSrc.value = ImgTofu;
    imageSelected.value = false;
  };

  // 更新菜品图片
  const updateFoodImage = (imgUrl: string) => {
    previewSrc.value = imgUrl;
    console.log(previewSrc.value, 'previewSrc');
    imageSelected.value = true;
    imageLoadFailed.value = false; // 重置失败状态
    if (isEdit.value && editFoodId.value) {
      const updatedFood: Food = {
        id: editFoodId.value,
        name: foodName.value.trim(),
        image: imgUrl,
      };
      foodStore.updateFood(updatedFood);
    }
  };

  // 返回函数
  const goBack = () => {
    router.back();
  };

  // 检查菜品是否已添加
  const isDishAdded = (dishName: string) => {
    return foodStore.foodItems.some((food: Food) => food.name === dishName);
  };

  // 提交表单
  const submitForm = () => {
    if (!foodName.value.trim()) {
      showToast(t('form.nameRequired'));
      return;
    }

    if (isEdit.value && editFoodId.value) {
      // 修改现有菜品
      const updatedFood: Food = {
        id: editFoodId.value,
        name: foodName.value.trim(),
        image: imageSelected.value ? previewSrc.value : '',
        // 如果没有选择图片，则使用背景色
        backgroundColor: !imageSelected.value ? ColorManager.getRandomColor() : '',
      };

      // 使用 store 更新菜品
      foodStore.updateFood(updatedFood);
      showSuccessToast(t('messages.editSuccess'));
    } else {
      // 创建新菜品对象
      const newFood: Omit<Food, 'id'> = {
        name: foodName.value.trim(),
        // 如果用户没有上传图片，则使用随机颜色代替图片
        image: imageSelected.value ? previewSrc.value : '',
        category: '默认',
        categoryColor: ColorManager.getRandomColor(),
        // 添加背景颜色属性，在没有图片时使用
        backgroundColor: !imageSelected.value ? ColorManager.getRandomColor() : '',
      };

      // 使用 store 添加菜品
      foodStore.addFood(newFood);
      showSuccessToast(t('messages.addSuccess'));
    }

    // 操作完成后返回
    router.back();
  };

  // 处理菜品点击
  const handleDishClick = (dish: (typeof presetDishes.value)[0], event: Event) => {
    const isAdded = isDishAdded(dish.name);

    if (isAdded) {
      // 如果已添加，切换移除按钮显示状态
      if (showRemoveButtons.value.has(dish.name)) {
        showRemoveButtons.value.delete(dish.name);
      } else {
        // 清除其他显示移除按钮的菜品
        showRemoveButtons.value.clear();
        showRemoveButtons.value.add(dish.name);
      }
    } else {
      // 如果未添加，直接添加菜品
      selectPresetDish(dish, event);
    }
  };

  // 移除菜品
  const removeDish = async (dish: (typeof presetDishes.value)[0], event: Event) => {
    event.stopPropagation(); // 阻止事件冒泡

    try {
      showLoadingToast(t('messages.removing'));

      // 使用 store 删除菜品
      const success = foodStore.deleteFoodByName(dish.name);

      if (success) {
        showRemoveButtons.value.delete(dish.name);
        showSuccessToast(t('messages.removeSuccess'));
      } else {
        showFailToast(t('messages.removeFailed'));
      }
    } catch (error) {
      console.error('移除预设菜品失败:', error);
      showFailToast(t('messages.operationFailed'));
    }
  };

  // 选择预设菜品 - 直接添加到用户菜品库
  const selectPresetDish = async (dish: (typeof presetDishes.value)[0], event: Event) => {
    const target = event.currentTarget as HTMLElement;

    // 检查是否已存在相同名称的菜品
    const existingFood = foodStore.foodItems.find((food: Food) => food.name === dish.name);

    if (existingFood) {
      return; // 如果已存在，不执行任何操作
    }

    // 添加点击动效
    target.classList.add('clicked');

    // 移除动效类名
    setTimeout(() => {
      target.classList.remove('clicked');
    }, 300);

    try {
      showLoadingToast(t('messages.adding'));

      // 创建新菜品对象
      const newFood: Omit<Food, 'id'> = {
        name: dish.name,
        image: dish.image || '',
        category: '预设',
        categoryColor: ColorManager.getRandomColor(),
        backgroundColor: !dish.image ? ColorManager.getRandomColor() : '',
      };

      // 使用 store 添加菜品
      foodStore.addFood(newFood);

      showSuccessToast(t('messages.addSuccess'));
    } catch (error) {
      console.error('添加预设菜品失败:', error);
      showFailToast(t('messages.addFailed'));
    }
  };
</script>

<style scoped>
  /* 移除点击蓝色背景 */
  a,
  button,
  div {
    -webkit-tap-highlight-color: transparent;
    outline: none;
  }

  .image-upload-area {
    transition: all 0.3s ease;
  }

  .upload-icon-pulse {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }

    50% {
      transform: scale(1.1);
      opacity: 1;
    }

    100% {
      transform: scale(1);
      opacity: 0.8;
    }
  }

  .image-overlay {
    transition: opacity 0.3s ease;
  }

  .custom-tabs {
    height: calc(100vh - 200px);
    overflow: hidden;
  }

  .custom-tabs :deep(.van-tabs__content) {
    height: calc(100% - 44px);
    overflow-y: auto;
  }

  .custom-tabs :deep(.van-tab__panel) {
    height: 100%;
    padding: 0;
  }

  .preset-dishes-container {
    padding: 16px;
    height: 100%;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .search-container {
    margin-bottom: 16px;
  }

  .search-field {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 25px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .dishes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    padding-bottom: 20px;
  }

  .dish-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    position: relative;
    user-select: none;
  }

  .dish-card:active {
    transform: translateY(-4px) scale(0.98);
    transition: all 0.1s ease;
  }

  /* 点击波纹效果 */
  .dish-card::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(139, 92, 246, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
    pointer-events: none;
    z-index: 1;
  }

  .dish-card.clicked::before {
    width: 200px;
    height: 200px;
  }

  /* 已添加菜品的样式 */
  .dish-card.already-added {
    opacity: 0.9;
    filter: grayscale(0.1);
    border-color: rgba(34, 197, 94, 0.8);
    position: relative;
  }

  .dish-card.already-added::after {
    content: '✓';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    background: rgba(34, 197, 94, 0.9);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    z-index: 2;
  }

  .dish-card.already-added .dish-overlay {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.8));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .dish-card.already-added .add-icon {
    opacity: 0;
  }

  .dish-card.already-added .success-icon {
    opacity: 0;
  }

  .dish-card.already-added:active {
    transform: translateY(-2px) scale(0.98);
    opacity: 1;
    border-color: rgba(239, 68, 68, 0.8);
  }

  .dish-card.already-added:active .dish-overlay {
    opacity: 1;
  }

  .dish-card.already-added:active .add-icon {
    opacity: 1;
  }

  .dish-card.already-added:active::after {
    background: rgba(239, 68, 68, 0.9);
    content: '−';
  }

  /* 移除按钮样式 */
  .remove-button {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background: rgba(239, 68, 68, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 3;
    transition: all 0.2s ease;
  }

  .remove-button:active {
    transform: scale(0.9);
    background: rgba(220, 38, 38, 0.9);
  }

  .remove-icon {
    color: white;
    font-size: 14px;
  }

  /* 显示移除按钮时的菜品样式 */
  .dish-card.show-remove {
    border-color: rgba(239, 68, 68, 0.8);
  }

  .dish-card.show-remove::after {
    display: none;
  }

  .dish-image-container {
    position: relative;
    width: 100%;
    height: 100px;
    overflow: hidden;
  }

  .dish-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .dish-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.8));
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .dish-card.clicked .dish-overlay {
    opacity: 1;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.9));
  }

  .add-icon {
    color: white;
    font-size: 24px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    transition: opacity 0.3s ease;
  }

  .success-icon {
    color: white;
    font-size: 28px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    position: absolute;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .dish-card.clicked .add-icon {
    opacity: 0;
  }

  .dish-card.clicked .success-icon {
    opacity: 1;
  }

  .dish-info {
    padding: 12px 8px;
    text-align: center;
  }

  .dish-name {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
    color: #374151;
    line-height: 1.2;
  }

  .dish-desc {
    font-size: 11px;
    color: #6b7280;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #9ca3af;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 16px;
    font-weight: 500;
  }

  .custom-add-container {
    padding: 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    height: 100%;
    overflow-y: auto;
  }
</style>
