'use client';

import React, { useState, useEffect } from 'react';
import { QuestionService } from '@/services/data.service';
import { Question } from '@/types';
import { HelpCircle, CheckCircle2, Clock, Send, Eye, User, Calendar } from 'lucide-react';
import { LoadingSpinner, EmptyState, ErrorState, AlertBanner } from '@/components/UIState';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ANSWERED' | 'ALL'>('PENDING');

  // Answer state
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = activeTab !== 'ALL' ? { status: activeTab } : undefined;
      const res = await QuestionService.getAllQuestions(params);
      if (res.success && Array.isArray(res.data)) {
        setQuestions(res.data);
      } else {
        setQuestions([]);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الأسئلة');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [activeTab]);

  const handleAnswerSubmit = async (questionId: string) => {
    if (!answerText.trim()) return;
    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await QuestionService.answerQuestion(questionId, answerText);
      if (res.success) {
        setActionSuccess('تم إرسال إجابتك للطالب بنجاح وتم إشعاره فوريًا!');
        setAnsweringId(null);
        setAnswerText('');
        fetchQuestions();
      }
    } catch (err: any) {
      setActionError(err.message || 'حدث خطأ أثناء إرسال الإجابة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">إدارة أسئلة ومسائل الطلاب</h1>
        <p className="text-xs text-slate-400 mt-1">
          مراجعة المسائل المرفوعة من قبل الطلاب وكتابة الشرح والتوضيح الفوري
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PENDING'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          الأسئلة بانتظار الرد (معلقة)
        </button>
        <button
          onClick={() => setActiveTab('ANSWERED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ANSWERED'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          الأسئلة المجاب عليها
        </button>
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          كافة الأسئلة
        </button>
      </div>

      {actionSuccess && <AlertBanner type="success" message={actionSuccess} />}
      {actionError && <AlertBanner type="error" message={actionError} />}

      {isLoading ? (
        <LoadingSpinner text="جاري جلب الأسئلة..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchQuestions} />
      ) : questions.length === 0 ? (
        <EmptyState
          title="لا توجد أي أسئلة في هذا القسم"
          description="جميع أسئلة الطلاب تمت مراجعتها والرد عليها."
        />
      ) : (
        <div className="space-y-5">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4 shadow-sm"
            >
              {/* Question Top Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    ؟
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{q.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{q.chapter}</span>
                      <span>•</span>
                      <span>
                        الطالب: {q.user ? `${q.user.firstName} ${q.user.lastName}` : 'طالب مسجل'}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-500" dir="ltr">{q.user?.phoneNumber}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                    q.status === 'ANSWERED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {q.status === 'ANSWERED' ? 'تمت الإجابة' : 'بانتظار الرد'}
                </span>
              </div>

              {/* Question Text */}
              <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800/50">
                {q.content}
              </div>

              {/* Attached Image */}
              {q.imageUrl && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 block">صورة المسألة المرفوعة:</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={q.imageUrl.startsWith('http') ? q.imageUrl : `http://localhost:5000${q.imageUrl}`}
                    alt="صورة المسألة"
                    className="max-h-72 rounded-2xl border border-slate-800 object-contain bg-black"
                  />
                </div>
              )}

              {/* Existing Answer or Answer Form */}
              {q.status === 'ANSWERED' && q.answerText ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>الإجابة المرسلة للطالب:</span>
                    </span>
                    {q.answeredAt && (
                      <span className="font-mono text-[10px] text-emerald-500">
                        {new Date(q.answeredAt).toLocaleString('ar-EG')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-200 whitespace-pre-wrap leading-relaxed">
                    {q.answerText}
                  </p>
                </div>
              ) : (
                <div className="pt-2">
                  {answeringId === q.id ? (
                    <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-amber-500/40">
                      <label className="block text-xs font-bold text-amber-400">
                        اكتب إجابتك وتوضيحك للطالب الآن:
                      </label>
                      <textarea
                        rows={4}
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="اكتب خطوات الحل بالتفصيل والقوانين المستخدمة..."
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAnsweringId(null);
                            setAnswerText('');
                          }}
                          className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting || !answerText.trim()}
                          onClick={() => handleAnswerSubmit(q.id)}
                          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <span>جاري الإرسال...</span>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>إرسال الإجابة للطالب</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAnsweringId(q.id);
                        setAnswerText('');
                      }}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>الرد على هذا السؤال</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
