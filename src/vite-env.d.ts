/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENWEATHER_API_KEY: string;
  readonly VITE_WEATHER_PROVIDER: 'openweather' | 'mock';
  readonly VITE_WEATHER_CACHE_DURATION: string;

  // DeepSeek API 配置
  readonly VITE_DEEPSEEK_API_URL: string;
  readonly VITE_DEEPSEEK_API_KEY: string;
  readonly VITE_DEEPSEEK_MODEL: string;

  // 后端 API 配置
  readonly VITE_API_URL: string;
  readonly VITE_REQUEST_TIMEOUT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
