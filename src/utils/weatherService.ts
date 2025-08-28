import type { WeatherData } from '@/types';
import { WeatherType } from '@/types';

// 天气服务配置
interface WeatherServiceConfig {
  apiKey?: string;
  provider: 'openweather' | 'mock';
  cacheDuration: number; // 缓存时长（分钟）
}

// 默认配置
const defaultConfig: WeatherServiceConfig = {
  apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY,
  provider: (import.meta.env.VITE_WEATHER_PROVIDER as 'openweather' | 'mock') || 'mock',
  cacheDuration: Number(import.meta.env.VITE_WEATHER_CACHE_DURATION) || 60, // 增加到60分钟缓存
};

// OpenWeatherMap API响应接口
interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  name: string;
}

// 天气缓存接口
interface WeatherCache {
  data: WeatherData;
  timestamp: number;
}

export class WeatherService {
  private config: WeatherServiceConfig;
  private cache: Map<string, WeatherCache> = new Map();

  constructor(config: Partial<WeatherServiceConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // 获取当前天气数据
  async getCurrentWeather(lat?: number, lon?: number, city?: string): Promise<WeatherData> {
    const cacheKey = this.getCacheKey(lat, lon, city);

    // 检查缓存
    const cachedData = this.getCachedWeather(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      if (this.config.provider === 'openweather' && this.config.apiKey) {
        const weatherData = await this.fetchFromOpenWeather(lat, lon, city);

        // 缓存数据
        this.cacheWeatherData(cacheKey, weatherData);

        return weatherData;
      } else {
        throw new Error('未配置有效的天气服务提供商或API密钥');
      }
    } catch (error) {
      console.warn('获取天气数据失败:', error);
      throw error; // 重新抛出错误，不使用默认天气
    }
  }

  // 从OpenWeatherMap获取天气数据
  private async fetchFromOpenWeather(
    lat?: number,
    lon?: number,
    city?: string
  ): Promise<WeatherData> {
    let url = 'https://api.openweathermap.org/data/2.5/weather';
    const params = new URLSearchParams({
      appid: this.config.apiKey!,
      units: 'metric',
      lang: 'zh_cn',
    });

    if (lat !== undefined && lon !== undefined) {
      params.append('lat', lat.toString());
      params.append('lon', lon.toString());
    } else if (city) {
      params.append('q', city);
    } else {
      throw new Error('需要提供坐标或城市名称');
    }

    url += '?' + params.toString();

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`天气API请求失败: ${response.status}`);
    }

    const data: OpenWeatherResponse = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      condition: data.weather[0].description,
      weatherType: this.mapOpenWeatherToType(data.weather[0].main, data.main.temp),
      location: data.name,
      timestamp: new Date(),
    };
  }

  // 获取用户地理位置
  async getUserLocation(): Promise<{ lat: number; lon: number; error?: string } | null> {
    return new Promise(resolve => {
      // 检查基本支持
      if (!navigator.geolocation) {
        console.warn('浏览器不支持地理位置服务');
        resolve({ lat: 0, lon: 0, error: '浏览器不支持地理位置服务' });
        return;
      }

      // 检查 HTTPS 要求（iOS Safari 必需）
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        console.warn('地理位置服务需要 HTTPS 连接');
        resolve({ lat: 0, lon: 0, error: '地理位置服务需要 HTTPS 连接' });
        return;
      }

      console.log('开始请求地理位置权限...');

      // 直接调用 getCurrentPosition，让浏览器处理权限请求
      // 不预先检查权限状态，因为 iOS Safari 的权限API支持有限
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log('成功获取用户位置:', position.coords.latitude, position.coords.longitude);
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        error => {
          let errorMessage = '获取位置失败';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '用户拒绝了位置权限请求';
              console.warn('位置权限被拒绝');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '位置信息不可用';
              console.warn('位置信息不可用');
              break;
            case error.TIMEOUT:
              errorMessage = '获取位置超时，请检查网络连接';
              console.warn('位置获取超时');
              break;
            default:
              errorMessage = `未知的位置获取错误 (错误码: ${error.code})`;
              console.warn('未知的位置获取错误:', error);
              break;
          }
          console.warn('获取地理位置失败:', errorMessage, error);
          resolve({ lat: 0, lon: 0, error: errorMessage });
        },
        {
          timeout: 10000, // 减少超时时间，提升响应速度
          enableHighAccuracy: false, // iOS Safari 上避免使用高精度模式
          maximumAge: 1800000, // 30分钟内的缓存位置可接受，减少重复请求
        }
      );
    });
  }

  // 将OpenWeatherMap的天气类型映射到我们的枚举
  private mapOpenWeatherToType(weatherMain: string, temperature: number): WeatherType {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return temperature > 30 ? WeatherType.HOT : WeatherType.SUNNY;
      case 'clouds':
        return WeatherType.CLOUDY;
      case 'rain':
      case 'drizzle':
        return WeatherType.RAINY;
      case 'snow':
        return WeatherType.SNOWY;
      case 'mist':
      case 'fog':
        return WeatherType.HUMID;
      default:
        if (temperature > 30) return WeatherType.HOT;
        if (temperature < 5) return WeatherType.COLD;
        return WeatherType.CLOUDY;
    }
  }

  // 生成缓存键
  private getCacheKey(lat?: number, lon?: number, city?: string): string {
    if (lat !== undefined && lon !== undefined) {
      return `${lat.toFixed(2)},${lon.toFixed(2)}`;
    }
    return city || 'default';
  }

  // 获取缓存的天气数据
  private getCachedWeather(cacheKey: string): WeatherData | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    const cacheAge = (now - cached.timestamp) / (1000 * 60); // 分钟

    if (cacheAge > this.config.cacheDuration) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  // 缓存天气数据
  private cacheWeatherData(cacheKey: string, data: WeatherData): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear();
  }

  // 更新配置
  updateConfig(config: Partial<WeatherServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 获取天气建议
  getWeatherRecommendation(weatherData: WeatherData): string {
    const { weatherType, temperature } = weatherData;

    switch (weatherType) {
      case WeatherType.HOT:
        return '炎热天气，建议选择清爽解腻的菜品';
      case WeatherType.COLD:
        return '寒冷天气，建议选择温热滋补的菜品';
      case WeatherType.RAINY:
        return '雨天适合来一碗热汤或者火锅';
      case WeatherType.SUNNY:
        return temperature > 25 ? '晴朗温暖，适合清淡菜品' : '阳光明媚，什么都很棒';
      case WeatherType.HUMID:
        return '潮湿天气，建议选择去湿开胃的菜品';
      default:
        return '根据天气为您推荐合适的菜品';
    }
  }
}

// 单例实例
export const weatherService = new WeatherService();

// 便捷的获取天气函数
export async function getCurrentWeather(): Promise<WeatherData | null> {
  try {
    // 首先尝试获取用户位置
    const locationResult = await weatherService.getUserLocation();

    if (
      locationResult &&
      !locationResult.error &&
      locationResult.lat !== 0 &&
      locationResult.lon !== 0
    ) {
      // 成功获取位置，使用经纬度获取天气数据
      const weather = await weatherService.getCurrentWeather(
        locationResult.lat,
        locationResult.lon
      );
      return weather;
    } else {
      // 无法获取位置，返回 null，不使用天气作为推荐因素
      console.log('无法获取用户位置，天气将不作为推荐因素:', locationResult?.error);
      return null;
    }
  } catch (error) {
    console.error('获取天气失败:', error);
    // 获取天气失败，返回 null
    return null;
  }
}
