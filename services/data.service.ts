import { apiClient } from '@/lib/api';
import { Lecture, Course, Booking, Question, UserNotification, AdminStats, User } from '@/types';

export const LectureService = {
  async getLectures(params?: { academicYear?: string; chapter?: string; status?: string; courseId?: string; page?: number; limit?: number }) {
    return apiClient<Lecture[]>('/lectures', { params });
  },

  async getLectureById(id: string) {
    return apiClient<{ lecture: Lecture }>(`/lectures/${id}`).then((res) => ({
      ...res,
      data: (res.data as any)?.lecture || res.data,
    }));
  },

  async createUploadSession(data: {
    filename: string;
    fileSizeBytes: number;
    mimeType: string;
    durationSeconds?: number;
    lectureTitle?: string;
  }) {
    return apiClient<{
      uploadId: string;
      videoId: string;
      uploadUrl: string;
      provider: string;
      maxSizeBytes: number;
      expiresAt: string;
    }>('/lectures/video/upload-session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async completeUpload(data: {
    videoId: string;
    uploadId?: string;
    lectureId?: string;
    durationMinutes?: number;
  }) {
    return apiClient<{ videoId: string; status: string; message: string }>('/lectures/video/complete-upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getVideoStatus(videoId: string, lectureId?: string) {
    return apiClient<{
      videoId: string;
      status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
      durationSeconds?: number;
      readyToStream: boolean;
      playbackUrl?: string;
      thumbnailUrl?: string;
    }>(`/lectures/video/${videoId}/status`, {
      params: lectureId ? { lectureId } : undefined,
    });
  },

  async getPlaybackToken(lectureId: string) {
    return apiClient<{
      videoSource: 'YOUTUBE' | 'HOSTED';
      youtubeVideoId?: string;
      youtubeUrl?: string;
      playbackUrl?: string;
      thumbnailUrl?: string;
      token?: string;
    }>(`/lectures/${lectureId}/playback-token`);
  },

  async createLecture(data: Partial<Lecture>) {
    return apiClient<{ lecture: Lecture }>('/lectures', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateLecture(id: string, data: Partial<Lecture>) {
    return apiClient<{ lecture: Lecture }>(`/lectures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateStatus(id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') {
    return apiClient<{ lecture: Lecture }>(`/lectures/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteLecture(id: string) {
    return apiClient(`/lectures/${id}`, { method: 'DELETE' });
  },
};

export const CourseService = {
  async getCourses(params?: { academicYear?: string; page?: number; limit?: number }) {
    return apiClient<Course[]>('/courses', { params });
  },

  async getCourseById(id: string) {
    return apiClient<Course>(`/courses/${id}`);
  },

  async createCourse(data: Partial<Course>) {
    return apiClient<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCourse(id: string, data: Partial<Course>) {
    return apiClient<Course>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCourse(id: string) {
    return apiClient(`/courses/${id}`, { method: 'DELETE' });
  },
};

export const BookingService = {
  async createBooking(data: { courseId: string; notes?: string }) {
    return apiClient<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyBookings() {
    return apiClient<Booking[]>('/bookings/my');
  },

  async getAllBookings(params?: { status?: string; courseId?: string }) {
    return apiClient<Booking[]>('/bookings', { params });
  },

  async updateBookingStatus(id: string, status: 'CONFIRMED' | 'CANCELLED', adminFeedback?: string) {
    return apiClient<Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminFeedback }),
    });
  },
};

export const QuestionService = {
  async askQuestion(formData: FormData) {
    return apiClient<Question>('/questions', {
      method: 'POST',
      body: formData,
    });
  },

  async getMyQuestions(params?: { status?: string }) {
    return apiClient<Question[]>('/questions/my', { params });
  },

  async getAllQuestions(params?: { status?: string; academicYear?: string }) {
    return apiClient<Question[]>('/questions', { params });
  },

  async getQuestionById(id: string) {
    return apiClient<Question>(`/questions/${id}`);
  },

  async answerQuestion(id: string, answerText: string) {
    return apiClient<Question>(`/questions/${id}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answerText }),
    });
  },
};

export const NotificationService = {
  async getNotifications() {
    return apiClient<UserNotification[]>('/notifications');
  },

  async markAsRead(id: string) {
    return apiClient<UserNotification>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
};

export const AdminService = {
  async getDashboardStats() {
    return apiClient<AdminStats>('/admin/dashboard/stats');
  },

  async getStudents(params?: { academicYear?: string; search?: string; page?: number; limit?: number }) {
    return apiClient<User[]>('/admin/students', { params });
  },

  async toggleStudentStatus(id: string, isActive: boolean) {
    return apiClient<User>(`/admin/students/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },
};
