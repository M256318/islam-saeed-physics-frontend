'use client';

import React, { useState, useEffect } from 'react';
import { BookingService } from '@/services/data.service';
import { Booking } from '@/types';
import Link from 'next/link';
import { BookOpen, Calendar, Clock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/UIState';

export default function StudentBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    BookingService.getMyBookings()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setBookings(res.data);
        }
      })
      .catch((err) => setError(err.message || 'فشل في تحميل الحجوزات'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">طلبات الحجز</h1>
          <p className="text-xs text-slate-600 mt-1">
            متابعة حالة طلبات الحجز ومواعيد المجموعات
          </p>
        </div>

        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>تصفح الكورسات المتاحة</span>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSpinner text="جاري جلب سجل الحجوزات..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="لا توجد أي حجوزات حالية"
          description="لم ترسل طلب حجز بعد. استعرض الكورسات المتاحة لمعرفة التفاصيل."
          actionText="استعراض الكورسات"
          onAction={() => window.location.href = '/courses'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : booking.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : booking.status === 'COMPLETED'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {booking.status === 'CONFIRMED'
                      ? 'تم تأكيد الحجز'
                      : booking.status === 'CANCELLED'
                      ? 'تم إلغاء الحجز'
                      : booking.status === 'COMPLETED'
                      ? 'مكتمل'
                      : 'قيد المراجعة والتأكيد'}
                  </span>

                  <span className="text-xs font-mono text-slate-400">
                    {new Date(booking.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">
                  {booking.course?.title || 'كورس فيزياء'}
                </h3>

                {booking.course?.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {booking.course.description}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  {booking.course?.schedule && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
                      <span>{booking.course.schedule}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span>سعر الكورس: {booking.course?.price || 0} ج.م</span>
                  </div>
                </div>

                {booking.adminFeedback && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    <span className="font-bold block text-slate-900 mb-0.5">ملاحظات الإدارة:</span>
                    <p>{booking.adminFeedback}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
