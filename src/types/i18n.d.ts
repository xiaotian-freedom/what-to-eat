// 全局类型声明，让Vue组件能够使用自定义的$t函数
import '@vue/runtime-core';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (input: string, params?: Record<string, any>) => string;
  }
}

export {};
