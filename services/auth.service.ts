import { apiClient, setClientToken } from '@/lib/api';
import { User, ApiResponse } from '@/types';

export interface RegisterPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  academicYear: 'GRADE_10' | 'GRADE_11' | 'GRADE_12';
  phoneNumber: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  phoneNumber: string;
  password: string;
}

export const AuthService = {
  async register(data: RegisterPayload) {
    return apiClient<{ user: User; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verifyPhone(phoneNumber: string, otp: string) {
    return apiClient<{ message: string; user: { id: string; phoneNumber: string; isPhoneVerified: boolean } }>(
      '/auth/verify-phone',
      {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, otp, purpose: 'PHONE_VERIFICATION' }),
      }
    );
  },

  async resendOtp(phoneNumber: string, purpose: 'PHONE_VERIFICATION' | 'PASSWORD_RESET' = 'PHONE_VERIFICATION') {
    return apiClient('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, purpose }),
    });
  },

  async login(credentials: LoginPayload) {
    const res = await apiClient<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.data?.accessToken) {
      setClientToken(res.data.accessToken);
    }
    return res;
  },

  async logout() {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } finally {
      setClientToken(null);
    }
  },

  async getMe() {
    return apiClient<{ user: User }>('/auth/me');
  },

  async forgotPassword(email: string) {
    return apiClient<{ message: string; cooldownSeconds?: number }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(data: { email: string; otp: string; newPassword: string; confirmPassword: string }) {
    return apiClient<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
