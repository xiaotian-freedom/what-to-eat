<template>
  <div>
    <template v-if="showMainButtons">
      <button
        class="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg transform transition flex items-center justify-center ripple-btn"
        :class="{ 'opacity-50': disabled }"
        :disabled="disabled"
        @click="$emit('randomFood')"
      >
        <img
          src="https://unpkg.com/lucide-static@latest/icons/shuffle.svg"
          class="w-5 h-5 mr-2 text-white filter invert"
        />
        随机选菜
      </button>

      <div class="flex justify-between mt-4">
        <button
          @click="$emit('addFood')"
          class="w-12 h-12 rounded-full bg-purple-500 backdrop-filter backdrop-blur-2xl shadow-lg flex items-center justify-center text-gray-700 transform transition ripple-btn"
        >
          <img
            src="https://unpkg.com/lucide-static@latest/icons/plus.svg"
            class="w-5 h-5 filter invert"
          />
        </button>
        <button
          @click="$emit('showFoodList')"
          class="w-12 h-12 rounded-full bg-pink-500 backdrop-filter backdrop-blur-2xl shadow-lg flex items-center justify-center text-gray-700 transform transition ripple-btn"
        >
          <img
            src="https://unpkg.com/lucide-static@latest/icons/list.svg"
            class="w-5 h-5 filter invert"
          />
        </button>
      </div>
    </template>

    <template v-else>
      <div class="flex justify-between w-full">
        <button
          @click="$emit('chooseAgain')"
          class="w-12 h-12 rounded-full bg-purple-500 backdrop-filter backdrop-blur-2xl shadow-lg flex items-center justify-center text-gray-700 transform transition ripple-btn"
        >
          <img
            src="https://unpkg.com/lucide-static@latest/icons/shuffle.svg"
            class="w-5 h-5 text-white filter invert"
          />
        </button>
        <button
          @click="$emit('shareResult')"
          class="w-12 h-12 rounded-full bg-pink-500 backdrop-filter backdrop-blur-2xl shadow-lg flex items-center justify-center text-gray-700 transform transition ripple-btn"
        >
          <img
            src="https://unpkg.com/lucide-static@latest/icons/share-2.svg"
            class="w-5 h-5 text-white filter invert"
          />
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
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
