import { useUserStore } from '@/stores/user';
import axios, { type AxiosRequestConfig } from 'axios';
import { showFailToast } from 'vant';

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: import.meta.env.VITE_REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('access_token');
    // 如果有 token，添加到请求头
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    console.log('response', response);
    const { code, msg, status } = response.data;
    // 请求成功
    if (code === 200 && status === 0) {
      return response;
    }

    // token 过期或无效
    if (code === 401) {
      const userStore = useUserStore();
      userStore.token = '';
      userStore.setUserInfo({});
      // 跳转到首页
      window.location.href = '/home';
      return Promise.reject(new Error(msg || '登录已过期，请重新登录'));
    }

    // 其他错误
    showFailToast(msg || '请求失败');
    return Promise.reject(new Error(msg || '请求失败'));
  },
  error => {
    console.log('error', error);
    if (error.response && error.response.status && error.response.status === 401) {
      const userStore = useUserStore();
      userStore.token = '';
      userStore.setUserInfo({});
      // 跳转到闪屏页
      window.location.href = '/';
    }
    console.log('request error', error);
    showFailToast(error.message || '网络错误');
    return Promise.reject(error);
  }
);

// 封装 GET 请求
export function get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return request.get(url, { params, ...config });
}

// 封装 POST 请求
export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return request.post(url, data, config);
}

// 封装 PUT 请求
export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return request.put(url, data, config);
}

// 封装 DELETE 请求
export function del<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return request.delete(url, { params, ...config });
}

// 创建专用于上传的 axios 实例
const uploadRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

export function uploadFile<T = any>({
  url,
  file,
  name = 'file',
  formData,
  success,
  fail,
  complete,
  progress,
  cancelTask,
}: {
  url: string;
  file: File;
  name?: string;
  formData?: Record<string, any>;
  success?: (res: any) => void;
  fail?: (error: any) => void;
  complete?: () => void;
  progress?: (res: {
    progress: number;
    totalBytesSent: number;
    totalBytesExpectedToSend: number;
  }) => void;
  cancelTask?: (abort: () => void) => void;
}): Promise<T> {
  const controller = new AbortController();

  // 如果提供了 cancelTask，传入取消函数
  if (cancelTask) {
    cancelTask(() => controller.abort());
  }

  const finalFormData = new FormData();
  finalFormData.append(name, file);

  if (formData) {
    Object.keys(formData).forEach(key => {
      finalFormData.append(key, formData[key]);
    });
  }

  return uploadRequest
    .post(url, finalFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal: controller.signal,
      onUploadProgress: progressEvent => {
        if (progress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          progress({
            progress: percentCompleted,
            totalBytesSent: progressEvent.loaded,
            totalBytesExpectedToSend: progressEvent.total,
          });
        }
      },
      transformResponse: [data => data],
      validateStatus: () => true,
    })
    .then(response => {
      const data = JSON.parse(response.data);
      success?.(data);
      return data;
    })
    .catch(error => {
      fail?.(error);
      return Promise.reject(error);
    })
    .finally(() => {
      complete?.();
    });
}

export default request;
