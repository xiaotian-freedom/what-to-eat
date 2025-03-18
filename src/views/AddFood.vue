<template>
  <div
    class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 font-sans w-full h-screen device-container px-5 flex justify-center items-center"
  >
    <div
      id="addFoodPage"
      class="card-face bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative w-full"
    >
      <!-- 使用封装的顶部状态栏组件 -->
      <HeaderBar title="添加菜品" :showBackButton="true" :onBack="goBack" />

      <!-- 内容区域 - 添加菜品表单 -->
      <div
        class="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 flex flex-col justify-center"
      >
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
                alt="菜品示例"
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
              placeholder="输入菜品名称"
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
          <img :src="IconConfirm" class="w-5 h-5 mr-2 filter invert" />
          确认添加
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import HeaderBar from '@/components/HeaderBar.vue';
  import { useFoodStore } from '@/stores';
  import type { Food } from '@/types/food';
  import { showSuccessToast, showToast } from 'vant';
  import { ColorManager } from '@/utils/ColorManager';
  import IconConfirm from '@/assets/icons/confirm.svg';
  import IconCamera from '@/assets/icons/camera.svg';
  import previewImg from '@/assets/images/preview.jpeg';

  const router = useRouter();
  const foodStore = useFoodStore();
  const fileInput = ref<HTMLInputElement | null>(null);
  const foodName = ref('');
  const previewSrc = ref(previewImg);
  const imageSelected = ref(false);

  // 触发文件选择
  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  // 文件选择后预览
  const onFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) {
          previewSrc.value = e.target.result as string;
          imageSelected.value = true;
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  // 返回函数
  const goBack = () => {
    router.back();
  };

  // 提交表单
  const submitForm = () => {
    if (!foodName.value.trim()) {
      showToast('请输入菜品名称');
      return;
    }

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

    // 清除表单
    foodName.value = '';
    previewSrc.value = '';
    imageSelected.value = false;

    showSuccessToast('添加成功');
    // router.back();
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

  .image-upload-area:hover {
    transform: scale(1.05);
    box-shadow: 0 0 25px rgba(167, 139, 250, 0.5);
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
</style>
