export type AcademicYear = 'GRADE_10' | 'GRADE_11' | 'GRADE_12';
export type Gender = 'MALE' | 'FEMALE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type QuestionStatus = 'PENDING' | 'ANSWERED' | 'REJECTED';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AdminRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type LectureViewStatus = 'not_started' | 'started' | 'watched';

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

export interface CourseVideo {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  videoSource: VideoSource;
  youtubeUrl?: string | null;
  youtubeVideoId?: string | null;
  videoProvider?: string | null;
  videoPlaybackId?: string | null;
  videoUploadId?: string | null;
  videoStatus: VideoStatus;
  videoMetadata?: any;
  durationMinutes: number;
  orderIndex: number;
  status: ContentStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  content: string;
  thumbnailUrl?: string | null;
  academicYear: AcademicYear;
  price: number;
  currency?: string;
  isFree?: boolean;
  schedule: string;
  capacity?: number | null;
  activeBookingsCount?: number;
  availableSeats?: number | null;
  isFull?: boolean;
  isAvailable?: boolean;
  videosCount?: number;
  lecturesCount?: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt?: string;
  lectures?: Lecture[];
  videos?: CourseVideo[];
}

export interface Booking {
  id: string;
  userId: string;
  courseId: string;
  lectureId?: string | null;
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
  lecture?: {
    id: string;
    title: string;
    academicYear: AcademicYear;
    thumbnailUrl?: string | null;
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
  answerImageUrl?: string | null;
  answerAudioUrl?: string | null;
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

export interface LectureView {
  id: string;
  userId: string;
  lectureId: string;
  progress: number; // 0-100
  startedAt: string;
  lastWatchedAt: string;
  completedAt?: string | null;
  watchDuration: number; // in seconds
  lecture?: {
    id: string;
    title: string;
    durationMinutes: number;
    courseId: string;
  };
}

export interface PermissionItem {
  code: string;
  label: string;
  description: string;
}

export interface PermissionGroup {
  name: string;
  permissions: PermissionItem[];
}

// Must stay in sync with the backend catalog in
// enterprise-backend/src/constants/permissions.ts — every permission the API enforces
// must be grantable here.
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
      { code: 'users:delete', label: 'حذف حسابات الطلاب', description: 'حذف حساب طالب نهائيًا (يبقى القرار النهائي لمالك المنصة)' },
      { code: 'bookings:create', label: 'إنشاء الحجوزات', description: 'تسجيل طلبات حجز الكورسات باسم الطلاب' },
      { code: 'bookings:manage', label: 'إدارة الحجوزات', description: 'قبول وتأكيد أو إلغاء طلبات حجز المجموعات' },
      { code: 'questions:ask', label: 'طرح الأسئلة', description: 'إرسال أسئلة الفيزياء من لوحة الطالب' },
      { code: 'questions:answer', label: 'الرد على الأسئلة', description: 'الإجابة على استفسارات وأسئلة الفيزياء' },
    ],
  },
  {
    name: 'إدارة الإشراف والصلاحيات',
    permissions: [
      { code: 'admins:read', label: 'استعراض طلبات الإشراف', description: 'عرض قائمة طلبات الانضمام للإشراف وبيانات المرشحين' },
      { code: 'admins:manage', label: 'إدارة المشرفين', description: 'إنشاء حسابات المشرفين وتعديل صلاحياتهم (التنفيذ محجوز لمالك المنصة)' },
      { code: 'roles:read', label: 'استعراض الأدوار', description: 'عرض أدوار المنصة والصلاحيات المرتبطة بها' },
      { code: 'roles:write', label: 'تعديل الأدوار', description: 'إضافة أو تعديل صلاحيات الأدوار' },
      { code: 'notifications:read', label: 'مركز الإشعارات', description: 'استلام إشعارات الإدارة وقراءة مركز الإشعارات' },
    ],
  },
  {
    name: 'النظام والأمان',
    permissions: [
      { code: 'audit:read', label: 'سجلات النشاط (Audit Logs)', description: 'عرض سجلات الأمان والعمليات الإدارية' },
      { code: 'admin:access', label: 'دخول لوحة التحكم', description: 'صلاحية فتح لوحة الإدارة الأساسية' },
      { code: 'settings:manage', label: 'إعدادات النظام', description: 'تعديل إعدادات المنصة العامة' },
    ],
  },
];

// ==================== QUIZ SYSTEM TYPES ====================
export type QuizStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type QuizAttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
export type QuizQuestionType = 'MULTIPLE_CHOICE' | 'ESSAY';

export interface QuizSettings {
  id: string;
  quizId: string;
  showCorrectImmediately: boolean;
  showExplanationImmediately: boolean;
  showScoreAfterSubmission: boolean;
  allowRetry: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  timeLimitMinutes?: number | null;
  passPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizOption {
  id: string;
  questionId: string;
  text: string;
  imageUrl?: string | null;
  isCorrect: boolean;
  explanation?: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuizQuestionType;
  title: string;
  imageUrl?: string | null;
  explanation?: string | null;
  orderIndex: number;
  points: number;
  createdAt: string;
  updatedAt: string;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  academicYear: AcademicYear;
  chapter?: string | null;
  coverImageUrl?: string | null;
  durationMinutes?: number | null;
  maxAttempts: number;
  status: QuizStatus;
  courseId?: string | null;
  lectureId?: string | null;
  course?: { id: string; title: string; academicYear: string } | null;
  lecture?: { id: string; title: string; academicYear: string } | null;
  settings?: QuizSettings | null;
  questions?: QuizQuestion[];
  questionsCount?: number;
  attemptsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  startedAt: string;
  submittedAt?: string | null;
  score: number;
  percentage: number;
  status: QuizAttemptStatus;
  timeSpent: number;
  createdAt: string;
  updatedAt: string;
  quiz?: Quiz;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    academicYear: AcademicYear;
  };
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId?: string | null;
  essayAnswer?: string | null;
  isCorrect?: boolean | null;
  score: number;
  feedback?: string | null;
  gradedBy?: string | null;
  gradedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  question?: QuizQuestion;
  selectedOption?: QuizOption | null;
}

