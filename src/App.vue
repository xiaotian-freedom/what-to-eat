<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="typeof route.meta?.transition === 'string' ? route.meta.transition : 'slide'"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
  /* 滑动转场效果 */
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.3s ease;
  }

  .slide-enter-from {
    opacity: 0;
    transform: translateX(100%);
  }

  .slide-leave-to {
    opacity: 0;
    transform: translateX(-100%);
  }

  /* 淡入淡出效果 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
