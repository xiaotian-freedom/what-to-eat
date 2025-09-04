<template>
  <div>
    <template v-if="showMainButtons">
      <div class="flex justify-between items-center mt-4">
        <button
          @click="$emit('addFood')"
          class="w-16 h-16 rounded-full backdrop-filter backdrop-blur-2xl shadow-lg flex items-center justify-center transform transition ripple-btn theme-transition"
          :style="{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-text)',
            boxShadow: '0 10px 15px -3px var(--color-shadow)',
          }"
        >
          <img :src="plus" class="w-7 h-7" />
        </button>

        <!-- 主随机按钮 -->
        <button
          class="w-20 h-20 rounded-full text-white font-bold text-lg shadow-lg transform transition flex items-center justify-center ripple-btn theme-transition"
          :class="{ 'opacity-50': disabled }"
          :disabled="disabled"
          @click="$emit('randomFood')"
          :style="{
            backgroundColor: 'var(--color-primary)',
            boxShadow: '0 10px 15px -3px var(--color-shadow)',
          }"
        >
          <img :src="shuffle" class="w-8 h-8" />
        </button>

        <button
          @click="$emit('showFoodList')"
          class="w-16 h-16 rounded-full backdrop-filter backdrop-blur-2xl shadow-lg flex items-center justify-center transform transition ripple-btn theme-transition"
          :style="{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-text)',
            boxShadow: '0 10px 15px -3px var(--color-shadow)',
          }"
        >
          <img :src="list" class="w-7 h-7" />
        </button>
      </div>
    </template>

    <template v-else>
      <div class="flex justify-between items-center w-full">
        <button
          @click="$emit('chooseAgain')"
          class="w-16 h-16 rounded-full backdrop-filter backdrop-blur-2xl shadow-lg flex items-center justify-center transform transition ripple-btn theme-transition"
          :style="{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-text)',
            boxShadow: '0 10px 15px -3px var(--color-shadow)',
          }"
        >
          <img :src="shuffle" class="w-7 h-7" />
        </button>

        <!-- 查看做法按钮 - 中间位置，比两边按钮略大 -->
        <button
          @click="$emit('viewRecipe')"
          :disabled="recipeLoading"
          class="w-20 h-20 rounded-full text-white font-bold shadow-lg transform transition flex items-center justify-center ripple-btn relative theme-transition"
          :class="{ 'opacity-75': recipeLoading }"
          :style="{
            backgroundColor: 'var(--color-primary)',
            boxShadow: '0 10px 15px -3px var(--color-shadow)',
          }"
        >
          <div v-if="recipeLoading" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          </div>
          <div v-else class="flex flex-col items-center">
            <img :src="utensils" class="w-7 h-7" />
          </div>
        </button>

        <button
          @click="$emit('shareResult')"
          class="w-16 h-16 rounded-full backdrop-filter backdrop-blur-2xl shadow-lg flex items-center justify-center transform transition ripple-btn theme-transition"
          :style="{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-text)',
            boxShadow: '0 10px 15px -3px var(--color-shadow)',
          }"
        >
          <img :src="share" class="w-6 h-6" />
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import shuffle from '@/assets/icons/shuffle.svg';
  import plus from '@/assets/icons/plus.svg';
  import list from '@/assets/icons/list.svg';
  import share from '@/assets/icons/share.svg';
  import utensils from '@/assets/icons/utensils.svg';

  defineProps<{
    disabled: boolean;
    showMainButtons: boolean;
    recipeLoading?: boolean;
  }>();

  defineEmits<{
    (e: 'randomFood'): void;
    (e: 'addFood'): void;
    (e: 'showFoodList'): void;
    (e: 'chooseAgain'): void;
    (e: 'shareResult'): void;
    (e: 'viewRecipe'): void;
  }>();
</script>
