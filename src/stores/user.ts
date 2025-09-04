import { defineStore } from 'pinia';
import AuthService, { type LoginCredentials, type RegisterData } from '@/utils/authService';
import type { components } from '@/types/api';

// 用户信息接口
type User = components['schemas']['User'];

interface UserInfo extends User {
  token: string;
  isLoggedIn: boolean;
}

// 定义用户 store
export const useUserStore = defineStore('user', {
  // 状态
  state: (): UserInfo => ({
    id: 0,
    username: '',
    email: '',
    phone: '',
    avatar_url: null,
    language: 'zh-CN',
    theme: 'default',
    selection_mode: 'card',
    role: 'user',
    status: 'active',
    last_login_at: null,
    created_at: '',
    updated_at: null,
    token: '',
    isLoggedIn: false,
  }),

  // getters
  getters: {
    getUserInfo: state => state,
    isAuthenticated: state => state.isLoggedIn && !!state.token,
  },

  // actions
  actions: {
    // 设置用户信息
    setUserInfo(userInfo: Partial<UserInfo>) {
      Object.assign(this, userInfo);
    },

    // 登录
    async login(credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> {
      try {
        const response = await AuthService.login(credentials);

        if (response.success && response.data) {
          const { user, token } = response.data;

          this.setUserInfo({
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar_url: user.avatar_url,
            language: user.language,
            theme: user.theme,
            selection_mode: user.selection_mode,
            status: user.status,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
            token,
            isLoggedIn: true,
          });

          // 保存 token 到本地存储
          localStorage.setItem('userToken', token);

          return { success: true };
        } else {
          console.error('登录失败:', response.message);
          return { success: false, message: response.message };
        }
      } catch (error) {
        console.error('登录失败:', error);
        return { success: false, message: '登录失败，请稍后重试' };
      }
    },

    // 注册
    async register(data: RegisterData): Promise<{ success: boolean; message?: string }> {
      try {
        const response = await AuthService.register(data);

        if (response.success && response.data) {
          const user = response.data.user;
          const token = response.data.token;

          this.setUserInfo({
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar_url: user.avatar_url,
            language: user.language,
            theme: user.theme,
            selection_mode: user.selection_mode,
            status: user.status,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
            token,
            isLoggedIn: true,
          });

          // 保存 token 到本地存储
          localStorage.setItem('userToken', token);

          return { success: true };
        } else {
          console.error('注册失败:', response.message);
          return { success: false, message: response.message };
        }
      } catch (error) {
        console.error('注册失败:', error);
        return { success: false, message: '注册失败，请稍后重试' };
      }
    },

    // 登出
    async logout() {
      try {
        await AuthService.logout();
      } catch (error) {
        console.error('退出登录失败:', error);
      } finally {
        // 清除用户信息
        this.$reset();

        // 清除本地存储的 token
        localStorage.removeItem('userToken');
      }
    },

    // 更新用户信息
    async updateProfile(profileData: Partial<User>) {
      try {
        const response = await AuthService.updateProfile(profileData);

        if (response.success) {
          this.setUserInfo({
            ...profileData,
          });
          return true;
        } else {
          console.error('更新用户信息失败:', response.message);
          return false;
        }
      } catch (error) {
        console.error('更新用户信息失败:', error);
        return false;
      }
    },

    // 检查手机号是否已存在
    async checkPhoneExists(phone: string) {
      try {
        const response = await AuthService.checkPhoneExists(phone);
        return response;
      } catch (error) {
        console.error('检查手机号失败:', error);
        return {
          exists: false,
          message: '检查失败',
        };
      }
    },

    // 检查邮箱是否已存在
    async checkEmailExists(email: string) {
      try {
        const response = await AuthService.checkEmailExists(email);
        return response;
      } catch (error) {
        console.error('检查邮箱失败:', error);
        return {
          exists: false,
          message: '检查失败',
        };
      }
    },

    // 发送验证码
    async sendVerificationCode(data: {
      phone: string;
      code_type: 'register' | 'reset_password' | 'login';
    }) {
      try {
        const response = await AuthService.sendVerificationCode(data);
        return response;
      } catch (error) {
        console.error('发送验证码失败:', error);
        return {
          success: false,
          message: '发送验证码失败',
        };
      }
    },

    // 发送邮箱验证码
    async sendEmailVerificationCode(data: {
      email: string;
      code_type: 'register' | 'reset_password' | 'login';
    }) {
      try {
        const response = await AuthService.sendEmailVerificationCode(data);
        return response;
      } catch (error) {
        console.error('发送邮箱验证码失败:', error);
        return {
          success: false,
          message: '发送验证码失败',
        };
      }
    },

    // 验证码登录
    async loginWithCode(data: { phone: string; code: string }) {
      try {
        const response = await AuthService.login({
          identifier: data.phone,
          password: '',
          verification_code: data.code,
        });

        if (response.success && response.data) {
          const { user, token } = response.data;

          this.setUserInfo({
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar_url: user.avatar_url,
            language: user.language,
            theme: user.theme,
            selection_mode: user.selection_mode,
            status: user.status,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
            token,
            isLoggedIn: true,
          });

          // 保存 token 到本地存储
          localStorage.setItem('userToken', token);

          return true;
        } else {
          console.error('验证码登录失败:', response.message);
          return false;
        }
      } catch (error) {
        console.error('验证码登录失败:', error);
        return false;
      }
    },
  },
});
