import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './assets/css/style.css';
// import './assets/css/card-flip.css';
import './assets/css/ripple.css';
// import './assets/css/wheel-animation.css';
import App from './App.vue';
import router from './router';
import 'vant/lib/index.css';
import { Button, Toast, Empty, Field, Dialog, SwipeCell } from 'vant';

const app = createApp(App);
const pinia = createPinia();
app.use(router);
app.use(pinia);
app.use(Button);
app.use(Toast);
app.use(Empty);
app.use(Field);
app.use(Dialog);
app.use(SwipeCell);

// 创建扩展的触摸事件接口
interface TouchEventWithScale extends TouchEvent {
  scale?: number;
}

// 禁用 iOS 设备上的缩放
const preventZoom = () => {
  document.addEventListener('gesturestart', e => {
    e.preventDefault();
  });

  document.addEventListener(
    'touchmove',
    (e: TouchEventWithScale) => {
      if (e.scale && e.scale !== 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener(
    'touchstart',
    e => {
      if (e.touches.length > 1) {
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

app.mount('#app');
