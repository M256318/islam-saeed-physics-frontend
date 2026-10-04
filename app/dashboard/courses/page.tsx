'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookingService, CourseService } from '@/services/data.service';
import { Booking, BookingStatus, Course } from '@/types';
import { resolveMediaUrl } from '@/lib/media';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/UIState';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Layers,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';

/**
 * Student "My Courses" page.
 *
 * Composed ONLY from services that already exist:
 *  - CourseService.getCourses()  -> courses published for the student's grade
 *                                   (the backend locks students to their own
 *                                   academicYear and PUBLISHED-only, so no
 *                                   client-side grade filter is needed here).
 *  - BookingService.getMyBookings() -> the student's own booking status per course.
 *
 * This is intentionally different from:
 *  - /courses              -> public catalogue browsing / search across grades.
 *  - /dashboard/bookings   -> tracking the status of booking *requests*.
 */
export default function StudentCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Both calls are independent; a booking failure must not hide the courses.
      const [coursesRes, bookingsRes] = await Promise.all([
        CourseService.getCourses({ limit: 100 }),
        BookingService.getMyBookings().catch(() => null),
      ]);

      if (coursesRes.success && Array.isArray(coursesRes.data)) {
        setCourses(coursesRes.data);
      } else {
        setCourses([]);
      }

      if (bookingsRes?.success && Array.isArray(bookingsRes.data)) {
        setBookings(bookingsRes.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحميل كورساتك');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getGradeName = (academicYear: Course['academicYear']): string => {
    switch (academicYear) {
      case 'GRADE_10':
        return 'الصف الأول الثانوي';
      case 'GRADE_11':
        return 'الصف الثاني الثانوي';
      case 'GRADE_12':
        return 'الصف الثالث الثانوي';
      default:
        return academicYear;
    }
  };

  const getBookingStatus = (courseId: string): BookingStatus | null => {
    const forCourse = bookings.filter((booking) => booking.courseId === courseId);
    const active = forCourse.find(
      (booking) => booking.status === 'CONFIRMED' || booking.status === 'PENDING'
    );
    return active?.status ?? forCourse[0]?.status ?? null;
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'الحجز مؤكد';
      case 'CANCELLED':
        return 'الحجز ملغي';
      case 'COMPLETED':
        return 'الحجز مكتمل';
      case 'PENDING':
      default:
        return 'قيد المراجعة';
    }
  };

  const getStatusClasses = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-slate-200 text-slate-700';
      case 'PENDING':
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="جاري تحميل كورساتك..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  const enrolledCount = courses.filter((course) => {
    const status = getBookingStatus(course.id);
    return status === 'CONFIRMED' || status === 'PENDING';
  }).length;
  const freeCount = courses.filter(
    (course) => course.isFree || Number(course.price) === 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">كورساتي</h1>
          <p className="text-xs text-slate-600 mt-1">
            {user?.academicYear
              ? `الكورسات المتاحة لصفك الدراسي: ${getGradeName(user.academicYear)}`
              : 'الكورسات المتاحة لك، مع متابعة حالة حجزك في كل كورس.'}
          </p>
        </div>

        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>تصفح جميع الكورسات</span>
        </Link>
      </div>

      {/* Summary */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">إجمالي الكورسات</span>
              <span className="text-xl font-black text-slate-900">{courses.length}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">كورسات محجوزة</span>
              <span className="text-xl font-black text-slate-900">{enrolledCount}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">كورسات مجانية</span>
              <span className="text-xl font-black text-slate-900">{freeCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Courses */}
      {courses.length === 0 ? (
        <EmptyState
          title="لا توجد كورسات متاحة لصفك الدراسي حاليًا"
          description="سيتم نشر الكورسات الخاصة بصفك الدراسي هنا فور إتاحتها. يمكنك أيضًا تصفح جميع الكورسات المتاحة."
          actionText="تصفح الكورسات"
          onAction={() => {
            window.location.href = '/courses';
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const status = getBookingStatus(course.id);
            const isFree = course.isFree || Number(course.price) === 0;
            const currency = course.currency || 'EGP';
            const videosCount = course.videosCount ?? 0;

            return (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="h-40 bg-slate-900 overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img
                      src={resolveMediaUrl(course.thumbnailUrl) || course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                      <Layers className="w-10 h-10" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full border border-primary-100">
                      {getGradeName(course.academicYear)}
                    </span>

                    {status ? (
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${getStatusClasses(status)}`}
                      >
                        {getStatusLabel(status)}
                      </span>
                    ) : isFree ? (
                      <span className="text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        مجاني
                      </span>
                    ) : (
                      <span className="text-xs font-black bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        {Number(course.price).toFixed(2)} {currency}
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="font-black text-base text-slate-900 line-clamp-1">
                      {course.title}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 mt-auto border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
                      <span className="font-medium truncate">{course.schedule}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-primary-600 shrink-0" />
                      <span className="font-medium">{videosCount} فيديو</span>
                    </div>

                    {course.capacity !== null && course.capacity !== undefined && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary-600 shrink-0" />
                        <span className="font-medium">
                          {course.availableSeats ?? course.capacity} مقعد متاح
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/courses/${course.id}`}
                    className="w-full py-3 rounded-2xl text-xs font-black bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>عرض محتوى الكورس</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
