'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LectureService } from '@/services/data.service';
import { Lecture, AcademicYear } from '@/types';
import { Play, Clock, BookOpen, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner, CardSkeleton, EmptyState, ErrorState } from '@/components/UIState';

export default function LecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLectures = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = selectedGrade !== 'ALL' ? { academicYear: selectedGrade } : undefined;
      const res = await LectureService.getLectures(params);
      if (res.success && Array.isArray(res.data)) {
        setLectures(res.data);
      } else {
        setLectures([]);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل المحاضرات');
    } finally {
      setIsLoading(false);
    }
  }, [selectedGrade]);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  const filteredLectures = lectures.filter((lec) => {
    if (!searchTerm) return true;
    return (
      lec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lec.chapter && lec.chapter.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

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
              المحاضرات والشروحات التعليمية
            </h1>
            <p className="text-sm text-slate-600">
              استمتع بمشاهدة شروحات الفيزياء بدقة عالية وتقسيم شامل لكافة الأبواب والفصول.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Grade Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              <button
                onClick={() => setSelectedGrade('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedGrade === 'ALL'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                جميع الصفوف
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

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم أو الباب..."
                className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Grid Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchLectures} />
          ) : filteredLectures.length === 0 ? (
            <EmptyState
              title="لا توجد محاضرات متاحة"
              description="لم يتم نشر محاضرات لهذه المرحلة الدراسية حاليًا. تابعنا باستمرار لتحديث المنهج."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLectures.map((lec) => (
                <div
                  key={lec.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Thumbnail / Video Preview Banner */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden flex items-center justify-center">
                    {lec.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={lec.thumbnailUrl}
                        alt={lec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-primary-900 to-slate-800 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-primary-600/80 text-white flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 ml-0.5" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {lec.durationMinutes} دقيقة
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-md">
                          {getGradeName(lec.academicYear)}
                        </span>
                        <span className="text-slate-400 font-medium text-[11px]">{lec.chapter}</span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-2">
                        {lec.title}
                      </h3>

                      {lec.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {lec.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">
                        {lec.viewsCount} مشاهدة
                      </span>
                      <Link
                        href={`/lectures/${lec.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 px-3.5 py-2 rounded-lg transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>مشاهدة المحاضرة</span>
                      </Link>
                    </div>
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
