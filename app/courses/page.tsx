'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CourseService, BookingService } from '@/services/data.service';
import { Course, AcademicYear } from '@/types';
import { Calendar, Users, CheckCircle2, ArrowLeft, Tag, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { LoadingSpinner, CardSkeleton, EmptyState, ErrorState, AlertBanner } from '@/components/UIState';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [bookingCourseId, setBookingCourseId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = selectedGrade !== 'ALL' ? { academicYear: selectedGrade } : undefined;
      const res = await CourseService.getCourses(params);
      if (res.success && Array.isArray(res.data)) {
        setCourses(res.data);
      } else {
        setCourses([]);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الكورسات');
    } finally {
      setIsLoading(false);
    }
  }, [selectedGrade]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleBookCourse = async (courseId: string) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/courses`);
      return;
    }

    setBookingCourseId(courseId);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await BookingService.createBooking({ courseId });
      if (res.success) {
        setActionSuccess('تم إرسال طلب حجز الكورس بنجاح! يمكنك متابعة حالة الحجز من لوحة التحكم.');
        fetchCourses();
      }
    } catch (err: any) {
      setActionError(err.message || 'حدث خطأ أثناء حجز الكورس');
    } finally {
      setBookingCourseId(null);
    }
  };

  const getGradeName = (grade: AcademicYear) => {
    switch (grade) {
      case 'GRADE_10':
        return 'الصف الأول الثانوي';
      case 'GRADE_11':
        return 'الصف الثاني الثانوي';
      case 'GRADE_12':
        return 'الصف الثالث الثانوي';
      default:
        return grade;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="pt-28 pb-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mb-2">
              الكورسات والمجموعات الدراسية المتاحة
            </h1>
            <p className="text-sm text-slate-600">
              اختر مجموعتك الدراسية المناسبة واحجز مكانك الآن لضمان المتابعة والامتحانات الدورية.
            </p>
          </div>

          {/* Action alerts */}
          {actionSuccess && (
            <div className="mb-6">
              <AlertBanner type="success" message={actionSuccess} />
            </div>
          )}
          {actionError && (
            <div className="mb-6">
              <AlertBanner type="error" message={actionError} />
            </div>
          )}

          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedGrade('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedGrade === 'ALL'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              جميع المراحل
            </button>
            <button
              onClick={() => setSelectedGrade('GRADE_12')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedGrade === 'GRADE_12'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الصف الثالث الثانوي
            </button>
            <button
              onClick={() => setSelectedGrade('GRADE_11')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedGrade === 'GRADE_11'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الصف الثاني الثانوي
            </button>
            <button
              onClick={() => setSelectedGrade('GRADE_10')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedGrade === 'GRADE_10'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الصف الأول الثانوي
            </button>
          </div>

          {/* Grid Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchCourses} />
          ) : courses.length === 0 ? (
            <EmptyState
              title="لا توجد كورسات معلنة حاليًا"
              description="سيتم الإعلان عن المجموعات الجديدة ومواعيد الحصص قريبًا."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full text-xs">
                        {getGradeName(course.academicYear)}
                      </span>
                      <div className="flex items-center gap-1 text-slate-900 font-black text-lg">
                        <span>{course.price}</span>
                        <span className="text-xs text-slate-500 font-semibold">ج.م / شهر</span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-lg text-slate-900 leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {course.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
                        <span className="font-medium">{course.schedule}</span>
                      </div>

                      {course.capacity && (
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            الأماكن المتاحة:
                          </span>
                          <span
                            className={`font-bold ${
                              course.isFull ? 'text-red-600' : 'text-emerald-600'
                            }`}
                          >
                            {course.isFull ? 'مكتمل العدد' : `${course.availableSeats || 0} مقعد متبقي`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handleBookCourse(course.id)}
                      disabled={bookingCourseId === course.id || course.isFull || !course.isAvailable}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                        course.isFull || !course.isAvailable
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                          : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/20'
                      }`}
                    >
                      {bookingCourseId === course.id ? (
                        <span>جاري الحجز...</span>
                      ) : course.isFull ? (
                        <span>الحجز مغلق (اكتمل العدد)</span>
                      ) : (
                        <>
                          <span>احجز مكانك في هذا الكورس</span>
                          <ArrowLeft className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
