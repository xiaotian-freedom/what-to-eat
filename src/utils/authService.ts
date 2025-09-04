import { get, post } from './request';
import type { components } from '@/types/api';

export type User = components['schemas']['User'];

// Authentication service interface
export interface LoginCredentials {
  identifier: string;
  password: string;
  verification_code?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  email_verification_code: string;
}

export interface SendCodeRequest {
  phone: string;
  code_type: 'register' | 'reset_password' | 'login';
}

export interface SendEmailCodeRequest {
  email: string;
  code_type: 'register' | 'reset_password' | 'login';
}

export interface SendCodeResponse {
  success: boolean;
  message: string;
  data?: {
    message: string;
    expires_in: number;
  };
}

export interface VerifyCodeRequest {
  phone: string;
  code: string;
  code_type: 'register' | 'reset_password' | 'login';
}

export interface VerifyEmailCodeRequest {
  email: string;
  code: string;
  code_type: 'register' | 'reset_password' | 'login';
}

export interface VerifyCodeResponse {
  success: boolean;
  message: string;
  data?: {
    message: string;
  };
}

// Real API service
export class AuthService {
  // Send verification code
  static async sendVerificationCode(data: SendCodeRequest): Promise<SendCodeResponse> {
    try {
      const response = await post<components['schemas']['VerificationCodeResponse']>(
        '/api/verification/send-code',
        data
      );
      return {
        success: true,
        message: '验证码发送成功',
        data: {
          message: response.message || '验证码已发送',
          expires_in: response.expires_in || 300,
        },
      };
    } catch (error: any) {
      // 优先使用接口返回的错误信息
      let errorMsg = '发送验证码失败';

      if (error.response?.data?.msg) {
        errorMsg = error.response.data.msg;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      return {
        success: false,
        message: errorMsg,
      };
    }
  }

  // Verify verification code
  static async verifyCode(data: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    try {
      const response = await post<unknown>('/api/verification/verify-code', data);
      return {
        success: true,
        message: '验证码验证成功',
        data: response as any,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '验证码验证失败',
      };
    }
  }

  // Check if phone exists
  static async checkPhoneExists(phone: string): Promise<{ exists: boolean; message: string }> {
    try {
      await get<unknown>(`/api/verification/check-phone/${phone}`);
      return {
        exists: false,
        message: '手机号可用',
      };
    } catch (error: any) {
      if (error.response?.status === 409) {
        return {
          exists: true,
          message: '手机号已被注册',
        };
      }
      return {
        exists: false,
        message: '手机号可用',
      };
    }
  }

  // Send email verification code
  static async sendEmailVerificationCode(data: SendEmailCodeRequest): Promise<SendCodeResponse> {
    try {
      const response = await post<components['schemas']['EmailVerificationCodeResponse']>(
        '/api/email-verification/send-email-code',
        data
      );
      return {
        success: true,
        message: '验证码发送成功',
        data: {
          message: response.message || '验证码已发送',
          expires_in: response.expires_in || 300,
        },
      };
    } catch (error: any) {
      // 优先使用接口返回的错误信息
      let errorMsg = '发送验证码失败';

      if (error.response?.data?.msg) {
        errorMsg = error.response.data.msg;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      return {
        success: false,
        message: errorMsg,
      };
    }
  }

  // Verify email verification code
  static async verifyEmailCode(data: VerifyEmailCodeRequest): Promise<VerifyCodeResponse> {
    try {
      const response = await post<components['schemas']['EmailVerificationResult']>(
        '/api/email-verification/verify-email-code',
        data
      );
      return {
        success: true,
        message: '验证码验证成功',
        data: response as any,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '验证码验证失败',
      };
    }
  }

  // Check if email exists
  static async checkEmailExists(email: string): Promise<{ exists: boolean; message: string }> {
    try {
      await get<components['schemas']['EmailCheckResult']>(
        `/api/email-verification/check-email/${email}`
      );
      return {
        exists: false,
        message: '邮箱可用',
      };
    } catch (error: any) {
      if (error.response?.status === 409) {
        return {
          exists: true,
          message: '邮箱已被注册',
        };
      }
      return {
        exists: false,
        message: '邮箱可用',
      };
    }
  }

  // Login
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await post<components['schemas']['ResponseModel_LoginResponse_']>(
        '/api/auth/login',
        credentials
      );

      // 根据API响应格式调整
      if (response.data && response.data.access_token) {
        return {
          success: true,
          message: '登录成功',
          data: {
            user: response.data.user as User,
            token: response.data.access_token,
          },
        };
      } else {
        // 如果接口返回了错误信息，使用接口的错误信息
        const errorMsg = response.msg || '登录失败';
        return {
          success: false,
          message: errorMsg,
        };
      }
    } catch (error: any) {
      // 优先使用接口返回的错误信息
      let errorMsg = '登录失败';

      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        // 处理 ValidationError 格式的错误
        const validationErrors = error.response.data.detail;
        if (validationErrors.length > 0) {
          errorMsg = validationErrors[0].msg || '输入参数验证失败';
        }
      } else if (error.response?.data?.msg) {
        errorMsg = error.response.data.msg;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      return {
        success: false,
        message: errorMsg,
      };
    }
  }

  // Register
  static async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await post<components['schemas']['ResponseModel_RegisterResponse_']>(
        '/api/auth/register',
        data
      );

      // 根据API响应格式调整 - 支持新的API响应格式
      if (response.data && response.code === 201 && response.data) {
        const apiData = response.data;

        if (apiData.access_token && apiData.user) {
          return {
            success: true,
            message: response.msg || '注册成功',
            data: {
              user: apiData.user as User,
              token: apiData.access_token,
            },
          };
        }
      }

      return {
        success: false,
        message: response.msg || '注册失败',
      };
    } catch (error: any) {
      // 优先使用接口返回的错误信息
      let errorMsg = '注册失败';

      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        // 处理 ValidationError 格式的错误
        const validationErrors = error.response.data.detail;
        if (validationErrors.length > 0) {
          errorMsg = validationErrors[0].msg || '输入参数验证失败';
        }
      } else if (error.response?.data?.msg) {
        errorMsg = error.response.data.msg;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      return {
        success: false,
        message: errorMsg,
      };
    }
  }

  // Get current user info
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await get<unknown>('/api/auth/users/me');
      return response as User;
    } catch (error) {
      return null;
    }
  }

  // Logout
  static async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await post<unknown>('/api/auth/logout');
      return {
        success: true,
        message: '退出登录成功',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '退出登录失败',
      };
    }
  }

  // Update user profile
  static async updateProfile(
    profileData: Partial<User>
  ): Promise<{ success: boolean; message: string }> {
    try {
      await post<unknown>('/api/auth/users/me', profileData);
      return {
        success: true,
        message: '更新成功',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '更新失败',
      };
    }
  }

  // Change password
  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      await post<unknown>('/api/auth/users/me', {
        password: data.newPassword,
      });
      return {
        success: true,
        message: '密码修改成功',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '密码修改失败',
      };
    }
  }

  // Reset password
  static async resetPassword(data: {
    email: string;
    verification_code: string;
    new_password: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      await post<unknown>('/api/auth/reset-password-verify', {
        phone: data.email, // API still expects phone parameter, but we'll pass email
        verification_code: data.verification_code,
        new_password: data.new_password,
      });
      return {
        success: true,
        message: '密码重置成功',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '密码重置失败',
      };
    }
  }
}

// Export the service to use
export default AuthService;
