'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { QuizService } from '@/services/data.service';
import { Quiz, QuizAttempt } from '@/types';
import { LoadingSpinner, EmptyState, AlertBanner } from '@/components/UIState';
import { Button } from '@/components/Button';
import { resolveMediaUrl } from '@/lib/media';
import { useRouter } from 'next/navigation';

export default function StudentQuizzesPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const router = useRouter();

  const fetchQuizzes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await QuizService.getQuizzes({ limit: 20 });
      if (res.success && Array.isArray(res.data)) {
        setQuizzes(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الاختبارات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAttempt = async (quizId: string) => {
    try {
      const res = await QuizService.startAttempt(quizId);
      if (res.success && res.data?.attempt) {
        router.push(`/student/quizzes/${quizId}/attempt/${res.data.attempt.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في بدء محاولة الاختبار');
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">الاختبارات المتاحة</h1>
        <p className="text-xs text-slate-600 mt-1">
          اختر اختبارًا للبدء وحل الأسئلة
        </p>
      </div>

      {/* Action alerts */}
      {error && <AlertBanner type="error" message={error} />}
      {actionSuccess && <AlertBanner type="success" message={actionSuccess} />}

      {/* Quizzes Grid */}
      {isLoading ? (
        <LoadingSpinner text="جاري تحميل الاختبارات..." />
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="لا توجد اختبارات متاحة"
          description="لا توجد اختبارات متاحة لصفك الدراسي حاليًا. يرجى التواصل مع المعلم."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const isFree = quiz.status === 'PUBLISHED';
            const isStudentEligible = quiz.academicYear === user?.academicYear;
            return (
              <div
                key={quiz.id}
                className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div
                  className="aspect-square bg-slate-950 relative overflow-hidden"
                >
                  {quiz.coverImageUrl ? (
                    <img
                      src={resolveMediaUrl(quiz.coverImageUrl)}
                      alt={quiz.title}
                      className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <svg
                        className="w-10 h-10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1={12} y1={5} x2={12} y2={13} />
                        <line x1={5} y1={12} x2={13} y2={12} />
                        <line x1={12} y1={19} x2={12} y2={20} />
                        <line x1={19} y1={12} x2={20} y2={12} />
                      </svg>
                    </div>
                  )}
                  {isStudentEligible ? (
                    <span className="absolute top-2 left-2 bg-amber-500/90 text-slate-950 text-xs font-bold px-2 py-1 rounded">
                      مناسب لصفك
                    </span>
                  ) : (
                    <span className="absolute top-2 left-2 bg-slate-600/80 text-slate-400 text-xs font-bold px-2 py-1 rounded">
                      صف مختلف
                    </span>
                  )}
                </div>
                <div className="p-5 space-y-3 flex flex-col justify-between flex-1">
                  <div className="space-y-2">
                    <h3 className="font-black text-base text-white line-clamp-2">
                      {quiz.title}
                    </h3>
                    {quiz.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {quiz.description}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    <span className="text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full">
                      {quiz.academicYear === 'GRADE_12'
                        ? '3 ثانوي'
                        : quiz.academicYear === 'GRADE_11'
                        ? '2 ثانوي'
                        : '1 ثانوي'}
                    </span>
                    <span className="text-amber-400 font-bold">
                      {quiz.durationMinutes ? `${quiz.durationMinutes} دقيقة` : 'بدون وقت محدد'}
                    </span>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/student/quizzes/${quiz.id}`}
                    className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                    title="فتح الاختبار وحله"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-amber-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1={12} y1={5} x2={12} y2={13} />
                      <line x1={5} y1={12} x2={13} y2={12} />
                    </svg>
                    <span>حل الاختبار</span>
                  </Link>

                  <div className="flex items-center gap-1">
                    <span
                      className="px-2 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                    >
                      {quiz.maxAttempts} محاولة أقصى
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}