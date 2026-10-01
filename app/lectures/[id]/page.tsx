'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LectureService } from '@/services/data.service';
import { Lecture } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { Play, Clock, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner, ErrorState } from '@/components/UIState';
import UniversalVideoPlayer from '@/components/video-player/UniversalVideoPlayer';

export default function LectureDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const lectureId = params?.id as string;

  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lectureId) return;
    setIsLoading(true);
    LectureService.getLectureById(lectureId)
      .then((res) => {
        if (res.success && res.data) {
          setLecture(res.data);
        } else {
          setError('المحاضرة غير متوفرة أو تم إلغاء نشرها');
        }
      })
      .catch((err) => {
        setError(err.message || 'فشل في تحميل تفاصيل المحاضرة');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [lectureId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="pt-28 pb-16 flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link
            href="/lectures"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 mb-6 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة المحاضرات</span>
          </Link>

          {isLoading ? (
            <LoadingSpinner text="جاري تجهيز مشغل الفيديو..." />
          ) : error || !lecture ? (
            <ErrorState message={error || 'المحاضرة غير موجودة'} onRetry={() => router.refresh()} />
          ) : (
            <div className="space-y-6">
              {/* Universal Video Player (Supports YouTube & Cloud Hosted Streams) */}
              <UniversalVideoPlayer lecture={lecture} />

              {/* Lecture Metadata Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
                      {lecture.academicYear === 'GRADE_12'
                        ? 'الصف الثالث الثانوي'
                        : lecture.academicYear === 'GRADE_11'
                        ? 'الصف الثاني الثانوي'
                        : 'الصف الأول الثانوي'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {lecture.chapter}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {lecture.durationMinutes} دقيقة
                    </span>
                    <span className="font-mono">{lecture.viewsCount} مشاهدة</span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {lecture.title}
                </h1>

                {lecture.description && (
                  <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed pt-2">
                    <p>{lecture.description}</p>
                  </div>
                )}

                {/* Ask teacher CTA */}
                <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      ؟
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">هل لديك استفسار حول هذه المحاضرة؟</h4>
                      <p className="text-[11px] text-amber-800">يمكنك تصوير المسألة وإرسالها لمستر إسلام سعيد مباشرة.</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/questions"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
                  >
                    اسأل المستر الآن
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
