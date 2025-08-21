<template>
  <div
    class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 font-sans h-screen flex justify-center items-center"
  >
    <!-- 步骤1: 介绍主功能 -->
    <GuideStepOne
      :is-active="currentStep === 1"
      :is-flying="isFlying"
      @skip="skipGuide"
      @next="nextStep"
    />

    <!-- 步骤2: 菜品管理功能 -->
    <GuideStepTwo
      :is-active="currentStep === 2"
      :is-flying="isFlying"
      @skip="skipGuide"
      @next="nextStep"
    />

    <!-- 步骤3: 准备完成 -->
    <GuideStepThree :is-active="currentStep === 3" :is-flying="isFlying" @start="startApp" />
  </div>
</template>

<script setup>
  import { ref, onMounted, useTemplateRef } from 'vue';
  import GuideStepOne from '../components/guide/GuideStepOne.vue';
  import GuideStepTwo from '../components/guide/GuideStepTwo.vue';
  import GuideStepThree from '../components/guide/GuideStepThree.vue';
  import { wheelAnimation } from '../utils/wheel-animation';
  import { useRouter } from 'vue-router';
  import gsap from 'gsap'; // 导入GSAP

  // 使用路由
  const router = useRouter();

  // 响应式状态
  const currentStep = ref(1);
  const isFlying = ref(false);
  const showHomePreview = ref(false);

  // 添加DOM引用
  const step1Ref = useTemplateRef('step1');
  const step2Ref = useTemplateRef('step2');
  const step3Ref = useTemplateRef('step3');

  // 切换到下一步
  const nextStep = step => {
    if (currentStep.value === step) return;

    // 使用ref获取当前步骤元素和目标步骤元素
    const stepsRefs = [null, '#step1', '#step2', '#step3'];
    const currentEl = stepsRefs[currentStep.value];
    const nextEl = stepsRefs[step];

    // 确保元素都存在
    if (currentEl && nextEl) {
      // 使用拨轮动画
      wheelAnimation(currentEl, nextEl, () => {
        // 动画完全结束后才更新当前步骤
        currentStep.value = step;
      });
    } else {
      // 如果元素不存在，则直接更新步骤
      currentStep.value = step;
    }
  };

  // 跳过引导
  const skipGuide = () => {
    startApp();
  };

  // 开始使用应用
  const startApp = () => {
    // 添加飞出动画
    isFlying.value = true;

    // 获取当前激活的步骤元素
    const activeStep = document.querySelector(`#step${currentStep.value}`);

    if (activeStep) {
      // 使用GSAP创建更强烈的吸出效果动画
      gsap.to(activeStep, {
        y: -window.innerHeight * 0.7, // 向上移动距离
        scaleY: 0.1, // 垂直方向强烈压缩
        scaleX: 0.5, // 水平方向轻微压缩
        opacity: 0,
        duration: 0.6, // 缩短动画时间使效果更突然
        transformOrigin: 'top center', // 从顶部开始变换
        ease: 'power4.in', // 更强的加速效果
        onComplete: () => {
          // 动画完成后跳转
          router.replace('/home');
        },
      });
    } else {
      // 如果没有找到元素，直接跳转
      router.replace('/home');
    }
  };
</script>

<style>
  @keyframes floatAnimation {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  .float-animation {
    animation: floatAnimation 3s ease-in-out infinite;
  }

  .float-animation-delay-1 {
    animation-delay: 0.5s;
  }

  .float-animation-delay-2 {
    animation-delay: 1s;
  }

  @keyframes pulseAnimation {
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

  .pulse-animation {
    animation: pulseAnimation 3s ease-in-out infinite;
  }

  @keyframes rotateAnimation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .rotate-slow {
    animation: rotateAnimation 20s linear infinite;
  }

  /* 动画类 - 仅在切换时应用 */
  .slide-in-right {
    animation: slideInRight 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
  }

  .slide-out-left {
    animation: slideOutLeft 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutLeft {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(-100%);
      opacity: 0;
    }
  }

  /* 新增动画效果 */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes popUp {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
