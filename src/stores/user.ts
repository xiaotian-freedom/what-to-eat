import { defineStore } from 'pinia';
import AuthService, { type LoginCredentials, type RegisterData } from '@/utils/authService';
import { AIUsageApi } from '@/utils/aiUsageApi';
import type { components } from '@/types/api';

// 用户信息接口
type User = components['schemas']['User'];

// AI使用次数信息接口
interface AIUsageInfo {
  daily_uses: number;
  max_daily_uses: number;
  remaining_uses: number;
  last_reset_date?: string | null;
}

interface UserInfo extends User {
  token: string;
  isLoggedIn: boolean;
  aiUsage?: AIUsageInfo;
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
    ai_daily_uses: 0,
    ai_max_daily_uses: 3,
    ai_last_reset_date: null,
    token: '',
    isLoggedIn: false,
    aiUsage: undefined,
  }),

  // getters
  getters: {
    getUserInfo: state => state,
    isAuthenticated: () => !!localStorage.getItem('userToken'),
    // 检查用户是否已登录但AI使用次数信息未加载
    needsAIUsageLoad: state => {
      const hasToken = !!localStorage.getItem('userToken');
      return hasToken && state.isLoggedIn && !state.aiUsage;
    },
    // AI使用次数相关getters
    canUseAI: state => {
      if (!state.isLoggedIn || !state.aiUsage) {
        return false;
      }
      return state.aiUsage.remaining_uses > 0;
    },
    remainingAIUses: state => {
      if (!state.isLoggedIn || !state.aiUsage) {
        return 0;
      }
      return state.aiUsage.remaining_uses;
    },
    dailyAIUses: state => {
      if (!state.isLoggedIn || !state.aiUsage) {
        return 0;
      }
      return state.aiUsage.daily_uses;
    },
    maxDailyAIUses: state => {
      if (!state.isLoggedIn || !state.aiUsage) {
        return 0;
      }
      return state.aiUsage.max_daily_uses;
    },
  },

  // actions
  actions: {
    // 设置用户信息
    setUserInfo(userInfo: Partial<UserInfo>) {
      Object.assign(this, userInfo);
    },

    // 清除用户所有信息
    clearUserInfo() {
      this.$reset();
      localStorage.removeItem('userToken');
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

          // 登录成功后加载AI使用次数信息
          await this.loadAIUsage();

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

          // 注册成功后加载AI使用次数信息
          await this.loadAIUsage();

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
    async logout(): Promise<{ success: boolean; message: string }> {
      try {
        const response = await AuthService.logout();

        if (response.success) {
          // 清除用户信息
          this.clearUserInfo();

          return {
            success: true,
            message: response.message,
          };
        } else {
          return {
            success: false,
            message: response.message,
          };
        }
      } catch (error) {
        console.error('退出登录失败:', error);

        // 即使API调用失败，也要清除本地数据
        this.clearUserInfo();

        return {
          success: false,
          message: '退出登录失败，但已清除本地数据',
        };
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

          // 验证码登录成功后加载AI使用次数信息
          await this.loadAIUsage();

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

    // AI使用次数相关方法
    /**
     * 获取AI使用次数信息
     */
    async loadAIUsage() {
      if (!this.isLoggedIn) {
        return;
      }

      try {
        const response = await AIUsageApi.getMyAIUsage();
        this.aiUsage = response.usage_info;
      } catch (error) {
        console.error('获取AI使用次数信息失败:', error);
        // 如果获取失败，设置默认值
        this.aiUsage = {
          daily_uses: 0,
          max_daily_uses: 5,
          remaining_uses: 5,
          last_reset_date: null,
        };
      }
    },

    /**
     * 检查是否可以继续使用AI功能
     */
    async checkAIUsage() {
      if (!this.isLoggedIn) {
        return false;
      }

      try {
        const response = await AIUsageApi.checkAIUsage();
        this.aiUsage = response.usage_info;
        return response.can_use;
      } catch (error) {
        console.error('检查AI使用次数失败:', error);
        return false;
      }
    },

    /**
     * 使用AI功能（增加使用次数）
     */
    async useAIFeature() {
      if (!this.isLoggedIn) {
        return false;
      }

      try {
        const response = await AIUsageApi.useAIFeature();
        this.aiUsage = response.usage_info;
        return response.can_use;
      } catch (error) {
        console.error('记录AI使用次数失败:', error);
        return false;
      }
    },

    /**
     * 设置AI使用次数信息（用于从外部更新）
     */
    setAIUsage(usageInfo: AIUsageInfo) {
      this.aiUsage = usageInfo;
    },

    /**
     * 获取并更新用户信息
     */
    async fetchAndUpdateUserInfo() {
      if (!this.isLoggedIn) {
        return false;
      }

      try {
        const response = await AuthService.getCurrentUser();

        if (response.success && response.data) {
          const user = response.data;

          // 更新用户信息，但保留token和isLoggedIn状态
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
            ai_daily_uses: user.ai_daily_uses,
            ai_max_daily_uses: user.ai_max_daily_uses,
            ai_last_reset_date: user.ai_last_reset_date,
          });

          return true;
        } else {
          console.error('获取用户信息失败:', response.message);
          return false;
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        return false;
      }
    },

    /**
     * 初始化用户状态（应用启动时调用）
     */
    async initializeUserState() {
      const token = localStorage.getItem('userToken');
      if (token) {
        // 如果有token但用户状态未设置，尝试恢复用户状态
        try {
          // 设置基本状态
          this.token = token;
          this.isLoggedIn = true;

          // 获取最新的用户信息
          const userInfoUpdated = await this.fetchAndUpdateUserInfo();

          // 如果获取用户信息失败，清除本地数据
          if (!userInfoUpdated) {
            console.warn('获取用户信息失败，清除本地数据');
            this.clearUserInfo();
            return;
          }

          // 加载AI使用次数信息
          await this.loadAIUsage();
        } catch (error) {
          console.error('初始化用户状态失败:', error);
          this.clearUserInfo();
        }
      } else if (token && this.isLoggedIn && !this.aiUsage) {
        // 如果用户已登录但AI使用次数信息未加载，则加载它
        await this.loadAIUsage();
      } else if (token && this.isLoggedIn) {
        // 如果用户已登录，也尝试获取最新的用户信息
        await this.fetchAndUpdateUserInfo();
      }
    },
  },
});
