<template>
  <div>
    <template v-if="showMainButtons">
      <button
        class="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg transform transition flex items-center justify-center ripple-btn"
        :class="{ 'opacity-50': disabled }"
        :disabled="disabled"
        @click="$emit('randomFood')"
      >
        <img :src="shuffle" class="w-5 h-5 mr-2" />
        随机选菜
      </button>

      <div class="flex justify-between mt-4">
        <button
          @click="$emit('addFood')"
          class="w-16 h-16 rounded-full bg-purple-500 backdrop-filter backdrop-blur-2xl shadow-lg flex items-center justify-center text-gray-700 transform transition ripple-btn"
        >
          <img :src="plus" class="w-7 h-7" />
        </button>
        <button
          @click="$emit('showFoodList')"
          class="w-16 h-16 rounded-full bg-pink-500 backdrop-filter backdrop-blur-2xl shadow-lg flex items-center justify-center text-gray-700 transform transition ripple-btn"
        >
          <img :src="list" class="w-7 h-7" />
        </button>
      </div>
    </template>

    <template v-else>
      <div class="flex justify-between w-full">
        <button
          @click="$emit('chooseAgain')"
          class="w-16 h-16 rounded-full bg-purple-500 backdrop-filter backdrop-blur-2xl shadow-lg flex items-center justify-center text-gray-700 transform transition ripple-btn"
        >
          <img :src="shuffle" class="w-7 h-7" />
        </button>
        <button
          @click="$emit('shareResult')"
          class="w-16 h-16 rounded-full bg-pink-500 backdrop-filter backdrop-blur-2xl shadow-lg flex items-center justify-center text-gray-700 transform transition ripple-btn"
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

  defineProps<{
    disabled: boolean;
    showMainButtons: boolean;
  }>();

  defineEmits<{
    (e: 'randomFood'): void;
    (e: 'addFood'): void;
    (e: 'showFoodList'): void;
    (e: 'chooseAgain'): void;
    (e: 'shareResult'): void;
  }>();
</script>
