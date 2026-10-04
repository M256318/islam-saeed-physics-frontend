'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CourseService } from '@/services/data.service';
import { Course, AcademicYear } from '@/types';
import {
  Calendar,
  Users,
  Search,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Video,
  Layers,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner, CardSkeleton, EmptyState, ErrorState, AlertBanner } from '@/components/UIState';
import { resolveMediaUrl } from '@/lib/media';
import { useAuth } from '@/hooks/use-auth';

export default function CoursesPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Logged-in students are locked to their own grade by the backend; hide manual grade filters for them
  const isStudentGradeLocked = isAuthenticated && !isAdmin;

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (!isStudentGradeLocked && selectedGrade !== 'ALL') params.academicYear = selectedGrade;
      if (searchTerm.trim() !== '') params.search = searchTerm.trim();

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
  }, [selectedGrade, searchTerm, isStudentGradeLocked]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

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
    <div className="min-h-screen flex flex-col bg-slate-50 font-cairo">
      <Navbar />

      <main className="pt-32 pb-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 text-primary-800 text-xs font-bold shadow-sm">
              <Layers className="w-4 h-4 text-primary-600" />
              <span>المناهج والكورسات المتكاملة 2026/2027</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              تصفح كورسات مادة الفيزياء
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              شرح وافٍ لكل باب وفصل في المنهج مع مسائل المستويات العليا وتدريبات الامتحانات بأسلوب مستر إسلام سعيد.
            </p>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن كورس أو موضوع فيزيائي معين..."
                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            {isStudentGradeLocked && user?.academicYear ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary-50 border border-primary-100 whitespace-nowrap">
                <BookOpen className="w-4 h-4 text-primary-600 shrink-0" />
                <span className="text-xs font-bold text-primary-800">
                  كورسات صفك الدراسي: {getGradeName(user.academicYear)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                <button
                  onClick={() => setSelectedGrade('ALL')}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedGrade === 'ALL'
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  جميع المراحل
                </button>
                <button
                  onClick={() => setSelectedGrade('GRADE_12')}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedGrade === 'GRADE_12'
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  3 ثانوي
                </button>
                <button
                  onClick={() => setSelectedGrade('GRADE_11')}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedGrade === 'GRADE_11'
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  2 ثانوي
                </button>
                <button
                  onClick={() => setSelectedGrade('GRADE_10')}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedGrade === 'GRADE_10'
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  1 ثانوي
                </button>
              </div>
            )}
          </div>

          {/* Courses Grid Content */}
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
              title="لا توجد كورسات مطابقة حاليًا"
              description="جرب البحث بكلمات أخرى أو اختر مرحلة دراسية مختلفة."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const isFree = course.isFree || Number(course.price) === 0;
                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary-500/50 transition-all flex flex-col justify-between group"
                  >
                    {/* Top image or cover if provided */}
                    <div className="aspect-video bg-slate-900 relative overflow-hidden">
                      {course.thumbnailUrl ? (
                        <img
                          src={resolveMediaUrl(course.thumbnailUrl) || course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-100">
                          <Layers className="w-12 h-12" aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] font-extrabold bg-primary-50 text-primary-700 px-3 py-1 rounded-full border border-primary-100">
                          {getGradeName(course.academicYear)}
                        </span>

                        {isFree ? (
                          <span className="text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            مجاني
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-base font-black text-slate-900 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-0.5 rounded-full">
                              {Number(course.price).toFixed(2)} ج.م
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <h2 className="font-black text-lg text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                          {course.title}
                        </h2>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-primary-600" />
                            <span>عدد الفيديوهات:</span>
                          </span>
                          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                            {course.videosCount ?? (course.videos ? course.videos.length : 0)} فيديو
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
                          <span className="font-medium truncate">{course.schedule}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <Link
                        href={`/courses/${course.id}`}
                        className="w-full py-3.5 rounded-2xl text-xs font-black bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 flex items-center justify-center gap-2 transition-all group-hover:shadow-lg"
                      >
                        <span>عرض محتوى وتفاصيل الكورس</span>
                        <ArrowLeft className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
