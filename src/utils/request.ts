import { useUserStore } from '@/stores/user';
import axios, { type AxiosRequestConfig } from 'axios';

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('userToken');
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
    if (response.data.code === 401) {
      const userStore = useUserStore();
      userStore.clearUserInfo();
      // 跳转到登录页
      window.location.href = '/login';
    }

    // 统一处理响应数据，直接返回 response.data 中的内容
    return response.data;
  },
  error => {
    console.log('error', error);

    // 处理401错误
    if (error.response?.status === 401) {
      const userStore = useUserStore();
      userStore.clearUserInfo();
      // 跳转到登录页
      window.location.href = '/login';
    }

    console.log('request error', error);
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
