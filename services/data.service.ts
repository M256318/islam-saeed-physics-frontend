import { apiClient } from '@/lib/api';
import { Lecture, Course, CourseVideo, Booking, Question, UserNotification, LectureView } from '@/types';

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

  /**
   * Track lecture view progress
   */
  async trackView(lectureId: string, progress: number, watchDuration: number) {
    return apiClient<LectureView>(`/lecture-views/lectures/${lectureId}/view`, {
      method: 'POST',
      body: JSON.stringify({ progress, watchDuration }),
    });
  },

  /**
   * Get current user's view progress for a lecture
   */
  async getMyView(lectureId: string) {
    return apiClient<LectureView>(`/lecture-views/lectures/${lectureId}/view`);
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
  async getCourses(params?: { academicYear?: string; status?: string; search?: string; page?: number; limit?: number }) {
    return apiClient<Course[]>('/courses', { params });
  },

  async getCourseById(id: string) {
    return apiClient<{ course: Course }>(`/courses/${id}`).then((res) => ({
      ...res,
      data: (res.data as any)?.course || res.data,
    }));
  },

  async uploadCourseThumbnail(file: File) {
    const formData = new FormData();
    formData.append('thumbnail', file);
    return apiClient<{ url: string }>('/courses/thumbnails', {
      method: 'POST',
      body: formData,
    });
  },

  async createCourse(data: Partial<Course>) {
    return apiClient<{ course: Course }>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((res) => ({
      ...res,
      data: (res.data as any)?.course || res.data,
    }));
  },

  async updateCourse(id: string, data: Partial<Course>) {
    return apiClient<{ course: Course }>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then((res) => ({
      ...res,
      data: (res.data as any)?.course || res.data,
    }));
  },

  async updateStatus(id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') {
    return apiClient<{ course: Course }>(`/courses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }).then((res) => ({
      ...res,
      data: (res.data as any)?.course || res.data,
    }));
  },

  async deleteCourse(id: string) {
    return apiClient(`/courses/${id}`, { method: 'DELETE' });
  },

  // Course Videos
  async getCourseVideos(courseId: string) {
    return apiClient<{ videos: CourseVideo[] }>(`/courses/${courseId}/videos`).then((res) => ({
      ...res,
      data: (res.data as any)?.videos || res.data,
    }));
  },

  async addCourseVideo(courseId: string, data: Partial<CourseVideo>) {
    return apiClient<{ video: CourseVideo }>(`/courses/${courseId}/videos`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((res) => ({
      ...res,
      data: (res.data as any)?.video || res.data,
    }));
  },

  async updateCourseVideo(courseId: string, videoId: string, data: Partial<CourseVideo>) {
    return apiClient<{ video: CourseVideo }>(`/courses/${courseId}/videos/${videoId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then((res) => ({
      ...res,
      data: (res.data as any)?.video || res.data,
    }));
  },

  async deleteCourseVideo(courseId: string, videoId: string) {
    return apiClient(`/courses/${courseId}/videos/${videoId}`, {
      method: 'DELETE',
    });
  },

  async reorderCourseVideos(courseId: string, payload: { videoIds?: string[]; items?: { id: string; orderIndex: number }[] }) {
    return apiClient<{ videos: CourseVideo[] }>(`/courses/${courseId}/videos/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }).then((res) => ({
      ...res,
      data: (res.data as any)?.videos || res.data,
    }));
  },
};

export const BookingService = {
  async createBooking(data: { courseId: string; lectureId?: string; notes?: string }) {
    return apiClient<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createManualBooking(data: { userId: string; courseId: string; lectureId?: string; status: 'CONFIRMED' | 'CANCELLED' }) {
    return apiClient<Booking>('/bookings/manual', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyBookings() {
    return apiClient<Booking[]>('/bookings/my');
  },

  async getAllBookings(params?: { status?: string; courseId?: string; limit?: number }) {
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

  async answerQuestion(id: string, body: FormData | { answerText: string; status?: string }) {
    return apiClient<Question>(`/questions/${id}/answer`, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
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

  async markAllAsRead() {
    return apiClient<{ message: string }>('/notifications/read-all', {
      method: 'PATCH',
    });
  },

  async getUnreadCount() {
    return apiClient<{ unreadCount: number }>('/notifications/unread-count');
  },
};
