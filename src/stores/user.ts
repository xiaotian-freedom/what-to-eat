import { defineStore } from 'pinia';
import AuthService, { type LoginCredentials, type RegisterData } from '@/utils/authService';

// 用户信息接口
interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  token?: string;
  isLoggedIn: boolean;
}

// 定义用户 store
export const useUserStore = defineStore('user', {
  // 状态
  state: (): UserInfo => ({
    id: '',
    username: '',
    email: '',
    avatar: '',
    role: 'guest',
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
    async login(credentials: LoginCredentials) {
      try {
        const response = await AuthService.login(credentials);

        if (response.success && response.data) {
          const { user, token } = response.data;

          this.setUserInfo({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token,
            isLoggedIn: true,
          });

          // 保存 token 到本地存储
          localStorage.setItem('userToken', token);

          return true;
        } else {
          console.error('登录失败:', response.message);
          return false;
        }
      } catch (error) {
        console.error('登录失败:', error);
        return false;
      }
    },

    // 注册
    async register(data: RegisterData) {
      try {
        const response = await AuthService.register(data);

        if (response.success && response.data) {
          const { user, token } = response.data;

          this.setUserInfo({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token,
            isLoggedIn: true,
          });

          // 保存 token 到本地存储
          localStorage.setItem('userToken', token);

          return true;
        } else {
          console.error('注册失败:', response.message);
          return false;
        }
      } catch (error) {
        console.error('注册失败:', error);
        return false;
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
    async updateProfile(profileData: Partial<UserInfo>) {
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
  },
});
