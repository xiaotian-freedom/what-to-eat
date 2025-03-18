<template>
  <div
    class="bg-white/70 backdrop-filter backdrop-blur-lg p-4 flex justify-between items-center border-b border-gray-100"
  >
    <div class="flex items-center" :class="{ 'w-full': centerTitle }">
      <a
        v-if="showBackButton"
        href="#"
        @click.prevent="handleBack"
        class="text-gray-600 mr-2 hover:bg-gray-100 p-1.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0"
      >
        <img src="https://unpkg.com/lucide-static@latest/icons/chevron-left.svg" class="w-5 h-5" />
      </a>
      <div
        :class="[
          'text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500',
          centerTitle ? 'text-center flex-1' : '',
        ]"
      >
        {{ title }}
      </div>
    </div>

    <a
      v-if="rightIcon"
      href="#"
      @click.prevent="handleRightIconClick"
      class="text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0"
    >
      <img :src="rightIcon" class="w-5 h-5" />
    </a>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const props = withDefaults(
    defineProps<{
      title: string;
      centerTitle?: boolean;
      showBackButton?: boolean;
      rightIcon?: string;
      onBack?: () => void;
      onRightIconClick?: () => void;
    }>(),
    {
      centerTitle: false,
      showBackButton: true,
      rightIcon: '',
      onBack: undefined,
      onRightIconClick: undefined,
    }
  );

  const handleBack = () => {
    if (props.onBack) {
      props.onBack();
    } else {
      router.back();
    }
  };

  const handleRightIconClick = () => {
    if (props.onRightIconClick) {
      props.onRightIconClick();
    }
  };
</script>

<style scoped>
  a {
    -webkit-tap-highlight-color: transparent;
    outline: none;
  }
</style>
