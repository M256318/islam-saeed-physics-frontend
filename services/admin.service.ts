import { apiClient } from '@/lib/api';
import { ApiResponse, AdminRequest, AdminMember, AuditLog, User } from '@/types';

export interface DashboardStats {
  totalStudents: number;
  newStudents7d: number;
  pendingQuestions: number;
  activeCourses: number;
  totalBookings: number;
  pendingBookings: number;
  totalLectures: number;
  pendingAdminRequests: number;
  totalAdmins: number;
  timestamp: string;
}

export interface AdminApplyPayload {
  fullName: string;
  phoneNumber: string;
  email: string;
  notes?: string;
}

export interface CreateAdminPayload {
  fullName?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  gender?: 'MALE' | 'FEMALE';
  academicYear?: 'GRADE_10' | 'GRADE_11' | 'GRADE_12';
  permissions: string[];
}

export interface StudentDetail {
  id: string;
  fullName: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  phoneNumber: string;
  email?: string | null;
  gender: string;
  academicYear: string;
  isActive: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  stats: {
    totalBookings: number;
    totalQuestions: number;
  };
  recentBookings: Array<{
    id: string;
    status: string;
    createdAt: string;
    course: { id: string; title: string; price: number; academicYear: string };
  }>;
  recentQuestions: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    chapter: string;
  }>;
}

export interface AdminDetail {
  id: string;
  fullName: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  phoneNumber: string;
  email?: string | null;
  gender: string;
  academicYear: string;
  isActive: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isOwner: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  stats?: {
    answeredQuestions: number;
    reviewedRequests: number;
  };
}

export const AdminService = {
  // 1. KPIs
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient<DashboardStats>('/admin/dashboard/stats');
  },

  // 2. Students Management
  async getStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    academicYear?: string;
    isActive?: boolean | string;
    isPhoneVerified?: boolean | string;
    isEmailVerified?: boolean | string;
  }): Promise<ApiResponse<User[]>> {
    return apiClient<User[]>('/admin/students', { params });
  },

  async getStudentById(id: string): Promise<ApiResponse<StudentDetail>> {
    return apiClient<StudentDetail>(`/admin/students/${id}`);
  },

  async toggleStudentStatus(id: string, isActive: boolean): Promise<ApiResponse<{ student: User }>> {
    return apiClient<{ student: User }>(`/admin/students/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  async deleteStudent(id: string, confirmation: string): Promise<ApiResponse<{ deletedUserId: string }>> {
    return apiClient<{ deletedUserId: string }>(`/admin/students/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ confirmation }),
    });
  },

  // 3. Admin Application (Public / User candidate)
  async applyForAdmin(data: AdminApplyPayload): Promise<ApiResponse<{ requestId: string }>> {
    return apiClient<{ requestId: string }>('/admin/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 4. Admin Requests (Owner / Authorized Admin)
  async getAdminRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<AdminRequest[]>> {
    return apiClient<AdminRequest[]>('/admin/requests', { params });
  },

  async reviewAdminRequest(
    id: string,
    data: {
      status: 'APPROVED' | 'REJECTED';
      grantedPermissions?: string[];
      reviewNotes?: string;
    }
  ): Promise<ApiResponse<any>> {
    return apiClient(`/admin/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 5. Admin Members Management (Owner Exclusive)
  async getAdminsList(): Promise<ApiResponse<{ admins: AdminMember[] }>> {
    return apiClient<{ admins: AdminMember[] }>('/admin/admins');
  },

  async getAdminById(id: string): Promise<ApiResponse<AdminDetail>> {
    return apiClient<AdminDetail>(`/admin/admins/${id}`);
  },

  async createAdmin(data: CreateAdminPayload): Promise<ApiResponse<any>> {
    return apiClient('/admin/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAdminPermissions(id: string, permissions: string[]): Promise<ApiResponse<any>> {
    return apiClient(`/admin/admins/${id}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({ permissions }),
    });
  },

  async toggleAdminStatus(id: string, isActive: boolean): Promise<ApiResponse<any>> {
    return apiClient(`/admin/admins/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  async deleteAdmin(id: string, confirmation: string): Promise<ApiResponse<{ deletedAdminId: string }>> {
    return apiClient<{ deletedAdminId: string }>(`/admin/admins/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ confirmation }),
    });
  },

  // 6. Audit Logs
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    entity?: string;
    userId?: string;
  }): Promise<ApiResponse<AuditLog[]>> {
    return apiClient<AuditLog[]>('/admin/audit-logs', { params });
  },
};
