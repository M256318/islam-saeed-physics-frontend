'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { QuizService } from '@/services/data.service';
import { Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizSettings } from '@/types';
import { useRouter } from 'next/navigation';
import { LoadingSpinner, EmptyState, AlertBanner } from '@/components/UIState';
import { Button } from '@/components/Button';
import { resolveMediaUrl } from '@/lib/media';

export default function StudentQuizAttemptPage({
  params,
}: { params: { quizId: string; attemptId: string } }) {
  const { user } = useAuth();
  const { quizId, attemptId } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const router = useRouter();

  // Fetch quiz data
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const fetchQuizData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get quiz details
      const quizRes = await QuizService.getQuizById(quizId);
      if (quizRes.success && quizRes.data?.quiz) {
        setQuiz(quizRes.data.quiz);
      }

      // Get attempt details
      const attemptRes = await QuizService.getAttempt(attemptId);
      if (attemptRes.success && attemptRes.data?.attempt) {
        setAttempt(attemptRes.data.attempt);
      }

      // Get questions with options
      if (quiz) {
        const questionsRes = await QuizService.getQuizzes({ 
          limit: 100, 
          academicYear: quiz.academicYear 
        });
        if (questionsRes.success && Array.isArray(questionsRes.data)) {
          // Filter questions for this quiz
          const fetchedQuestions = questionsRes.data.filter((q: any) => q.quizId === quizId);
          // Map to include options order
          const mappedQuestions = fetchedQuestions.map((q: any) => ({
            ...q,
            options: q.options?.sort((a: any, b: any) => a.orderIndex - b.orderIndex) || [],
          }));
          setQuestions(mappedQuestions);
        }
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل بيانات الاختبار');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit answer
  const submitAnswer = useCallback(async (
    questionId: string,
    selectedOptionId: string | null,
    essayAnswer: string | null
  ) => {
    try {
      await QuizService.submitAnswer(attemptId!, questionId, {
        selectedOptionId: selectedOptionId || undefined,
        essayAnswer: essayAnswer || undefined,
      });
      // Move to next question or show result
      const nextIndex = currentQuestionIndex + 1;
      const totalQuestions = questions.length;
      
      if (nextIndex < totalQuestions) {
        setCurrentQuestionIndex(nextIndex);
      } else {
        setShowResult(true);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في حفظ الإجابة');
    }
  }, [attemptId, currentQuestionIndex, questions.length]);

  const handleOptionSelect = useCallback((optionId: string) => {
    // Submit the answer immediately when option is clicked
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    submitAnswer(currentQuestion.id, optionId, null);
    
    // Show answer feedback immediately based on settings
    setShowAnswer(true);
  }, [currentQuestionIndex, questions, submitAnswer]);

  useEffect(() => {
    fetchQuizData();
  }, [quizId, attemptId]);

  // If no quiz or attempt, redirect
  if (!quiz || !attempt) {
    return <div className="p-8 text-center">لا يمكن عرض الاختبار</div>;
  }

  // Check if student is enrolled in this quiz's academic year
  const studentEligible = quiz.academicYear === user?.academicYear;

  if (!studentEligible) {
    return <div className="p-8 text-center text-red-600">
      <p>هذا الاختبار مخصص لصف دراسي آخر</p>
      <Link 
        href="/student/quizzes" 
        className="btn bg-amber-600 text-white px-6 py-3 rounded mt-4"
      >
        العودة للاختبارات المتاحة
      </Link>
    </div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const settings = quiz.settings as QuizSettings | {};

  // Determine if we should show correct answer immediately
  const showCorrectImmediately = (quiz.settings as QuizSettings | undefined)?.showCorrectImmediately;
  const showExplanationImmediately = (quiz.settings as QuizSettings | undefined)?.showExplanationImmediately;

  if (showResult) {
    return (
      <div className="p-8 bg-amber-50/50 rounded-3xl">
        <h2 className="text-2xl font-black text-amber-600 mb-4">نتيجة الاختبار</h2>
        <p className="text-slate-600 mb-6">
          لقد أنهيت الاختبار! جزاك الله خيرًا.
        </p>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>الدرجة: {attempt?.score || 0} / {quiz.settings?.passPercentage || 60}%</span>
            <span>النسبة: {(attempt?.percentage || 0)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>الوقت المستغرق: {attempt?.timeSpent || 0} ثانية</span>
            <span>محاولة: {attempt?.status === 'SUBMITTED' ? 'مُسَلّم' : 'جارٍ'}</span>
          </div>
        </div>
        <Button
          onClick={() => router.push('/student/quizzes')}
          variant="primary"
        >
          محاولة جديدة
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-amber-400"
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
              <div>
                <h2 className="font-black text-xl text-white">{quiz.title}</h2>
                <p className="text-sm text-slate-400">
                  {quiz.durationMinutes ? `${quiz.durationMinutes} دقيقة` : 'لا يوجد وقت محدد'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>السؤال {currentQuestionIndex + 1} من {totalQuestions}</span>
              <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-bold">
                {attempt?.status === 'SUBMITTED' ? '已提交' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* Quiz Settings Info */}
        {showAnswer && currentQuestion && currentQuestion.type === 'MULTIPLE_CHOICE' && (
          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 mb-4">
            <p className="text-sm text-slate-300 mb-2">
              إجابتك: {' '}
              {currentQuestion.options.find((opt: any) => opt.id === attempt?.answers?.find((a: any) => a.questionId === currentQuestion.id)?.selectedOptionId)?.text || 'غير محددة'}
            </p>
            {currentQuestion.options.find((opt: any) => opt.isCorrect && showCorrectImmediately) && (
              <p className="text-sm font-bold text-emerald-400">
                ✓ {showExplanationImmediately ? 'الإجابة صحيحة - ' : ''}
                {currentQuestion.options.find((opt: any) => opt.isCorrect)?.explanation || 'الإجابة الصحيحة'}
              </p>
            )}
            {!currentQuestion.options.find((opt: any) => opt.isCorrect) && showExplanationImmediately && (
              <p className="text-sm font-bold text-red-400">
                ✗ {currentQuestion.options.map((opt: any) => opt.explanation).filter((e: any) => e).join(' ') || 'لم يتم توفير explanation'}
              </p>
            )}
          </div>
        )}

        {/* Question Card */}
        {isLoading ? (
          <LoadingSpinner text="جاري تحميل السؤال..." />
        ) : !currentQuestion ? (
          <div className="p-8 text-center">
            <p>لا توجد أسئلة متاحة</p>
            <Link href="/student/quizzes" className="btn bg-amber-600 text-white px-6 py-3 rounded mt-4">
              العودة للاختبارات
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 mb-8">
            
            {/* Question Number and Progress */}
            <div className="mb-6">
              <p className="text-amber-400 font-bold text-sm mb-2">السؤال {currentQuestionIndex + 1} من {totalQuestions}</p>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-600 rounded-full transition-width" 
                  style={{ width: ((currentQuestionIndex + 1) / totalQuestions) * 100 + '%' }}
                />
              </div>
            </div>

            {/* Question Image or Text */}
            <div className="mb-8">
              {currentQuestion.imageUrl ? (
                <div className="border rounded-xl p-4 mb-4 relative">
                  <img
                    src={resolveMediaUrl(currentQuestion.imageUrl)}
                    alt={currentQuestion.title}
                    className="w-full h-64 object-contain border border-slate-700"
                  />
                  {currentQuestion.type === 'ESSAY' && (
                    <span className="absolute top-2 right-2 bg-slate-600/80 text-slate-300 text-xs font-bold px-2 py-1 rounded">
                      سؤال مقوي
                    </span>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-lg font-black text-white break-all">{currentQuestion.title}</p>
                  {currentQuestion.explanation && (
                    <p className="text-sm text-slate-400 mt-2 break-all">
                      {currentQuestion.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Options for Multiple Choice or Essay Area */}
            {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options.length > 0 ? (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <div
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className="group px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span 
                        className="w-10 h-10 flex items-center justify-center rounded bg-amber-500/20 text-amber-300 font-bold shrink-0"
                      >
                        {String.fromCharCode(65 + idx)} /* A, B, C, D */
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white break-all">
                          {option.text}
                        </p>
                        {showAnswer && option.isCorrect && (
                          <p className="text-xs text-emerald-400 mt-1">
                            {option.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : currentQuestion.type === 'ESSAY' ? (
              <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
                <h3 className="text-amber-400 font-bold text-sm mb-2">السؤال المقالي</h3>
                <p className="text-slate-400 mb-4 break-all">
                  {currentQuestion.title}
                </p>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-y"
                  placeholder="اكتب إجابتك هنا..."
                  onChange={(e) => {
                    // Save essay answer temporarily
                    submitAnswer(currentQuestion.id, null, e.target.value);
                  }}
                />
                <Button
                  onClick={() => setShowResult(true)}
                  variant="secondary"
                  className="mt-4 w-full"
                >
                  تم التسليم (سيتم تصحيح الإجابة من قبل المعلم)
                </Button>
              </div>
            ) : (
              <p className="text-slate-500 text-sm mb-4">
                لا توجد خيارات لهذه المسألة
              </p>
            )}
          </div>
        )}
        
        {/* Navigation Buttons */}
        {!showResult && (
          <div className="flex gap-3 mt-8 pt-8 border-t border-slate-700">
            <Button
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                  setShowAnswer(false);
                }
              }}
              variant="secondary"
              disabled={currentQuestionIndex <= 0}
            >
             Previous Question
            </Button>
            <Button
              onClick={() => {
                if (currentQuestionIndex < totalQuestions - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                  setShowAnswer(false);
                }
              }}
              variant="primary"
              disabled={currentQuestionIndex >= totalQuestions - 1}
            >
              Next Question
            </Button>
          </div>
        )}

        {/* Submit Button */}
        {!showResult && currentQuestionIndex === totalQuestions - 1 && totalQuestions > 0 && (
          <Button
            onClick={() => router.push(`/student/quizzes/${quizId}/attempt/${attemptId}/submit`)}
            variant="primary"
            className="w-full mt-4"
          >
            {totalQuestions > 1 ? 'إنهاء الاختبار وتقديمه' : 'إنهاء الإجابة'}
          </Button>
        )}

      </div>
    </div>
  );
}