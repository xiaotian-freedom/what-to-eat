import { post, get } from './request';

// Mock user data
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    phone: '13800138001',
    role: 'admin',
    avatar: '',
    isLoggedIn: false,
  },
  {
    id: '2',
    username: 'user',
    password: 'user123',
    email: 'user@example.com',
    phone: '13800138002',
    role: 'user',
    avatar: '',
    isLoggedIn: false,
  },
  {
    id: '3',
    username: 'demo',
    password: 'demo123',
    email: 'demo@example.com',
    phone: '13800138003',
    role: 'user',
    avatar: '',
    isLoggedIn: false,
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication service interface
export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      avatar?: string;
    };
    token: string;
  };
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface RegisterData {
  username: string;
  phone: string;
  password: string;
}

// Mock authentication service
export class AuthService {
  // Login
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Simulate API delay
    await delay(1000);

    const user = mockUsers.find(
      u => u.phone === credentials.phone && u.password === credentials.password
    );

    if (!user) {
      return {
        success: false,
        message: '手机号或密码错误',
      };
    }

    // Generate mock token
    const token = `mock-token-${user.id}-${Date.now()}`;

    return {
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    };
  }

  // Register
  static async register(data: RegisterData): Promise<LoginResponse> {
    await delay(1000);

    // Check if username already exists
    const existingUser = mockUsers.find(u => u.username === data.username);
    if (existingUser) {
      return {
        success: false,
        message: '用户名已存在',
      };
    }

    // Check if phone already exists
    const existingPhone = mockUsers.find(u => u.phone === data.phone);
    if (existingPhone) {
      return {
        success: false,
        message: '手机号已被注册',
      };
    }

    // Create new user
    const newUser = {
      id: String(mockUsers.length + 1),
      username: data.username,
      password: data.password,
      phone: data.phone,
      email: '', // Keep email field for backward compatibility
      role: 'user',
      avatar: '',
      isLoggedIn: false,
    };

    mockUsers.push(newUser);

    // Generate mock token
    const token = `mock-token-${newUser.id}-${Date.now()}`;

    return {
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
        },
        token,
      },
    };
  }

  // Get current user info
  static async getCurrentUser(): Promise<UserInfo | null> {
    await delay(500);

    const token = localStorage.getItem('userToken');
    if (!token) {
      return null;
    }

    // Extract user ID from token (mock implementation)
    const tokenParts = token.split('-');
    const userId = tokenParts[2];

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };
  }

  // Logout
  static async logout(): Promise<{ success: boolean; message: string }> {
    await delay(500);

    // Clear token from localStorage
    localStorage.removeItem('userToken');

    return {
      success: true,
      message: '退出登录成功',
    };
  }

  // Update user profile
  static async updateProfile(
    profileData: Partial<UserInfo>
  ): Promise<{ success: boolean; message: string }> {
    await delay(1000);

    const token = localStorage.getItem('userToken');
    if (!token) {
      return {
        success: false,
        message: '未登录',
      };
    }

    // Extract user ID from token
    const tokenParts = token.split('-');
    const userId = tokenParts[2];

    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return {
        success: false,
        message: '用户不存在',
      };
    }

    // Update user data
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...profileData,
    };

    return {
      success: true,
      message: '更新成功',
    };
  }

  // Change password
  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    await delay(1000);

    const token = localStorage.getItem('userToken');
    if (!token) {
      return {
        success: false,
        message: '未登录',
      };
    }

    const tokenParts = token.split('-');
    const userId = tokenParts[2];

    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return {
        success: false,
        message: '用户不存在',
      };
    }

    const user = mockUsers[userIndex];
    if (user.password !== data.currentPassword) {
      return {
        success: false,
        message: '当前密码错误',
      };
    }

    // Update password
    mockUsers[userIndex].password = data.newPassword;

    return {
      success: true,
      message: '密码修改成功',
    };
  }

  // Forgot password
  static async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await delay(1000);

    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return {
        success: false,
        message: '邮箱不存在',
      };
    }

    // In a real app, this would send a reset email
    return {
      success: true,
      message: '重置密码邮件已发送',
    };
  }

  // Reset password
  static async resetPassword(_data: {
    token: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    await delay(1000);

    // Mock implementation - in real app, validate reset token
    return {
      success: true,
      message: '密码重置成功',
    };
  }
}

// Real API service (for future use)
export class RealAuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await post<{ data: LoginResponse }>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error('登录失败');
    }
  }

  static async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await post<{ data: LoginResponse }>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw new Error('注册失败');
    }
  }

  static async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const response = await get<{ data: UserInfo }>('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  static async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await post<{ data: { success: boolean; message: string } }>('/auth/logout');
      return response.data;
    } catch (error) {
      throw new Error('退出登录失败');
    }
  }

  static async updateProfile(
    profileData: Partial<UserInfo>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await post<{ data: { success: boolean; message: string } }>(
        '/auth/profile',
        profileData
      );
      return response.data;
    } catch (error) {
      throw new Error('更新失败');
    }
  }
}

// Export the service to use (currently using mock)
export default AuthService;
