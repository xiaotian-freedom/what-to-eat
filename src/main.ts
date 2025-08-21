import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './assets/css/style.css';
// import './assets/css/card-flip.css';
import './assets/css/ripple.css';
// import './assets/css/wheel-animation.css';
import App from './App.vue';
import router from './router';
import i18n, { $t } from './locales';
import 'vant/lib/index.css';
import { Button, Toast, Empty, Field, Dialog, SwipeCell, Tabs, Tab, Icon } from 'vant';

const app = createApp(App);
const pinia = createPinia();
app.use(router);
app.use(pinia);
app.use(i18n);

// 将自定义$t函数注册为全局属性
app.config.globalProperties.$t = $t;
app.use(Button);
app.use(Toast);
app.use(Empty);
app.use(Field);
app.use(Dialog);
app.use(SwipeCell);
app.use(Tabs);
app.use(Tab);
app.use(Icon);

// 创建扩展的触摸事件接口
interface TouchEventWithScale extends TouchEvent {
  scale?: number;
}

// 防缩放状态管理
let isZoomPrevented = false;
let lastTouchEnd = 0;

// 禁用 iOS 设备上的缩放
const preventZoom = () => {
  // 防止重复添加事件监听器
  if (isZoomPrevented) return;
  isZoomPrevented = true;

  // 阻止手势缩放
  document.addEventListener(
    'gesturestart',
    e => {
      e.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    'gesturechange',
    e => {
      e.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    'gestureend',
    e => {
      e.preventDefault();
    },
    { passive: false }
  );

  // 阻止多指触摸缩放
  document.addEventListener(
    'touchmove',
    (e: TouchEventWithScale) => {
      if (e.scale && e.scale !== 1) {
        e.preventDefault();
      }
      // 阻止双指缩放
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // 阻止多指触摸开始
  document.addEventListener(
    'touchstart',
    e => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // 阻止双击缩放
  document.addEventListener(
    'touchend',
    e => {
      const now = new Date().getTime();
      const timeDiff = now - lastTouchEnd;

      if (timeDiff < 300 && timeDiff > 0) {
        // 双击检测，阻止默认行为
        e.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false }
  );

  // 阻止双击事件
  document.addEventListener(
    'dblclick',
    e => {
      e.preventDefault();
    },
    { passive: false }
  );

  // 阻止键盘缩放快捷键
  document.addEventListener(
    'keydown',
    e => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
};

// 在应用初始化时调用
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
  preventZoom();
}

// 确保在页面完全加载后应用防缩放
document.addEventListener('DOMContentLoaded', () => {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    preventZoom();
  }
});

// 额外的保障：在页面可见时重新应用防缩放
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    preventZoom();
  }
});

app.mount('#app');
