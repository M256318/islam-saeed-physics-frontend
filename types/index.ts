export type AcademicYear = 'GRADE_10' | 'GRADE_11' | 'GRADE_12';
export type Gender = 'MALE' | 'FEMALE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type QuestionStatus = 'PENDING' | 'ANSWERED' | 'REJECTED';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AdminRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  phoneNumber: string;
  email?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender: Gender;
  academicYear: AcademicYear;
  isActive: boolean;
  isPhoneVerified: boolean;
  isEmailVerified?: boolean;
  roles: string[];
  permissions: string[];
  createdAt?: string;
}

export interface AdminRequest {
  id: string;
  userId?: string | null;
  fullName: string;
  phoneNumber: string;
  email: string;
  notes?: string | null;
  status: AdminRequestStatus;
  requestedRoles?: string[];
  grantedPerms?: string[];
  reviewedBy?: string | null;
  reviewNotes?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  } | null;
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface AdminMember {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  isActive: boolean;
  isOwner: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string | null;
  } | null;
}

export interface AdminStats {
  studentsCount: number;
  lecturesCount: number;
  coursesCount: number;
  bookingsCount: number;
  pendingBookingsCount: number;
  pendingQuestionsCount: number;
  pendingAdminRequestsCount?: number;
  adminsCount?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    timestamp?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export type VideoSource = 'YOUTUBE' | 'HOSTED';
export type VideoStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';

export interface Lecture {
  id: string;
  courseId?: string | null;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  videoSource?: VideoSource;
  youtubeUrl?: string | null;
  youtubeVideoId?: string | null;
  videoProvider?: string | null;
  videoPlaybackId?: string | null;
  videoUploadId?: string | null;
  videoStatus?: VideoStatus;
  videoMetadata?: any;
  academicYear: AcademicYear;
  chapter: string;
  durationMinutes: number;
  status: ContentStatus;
  orderIndex: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
    price?: number;
  } | null;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  content: string;
  thumbnailUrl?: string | null;
  academicYear: AcademicYear;
  price: number;
  schedule: string;
  capacity?: number | null;
  activeBookingsCount: number;
  availableSeats?: number | null;
  isFull: boolean;
  isAvailable: boolean;
  status: ContentStatus;
  createdAt: string;
  lectures?: Lecture[];
}

export interface Booking {
  id: string;
  userId: string;
  courseId: string;
  status: BookingStatus;
  notes?: string | null;
  adminFeedback?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  student?: {
    name: string;
    phone: string;
    academicYear: AcademicYear;
  };
  course?: {
    title: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    price: number;
    schedule: string;
    academicYear: AcademicYear;
  };
  user?: User;
}

export interface Question {
  id: string;
  userId: string;
  title: string;
  content: string;
  academicYear: AcademicYear;
  chapter: string;
  imageUrl?: string | null;
  status: QuestionStatus;
  answerText?: string | null;
  answeredBy?: string | null;
  answeredAt?: string | null;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    academicYear: AcademicYear;
  };
  adminUser?: {
    firstName: string;
    lastName: string;
  };
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export type UserNotification = SystemNotification;

export interface PermissionItem {
  code: string;
  label: string;
  description: string;
}

export interface PermissionGroup {
  name: string;
  permissions: PermissionItem[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: 'إدارة المحتوى والدروس',
    permissions: [
      { code: 'lectures:read', label: 'استعراض المحاضرات', description: 'مشاهدة قائمة المحاضرات والفيديوهات' },
      { code: 'lectures:manage', label: 'إدارة المحاضرات', description: 'إنشاء وتعديل ونشر وأرشفة المحاضرات وفيديوهات يوتيوب' },
      { code: 'courses:read', label: 'استعراض الكورسات', description: 'مشاهدة الكورسات والمجموعات' },
      { code: 'courses:manage', label: 'إدارة الكورسات', description: 'إنشاء وتعديل وتسعير وتحديد سعة الكورسات' },
    ],
  },
  {
    name: 'إدارة الطلاب والتفاعل',
    permissions: [
      { code: 'users:read', label: 'استعراض الطلاب', description: 'عرض قائمة الطلاب المسجلين وبياناتهم' },
      { code: 'users:write', label: 'تعديل حسابات الطلاب', description: 'تفعيل أو تعطيل حسابات الطلاب' },
      { code: 'bookings:manage', label: 'إدارة الحجوزات', description: 'قبول وتأكيد أو إلغاء طلبات حجز المجموعات' },
      { code: 'questions:answer', label: 'الرد على الأسئلة', description: 'الإجابة على استفسارات وأسئلة الفيزياء' },
    ],
  },
  {
    name: 'النظام والأمان',
    permissions: [
      { code: 'audit:read', label: 'سجلات النشاط (Audit Logs)', description: 'عرض سجلات الأمان والعمليات الإدارية' },
      { code: 'admin:access', label: 'دخول لوحة التحكم', description: 'صلاحية فتح لوحة الإدارة الأساسية' },
    ],
  },
];

