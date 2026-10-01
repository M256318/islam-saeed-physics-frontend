'use client';

import React, { useState, useEffect } from 'react';
import { BookingService } from '@/services/data.service';
import { Booking } from '@/types';
import { CalendarCheck, CheckCircle2, XCircle, Clock, User, Phone, BookOpen } from 'lucide-react';
import { LoadingSpinner, EmptyState, ErrorState, AlertBanner } from '@/components/UIState';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await BookingService.getAllBookings();
      if (res.success && Array.isArray(res.data)) {
        setBookings(res.data);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الحجوزات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'CONFIRMED' | 'CANCELLED') => {
    setUpdatingId(id);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await BookingService.updateBookingStatus(id, status);
      if (res.success) {
        setActionSuccess(`تم تحديث حالة الحجز إلى (${status === 'CONFIRMED' ? 'مؤكد' : 'ملغي'}) وإشعار الطالب بنجاح!`);
        fetchBookings();
      }
    } catch (err: any) {
      setActionError(err.message || 'فشل في تحديث الحجز');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">إدارة حجوزات المجموعات والكورسات</h1>
        <p className="text-xs text-slate-400 mt-1">
          متابعة طلبات اشتراك الطلاب وتأكيد أو إلغاء الحجز مع إشعار الطالب تلقائيًا
        </p>
      </div>

      {actionSuccess && <AlertBanner type="success" message={actionSuccess} />}
      {actionError && <AlertBanner type="error" message={actionError} />}

      {isLoading ? (
        <LoadingSpinner text="جاري جلب سجل الحجوزات..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBookings} />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="لا توجد أي طلبات حجز حاليًا"
          description="طلبات حجز الطلاب للكورسات والمجموعات ستظهر هنا تلقائيًا."
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 space-y-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : b.status === 'CANCELLED'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {b.status === 'CONFIRMED'
                      ? 'مؤكد'
                      : b.status === 'CANCELLED'
                      ? 'ملغي'
                      : 'قيد المراجعة'}
                  </span>
                  <span className="text-xs font-extrabold text-white">
                    {b.course?.title || 'كورس فيزياء'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary-400" />
                    الطالب: {b.user ? `${b.user.firstName} ${b.user.lastName}` : 'غير معروف'}
                  </span>

                  <span className="flex items-center gap-1.5 font-mono" dir="ltr">
                    <Phone className="w-3.5 h-3.5 text-primary-400" />
                    {b.user?.phoneNumber}
                  </span>

                  <span className="text-slate-500 font-mono">
                    {new Date(b.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                {b.status !== 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                    disabled={updatingId === b.id}
                    className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد الحجز</span>
                  </button>
                )}

                {b.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                    disabled={updatingId === b.id}
                    className="flex-1 md:flex-none px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>إلغاء</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
