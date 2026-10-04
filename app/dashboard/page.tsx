'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { BookingService, QuestionService, LectureService, NotificationService, CourseService } from '@/services/data.service';
import { Booking, Question, Lecture, UserNotification, Course } from '@/types';
import Link from 'next/link';
import { 
  PlayCircle, 
  BookOpen, 
  HelpCircle, 
  Bell, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Calendar
} from 'lucide-react';
import { LoadingSpinner } from '@/components/UIState';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      BookingService.getMyBookings().catch(() => ({ success: false, data: [] })),
      QuestionService.getMyQuestions().catch(() => ({ success: false, data: [] })),
      LectureService.getLectures({ limit: 4 }).catch(() => ({ success: false, data: [] })),
      NotificationService.getNotifications().catch(() => ({ success: false, data: [] })),
      CourseService.getCourses({ limit: 3 }).catch(() => ({ success: false, data: [] })),
    ]).then(([bookingsRes, questionsRes, lecturesRes, notifsRes, coursesRes]) => {
      if (bookingsRes.success) setBookings(bookingsRes.data || []);
      if (questionsRes.success) setQuestions(questionsRes.data || []);
      if (lecturesRes.success) setLectures(lecturesRes.data || []);
      if (notifsRes.success) setNotifications(notifsRes.data || []);
      if (coursesRes.success && Array.isArray(coursesRes.data)) {
        setAvailableCourses(coursesRes.data.filter((course) => course.status === 'PUBLISHED'));
      }
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="جاري تجهيز لوحة التحكم الخاصة بك..." />;
  }

  const pendingQuestionsCount = questions.filter((q) => q.status === 'PENDING').length;
  const answeredQuestionsCount = questions.filter((q) => q.status === 'ANSWERED').length;
  const activeBookingsCount = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-800 via-primary-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="text-xs font-bold text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-300/30 inline-block">
            لوحة المتابعة الأكاديمية
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            أهلاً بك يا {user?.firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-primary-100 leading-relaxed font-medium">
            واصل تميزك في الفيزياء! شاهد المحاضرات الجديدة، اسأل المستر في المسائل المعقدة، وتابع مواعيد مجموعتك.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">الحجوزات النشطة</span>
            <span className="text-2xl font-black text-slate-900">{activeBookingsCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">أسئلة قيد الرد</span>
            <span className="text-2xl font-black text-slate-900">{pendingQuestionsCount} / 2</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">إجابات مستر إسلام</span>
            <span className="text-2xl font-black text-slate-900">{answeredQuestionsCount}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Questions & Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Questions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              <span>آخر الأسئلة الموجهة للمستر</span>
            </h2>
            <Link
              href="/dashboard/questions"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <span>طرح سؤال جديد</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {questions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              لم تقم بطرح أي أسئلة بعد. إذا واجهتك مسألة صعبة، يمكنك تصويرها الآن!
            </p>
          ) : (
            <div className="space-y-3">
              {questions.slice(0, 3).map((q) => (
                <div key={q.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate max-w-[200px]">
                      {q.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        q.status === 'ANSWERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {q.status === 'ANSWERED' ? 'تمت الإجابة' : 'قيد الانتظار'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">{q.content}</p>

                  {q.answerText && (
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-xs text-emerald-900">
                      <span className="font-bold block text-[11px] mb-0.5">رد المستر:</span>
                      <p className="line-clamp-2">{q.answerText}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Bookings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-600" />
              <span>حجوزاتي</span>
            </h2>
            <Link
              href="/courses"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <span>تصفح الكورسات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              ليس لديك أي حجوزات حاليًا. احجز مكانك في مجموعات الشرح الآن.
            </p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {b.course?.title || 'كورس فيزياء'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : b.status === 'COMPLETED'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status === 'CONFIRMED'
                        ? 'تم تأكيد الحجز'
                        : b.status === 'CANCELLED'
                        ? 'ملغي'
                        : b.status === 'COMPLETED'
                        ? 'مكتمل'
                        : 'قيد المراجعة'}
                    </span>
                  </div>

                  {b.course?.schedule && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{b.course.schedule}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900">استكشف الكورسات المتاحة</h2>
            <p className="mt-1 text-xs text-slate-500">كورسات منشورة يمكنك استعراض تفاصيلها.</p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 hover:text-primary-800"
          >
            <span>تصفح الكورسات</span>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        {availableCourses.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-500">
            لا توجد كورسات منشورة متاحة حاليًا.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {availableCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/30"
              >
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-primary-700">
                      <BookOpen className="h-6 w-6" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-bold text-slate-900">{course.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {course.isFree || Number(course.price) === 0
                      ? 'مجاني'
                      : `${Number(course.price).toFixed(2)} ${course.currency || 'EGP'}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
