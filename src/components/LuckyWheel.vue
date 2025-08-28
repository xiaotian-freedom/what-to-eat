<template>
  <div class="lucky-wheel-container">
    <LuckyWheel
      ref="luckyWheelRef"
      :width="wheelSizeInPixels"
      :height="wheelSizeInPixels"
      :blocks="blocks"
      :prizes="prizes"
      :buttons="buttons"
      :defaultStyle="defaultStyle"
      :defaultConfig="defaultConfig"
      @start="onStart"
      @end="onEnd"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { LuckyWheel } from '@lucky-canvas/vue';
  import type { Food } from '@/types';
  import { useWheelModeStore } from '@/stores/wheelMode';
  import { getThemeColor } from '@/utils/colorUtils';

  interface Props {
    foodList: Food[];
    disabled?: boolean;
    currentTheme?: string;
  }

  interface Emits {
    (e: 'result', food: Food): void;
  }

  // 转盘项目类型（只包含食物）
  interface WheelItem extends Food {
    type: 'food';
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();
  const wheelModeStore = useWheelModeStore();

  const luckyWheelRef = ref<InstanceType<typeof LuckyWheel>>();
  const isSpinning = ref(false);

  // 转盘项目列表（只包含食物）
  const wheelItems = computed((): WheelItem[] => {
    const foods = props.foodList.slice(0, 10); // 最多10个食物
    return foods.map(food => ({ ...food, type: 'food' as const }));
  });

  // 获取主题色 - 使用统一的主题系统
  const themeColor = computed(() => {
    return getThemeColor('--color-primary');
  });

  // 获取转盘大小
  const wheelSizeInPixels = computed(() => wheelModeStore.getWheelSizeInPixels());

  // 默认颜色组
  const defaultColors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
  ];

  // 获取扇形颜色
  const getSectorColor = (item: WheelItem, index: number) => {
    return item.backgroundColor || defaultColors[index % defaultColors.length];
  };

  // 转盘外圈配置
  const blocks = computed(() => [
    {
      padding: '10px',
      background: themeColor.value,
      borderRadius: '50%',
    },
  ]);

  // 奖品配置
  const prizes = computed(() =>
    wheelItems.value.map((item, index) => ({
      index,
      background: getSectorColor(item, index),
      fonts: [
        {
          text: item.name,
          top: '20%',
          fontColor: '#fff',
          fontSize: '12px',
          fontWeight: '600',
          textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
        },
      ],
    }))
  );

  // 按钮配置
  const buttons = computed(() => [
    {
      radius: '25%',
      background: themeColor.value,
      pointer: true,
      disabled: isSpinning.value,
      fonts: [
        {
          text: isSpinning.value ? '转动中...' : '开始',
          top: '-10px',
          fontColor: '#fff',
          fontSize: '14px',
          fontWeight: '600',
        },
      ],
    },
  ]);

  // 默认样式
  const defaultStyle = computed(() => ({
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    borderRadius: '10px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  }));

  // 默认配置
  const defaultConfig = computed(() => ({
    gutter: 2,
    offsetDegree: 0,
    speed: 20,
    accelerationTime: 2500,
    decelerationTime: 2500,
  }));

  // 开始转动
  const onStart = () => {
    if (props.disabled || isSpinning.value) return;

    isSpinning.value = true;
    console.log('转盘开始转动');

    // 调用 play 方法开始转盘旋转
    if (luckyWheelRef.value) {
      luckyWheelRef.value.play();
    }

    // 随机选择一个索引
    const randomIndex = Math.floor(Math.random() * wheelItems.value.length);

    // 延迟停止转盘
    setTimeout(() => {
      if (luckyWheelRef.value) {
        luckyWheelRef.value.stop(randomIndex);
      }
    }, Math.random() * 3000 + 2000); // 2-5秒后停止
  };

  // 转动结束
  const onEnd = async (prize: any) => {
    isSpinning.value = false;
    console.log('转盘停止，结果:', prize);

    const selectedItem = wheelItems.value[prize.index];

    console.log('=== Lucky Wheel 结果分析 ===');
    console.log('选中索引:', prize.index);
    console.log(
      '选中项目:',
      selectedItem?.name,
      '类型:',
      selectedItem?.type,
      'ID:',
      selectedItem?.id
    );
    console.log('==================');

    // 现在只有食物项目，直接处理
    console.log('选中食物:', selectedItem.name);
    const foodItem = selectedItem as Food;
    if (foodItem.id && foodItem.name) {
      emit('result', foodItem);
    }
  };

  // 手动触发转盘（保持与原组件的兼容性）
  const spin = () => {
    if (luckyWheelRef.value && !isSpinning.value) {
      luckyWheelRef.value.play();
    }
  };

  // 暴露方法给父组件
  defineExpose({
    spin,
  });
</script>

<style scoped>
  .lucky-wheel-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 10px;
  }

  /* 响应式调整 */
  @media (max-width: 480px) {
    .lucky-wheel-container {
      padding: 5px;
    }
  }
</style>
