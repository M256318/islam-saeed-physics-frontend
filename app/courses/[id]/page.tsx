'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AlertBanner, EmptyState, ErrorState, LoadingSpinner } from '@/components/UIState';
import { BookingService, CourseService } from '@/services/data.service';
import { Booking, BookingStatus, Course, CourseVideo } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { resolveMediaUrl } from '@/lib/media';
import { extractYoutubeVideoId } from '@/lib/youtube';
import { ArrowRight, BookOpen, Calendar, Clock, PlayCircle, Sparkles, Users, Video } from 'lucide-react';

function getGradeName(academicYear: Course['academicYear']): string {
  switch (academicYear) {
    case 'GRADE_10':
      return 'الصف الأول الثانوي';
    case 'GRADE_11':
      return 'الصف الثاني الثانوي';
    case 'GRADE_12':
      return 'الصف الثالث الثانوي';
  }
}

function getYoutubeVideoId(video: CourseVideo): string | null {
  return extractYoutubeVideoId(video.youtubeVideoId || video.youtubeUrl);
}

export default function CourseDetailsPage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadCourse() {
      setIsLoading(true);
      setError(null);

      try {
        const [courseResponse, videosResponse] = await Promise.all([
          CourseService.getCourseById(courseId),
          CourseService.getCourseVideos(courseId),
        ]);

        if (!courseResponse.success || !courseResponse.data) {
          throw new Error('تعذر العثور على الكورس المطلوب');
        }

        if (!isCurrent) return;

        setCourse(courseResponse.data as Course);
        const publishedVideos = Array.isArray(videosResponse.data)
          ? (videosResponse.data as CourseVideo[])
              .filter((video) => video.status === 'PUBLISHED')
              .sort((first, second) => first.orderIndex - second.orderIndex)
          : [];
        setVideos(publishedVideos);
      } catch (loadError: unknown) {
        if (isCurrent) {
          setError(loadError instanceof Error ? loadError.message : 'فشل في تحميل تفاصيل الكورس');
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadCourse();
    return () => {
      isCurrent = false;
    };
  }, [courseId]);

  useEffect(() => {
    let isCurrent = true;

    if (isAuthLoading || !isAuthenticated) {
      if (!isAuthLoading && isCurrent) setBooking(null);
      return () => {
        isCurrent = false;
      };
    }

    BookingService.getMyBookings()
      .then((response) => {
        if (!isCurrent || !response.success || !Array.isArray(response.data)) return;

        const courseBookings = response.data.filter((item) => item.courseId === courseId);
        const latestActiveBooking = courseBookings.find(
          (item) => item.status === 'PENDING' || item.status === 'CONFIRMED'
        );
        setBooking(latestActiveBooking || courseBookings[0] || null);
      })
      .catch(() => {
        if (isCurrent) setBooking(null);
      });

    return () => {
      isCurrent = false;
    };
  }, [courseId, isAuthenticated, isAuthLoading]);

  const handleBooking = async () => {
    setBookingError(null);
    setBookingSuccess(null);

    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!course || course.isAvailable === false || course.isFull) {
      setBookingError('هذا الكورس غير متاح للحجز حاليًا.');
      return;
    }

    setIsBookingLoading(true);
    try {
      const response = await BookingService.createBooking({ courseId });
      if (!response.success || !response.data) {
        throw new Error(response.message || 'تعذر إرسال طلب الحجز.');
      }

      setBooking(response.data);
      setBookingSuccess('تم إرسال طلب الحجز، وهو الآن قيد المراجعة.');
    } catch (bookingRequestError: unknown) {
      setBookingError(
        bookingRequestError instanceof Error ? bookingRequestError.message : 'تعذر إرسال طلب الحجز.'
      );
    } finally {
      setIsBookingLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="جاري تحميل تفاصيل الكورس..." />;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-cairo">
        <Navbar />
        <main className="flex-1 px-4 pb-20 pt-32">
          <div className="mx-auto max-w-4xl">
            {error ? <ErrorState message={error} /> : <EmptyState title="الكورس غير موجود" />}
            <Link href="/courses" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary-700">
              <ArrowRight className="h-4 w-4" />
              العودة إلى الكورسات
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isFree = course.isFree || Number(course.price) === 0;
  const currency = course.currency || 'EGP';
  const hasActiveBooking = booking?.status === 'PENDING' || booking?.status === 'CONFIRMED';
  const isAvailable = course.isAvailable !== false && !course.isFull;

  const getBookingStatusMessage = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'طلب الحجز قيد المراجعة.';
      case 'CONFIRMED':
        return 'تم تأكيد الحجز.';
      case 'CANCELLED':
        return 'طلب الحجز السابق ملغي. يمكنك إرسال طلب جديد.';
      case 'COMPLETED':
        return 'تم إكمال الحجز السابق.';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-cairo">
      <Navbar />

      <main className="flex-1 pb-20 pt-28 sm:pt-32">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary-700">
            <ArrowRight className="h-4 w-4" />
            جميع الكورسات
          </Link>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
              <div className="space-y-6 p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-extrabold text-primary-800">
                    {getGradeName(course.academicYear)}
                  </span>
                  {isFree ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">
                      <Sparkles className="h-3.5 w-3.5" />
                      مجاني
                    </span>
                  ) : (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-900">
                      {Number(course.price).toFixed(2)} {currency}
                    </span>
                  )}
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
                    isAvailable
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-slate-100 text-slate-600'
                  }`}>
                    {course.isFull ? 'اكتملت السعة' : isAvailable ? 'متاح للحجز' : 'غير متاح حاليًا'}
                  </span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{course.title}</h1>
                  <p className="max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-600">{course.description}</p>
                </div>

                <div className="grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5">
                    <Video className="h-5 w-5 shrink-0 text-primary-700" />
                    <span className="text-sm font-semibold text-slate-700">{videos.length} فيديو منشور</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5">
                    <Calendar className="h-5 w-5 shrink-0 text-primary-700" />
                    <span className="text-sm font-semibold text-slate-700">{course.schedule}</span>
                  </div>
                  {course.capacity !== null && course.capacity !== undefined && (
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5 sm:col-span-2">
                      <Users className="h-5 w-5 shrink-0 text-primary-700" />
                      <span className="text-sm font-semibold text-slate-700">
                        السعة: {course.availableSeats ?? course.capacity} من {course.capacity} مقعد
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={isAuthLoading || isBookingLoading || hasActiveBooking || !isAvailable}
                    className="w-full rounded-xl bg-primary-700 px-5 py-3.5 text-sm font-black text-white transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-64"
                  >
                    {isBookingLoading
                      ? 'جارٍ إرسال الطلب...'
                      : hasActiveBooking
                      ? booking?.status === 'CONFIRMED'
                        ? 'الحجز مؤكد'
                        : 'الطلب قيد المراجعة'
                      : 'الاشتراك في الكورس'}
                  </button>
                  {booking && <AlertBanner type={booking.status === 'CANCELLED' ? 'warning' : 'info'} message={getBookingStatusMessage(booking.status)} />}
                  {bookingSuccess && <AlertBanner type="success" message={bookingSuccess} />}
                  {bookingError && <AlertBanner type="error" message={bookingError} />}
                  <p className="text-xs leading-5 text-slate-500">
                    هذا طلب حجز فقط؛ لا يتضمن دفعًا ولا يمنح صلاحية خاصة لتشغيل فيديوهات الكورس.
                  </p>
                </div>
              </div>

              <div className="min-h-56 bg-slate-900 lg:min-h-full">
                {course.thumbnailUrl ? (
                  <img
                    src={resolveMediaUrl(course.thumbnailUrl) || course.thumbnailUrl}
                    alt={course.title}
                    className="h-full min-h-56 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-56 items-center justify-center text-white/80">
                    <BookOpen className="h-16 w-16" aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">محتوى الكورس</h2>
                <p className="mt-1 text-sm text-slate-600">الفيديوهات المنشورة للكورس</p>
              </div>
              <span className="text-sm font-bold text-slate-500">{videos.length} فيديو</span>
            </div>

            <AlertBanner
              type="warning"
              message="الفيديوهات المنشورة وروابط YouTube متاحة عبر الـAPI العام؛ لا توجد حاليًا حماية وصول تعتمد على الحجز أو الدفع."
            />

            {videos.length === 0 ? (
              <EmptyState title="لا توجد فيديوهات منشورة حاليًا" description="سيظهر محتوى الكورس هنا عند نشر الفيديوهات." />
            ) : (
              <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {videos.map((video, index) => (
                  <article key={video.id} className="space-y-4 p-4 sm:p-5">
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm font-black text-primary-800">
                        {index + 1}
                      </span>
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-20 sm:w-32">
                        {video.thumbnailUrl ? (
                          <img
                            src={resolveMediaUrl(video.thumbnailUrl) || video.thumbnailUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-primary-700">
                            <Video className="h-7 w-7" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="line-clamp-2 text-sm font-extrabold text-slate-900 sm:text-base">{video.title}</h3>
                        {video.description && <p className="line-clamp-2 text-xs leading-5 text-slate-600">{video.description}</p>}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {video.durationMinutes} دقيقة
                          </span>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-800">منشور</span>
                        </div>
                      </div>
                    </div>

                    {video.videoSource === 'YOUTUBE' && getYoutubeVideoId(video) ? (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={() => setPlayingVideoId(playingVideoId === video.id ? null : video.id)}
                          aria-expanded={playingVideoId === video.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3.5 py-2 text-xs font-bold text-primary-800 hover:bg-primary-100"
                        >
                          <PlayCircle className="h-4 w-4" />
                          {playingVideoId === video.id ? 'إيقاف عرض المشغل' : 'تشغيل الفيديو'}
                        </button>
                        {playingVideoId === video.id && (
                          <div className="aspect-video overflow-hidden rounded-xl bg-black">
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${getYoutubeVideoId(video)}?rel=0`}
                              title={video.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              loading="lazy"
                              className="h-full w-full border-0"
                            />
                          </div>
                        )}
                      </div>
                    ) : video.videoSource === 'HOSTED' ? (
                      <p className="text-xs text-slate-500">
                        تشغيل الفيديو المستضاف غير متاح من صفحة الكورس الحالية.
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">لا يتوفر رابط YouTube صالح لتشغيل هذا الفيديو.</p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}