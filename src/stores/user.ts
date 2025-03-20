import { defineStore } from 'pinia';

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
    async login(credentials: { username: string; password: string }) {
      try {
        // 这里应该调用实际的登录 API
        // const response = await api.login(credentials)

        // 模拟登录成功
        const mockResponse = {
          id: '1',
          username: credentials.username,
          email: `${credentials.username}@example.com`,
          role: 'user',
          token: 'mock-token-xxx',
        };

        this.setUserInfo({
          ...mockResponse,
          isLoggedIn: true,
        });

        // 保存 token 到本地存储
        localStorage.setItem('userToken', mockResponse.token);

        return true;
      } catch (error) {
        console.error('登录失败:', error);
        return false;
      }
    },

    // 登出
    logout() {
      // 清除用户信息
      this.$reset();

      // 清除本地存储的 token
      localStorage.removeItem('userToken');
    },

    // 更新用户信息
    async updateProfile(profileData: Partial<UserInfo>) {
      try {
        // 这里应该调用更新用户信息的 API
        // const updatedInfo = await api.updateProfile(profileData)

        // 模拟更新成功
        this.setUserInfo({
          ...profileData,
        });

        return true;
      } catch (error) {
        console.error('更新用户信息失败:', error);
        return false;
      }
    },
  },
});
