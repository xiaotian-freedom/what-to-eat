import { createApp } from 'vue';
import './assets/css/style.css';
// import './assets/css/card-flip.css';
import './assets/css/ripple.css';
// import './assets/css/wheel-animation.css';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
