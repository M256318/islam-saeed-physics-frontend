'use client';

import React, { useState, useEffect } from 'react';
import { NotificationService } from '@/services/data.service';
import { UserNotification } from '@/types';
import { Bell, CheckCircle2, Clock, BookOpen, HelpCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/UIState';

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await NotificationService.getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الإشعارات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // silent
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">مركز الإشعارات</h1>
          <p className="text-xs text-slate-600 mt-1">
            جميع التحديثات الخاصة بإجابات أسئلتك وتأكيد الحجوزات
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner text="جاري جلب الإشعارات..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNotifications} />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="لا توجد أي إشعارات حاليًا"
          description="ستصلك إشعارات فورية هنا فور قيام المستر بالرد على أسئلتك أو تأكيد حجزك في المجموعات."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer ${
                n.isRead
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-primary-50/70 border-primary-200 shadow-sm text-slate-900'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    n.isRead ? 'bg-slate-100 text-slate-500' : 'bg-primary-600 text-white shadow-md'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm">{n.title}</h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {new Date(n.createdAt).toLocaleString('ar-EG')}
                  </span>
                </div>
              </div>

              {n.link && (
                <Link
                  href={n.link}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shrink-0"
                >
                  <span>عرض التفاصيل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
