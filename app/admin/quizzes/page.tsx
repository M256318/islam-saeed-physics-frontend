'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { QuizService } from '@/services/data.service';
import { Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizSettings, QuizStatus, QuizQuestionType } from '@/types';
import { User, AcademicYear } from '@/types';
import { LoadingSpinner, EmptyState, AlertBanner } from '@/components/UIState';
import { Button } from '@/components/Button';
import { resolveMediaUrl } from '@/lib/media';
import { useRouter } from 'next/navigation';

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const router = useRouter();

  const fetchQuizzes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await QuizService.getQuizzes({ limit: 100 });
      if (res.success && Array.isArray(res.data)) {
        setQuizzes(res.data);
      } else {
        setQuizzes([]);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الاختبارات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const openCreateModal = () => {
    setEditingQuiz(null);
    setShowModal(true);
  };

  const openEditModal = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuiz(null);
    setActionSuccess(null);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuiz || !editingQuiz.id) return;

    try {
      const payload: any = {
        title: editingQuiz.title,
        description: editingQuiz.description,
        academicYear: editingQuiz.academicYear,
        chapter: editingQuiz.chapter,
        coverImageUrl: editingQuiz.coverImageUrl,
        durationMinutes: editingQuiz.durationMinutes,
        maxAttempts: editingQuiz.maxAttempts,
        status: editingQuiz.status,
      };

      if (editingQuiz.settings) {
        payload.settings = {
          showCorrectImmediately: editingQuiz.settings.showCorrectImmediately,
          showExplanationImmediately: editingQuiz.settings.showExplanationImmediately,
          showScoreAfterSubmission: editingQuiz.settings.showScoreAfterSubmission,
          allowRetry: editingQuiz.settings.allowRetry,
          randomizeQuestions: editingQuiz.settings.randomizeQuestions,
          randomizeOptions: editingQuiz.settings.randomizeOptions,
          timeLimitMinutes: editingQuiz.settings.timeLimitMinutes,
          passPercentage: editingQuiz.settings.passPercentage,
        };
      }

      if (editingQuiz.id.startsWith('new-')) {
        // Create new quiz
        const res = await QuizService.createQuiz(payload as any);
        if (res.success) {
          setActionSuccess('تم إنشاء الاختبار بنجاح!');
          setShowModal(false);
          fetchQuizzes();
        }
      } else {
        // Update existing quiz
        const res = await QuizService.updateQuiz(editingQuiz.id, payload as any);
        if (res.success) {
          setActionSuccess('تم تحديث الاختبار بنجاح!');
          setShowModal(false);
          fetchQuizzes();
        }
      }
    } catch (err: any) {
      setError(err.message || 'فشل في حفظ الاختبار');
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('هل أنت متأكد من أرشفة هذا الاختبار؟')) return;
    try {
      await QuizService.deleteQuiz(id);
      setActionSuccess('تم أرشفة الاختبار بنجاح.');
      fetchQuizzes();
    } catch (err: any) {
      setError(err.message || 'فشل في أرشفة الاختبار');
    }
  };

  // Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || q.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">إدارة الاختبارات</h1>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold">
              {quizzes.length} اختبار
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إنشاء وإدارة الاختبارات، إضافة الأسئلة، ومراقبة محاولات الطلاب
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <svg
            className="w-4 h-4"
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
          <span>اختبار جديد</span>
        </button>
      </div>

      {actionSuccess && <AlertBanner type="success" message={actionSuccess} />}
      {error && <AlertBanner type="error" message={error} />}

      {/* Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M22 2l-4 4-4-4" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بعنوان الاختبار..."
            className="w-full pr-10 pl-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="DRAFT">مسودة (DRAFT)</option>
            <option value="PUBLISHED">منشورة (PUBLISHED)</option>
            <option value="ARCHIVED">مؤرشفة (ARCHIVED)</option>
          </select>
        </div>
      </div>

      {/* Quizzes Grid */}
      {isLoading ? (
        <LoadingSpinner text="جاري تحميل الاختبارات..." />
      ) : filteredQuizzes.length === 0 ? (
        <EmptyState
          title="لا توجد نتائج مطابقة"
          description="لا توجد اختبارات تتوافق مع معايير البحث الحالية."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            const isFree = quiz.status === 'PUBLISHED'; // Simple indicator
            return (
              <div
                key={quiz.id}
                className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div className="aspect-square bg-slate-950 relative overflow-hidden">
                  {quiz.coverImageUrl ? (
                    <img
                      src={resolveMediaUrl(quiz.coverImageUrl)}
                      alt={quiz.title}
                      className="w-full h-full object-cover"
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
                </div>
                <div className="p-5 space-y-3 flex flex-col justify-between flex-1">
                  <div className="space-y-2">
                    <h3 className="font-black text-base text-white group-hover:text-amber-400 transition-colors line-clamp-2">
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
                    href={`/admin/quizzes/${quiz.id}`}
                    className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                    title="فتح الاختبار وإدارة الأسئلة"
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
                    <span>فتح الاختبار</span>
                    <svg
                      className="w-3.5 h-3.5 text-slate-900"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 15 17" />
                    </svg>
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(quiz)}
                      className="p-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                      title="تعديل بيانات الاختبار"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1={5} y1={12} x2={19} y2={12} />
                        <polyline points="2 6 15 18 23 13 2 13 15 18" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-2 bg-slate-800 border border-red-500/20 text-red-400 rounded-xl transition-colors"
                      title="أرشفة الاختبار"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1={3} y1={6} x2={21} y2={6} />
                        <line x1={3} y1={25} x2={21} y2={25} />
                        <path d="M7 4h6v4H7V4z" />
                        <path d="M7 11h6v4H7v-4z" />
                        <path d="M7 18h6v4H7v-4z" />
                      </svg>
                    </button>
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