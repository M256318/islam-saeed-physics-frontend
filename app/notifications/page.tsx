'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { NotificationService } from '@/services/data.service';
import { UserNotification } from '@/types';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  HelpCircle, 
  BookOpen, 
  UserCheck, 
  ArrowLeft, 
  ShieldAlert,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { LoadingSpinner, EmptyState, ErrorState, AlertBanner } from '@/components/UIState';

export default function UniversalNotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await NotificationService.getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      } else {
        setNotifications([]);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الإشعارات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
    } catch {
      // silent fallback
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setSuccess('تم تحديد جميع الإشعارات كمقروءة بنجاح.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'فشل في تحديث حالة الإشعارات');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'QUESTION_ANSWERED':
      case 'NEW_QUESTION':
        return <HelpCircle className="w-5 h-5" />;
      case 'BOOKING_CONFIRMED':
      case 'NEW_BOOKING':
        return <BookOpen className="w-5 h-5" />;
      case 'ADMIN_REQUEST_APPROVED':
      case 'NEW_STUDENT':
        return <UserCheck className="w-5 h-5" />;
      case 'SYSTEM':
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'UNREAD') return !n.isRead;
    if (activeTab === 'READ') return n.isRead;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">مركز الإشعارات والتنبيهات</h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                متابعة فورية لإجابات أسئلتك، الحجوزات، والتحديثات التعليمية الهامة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold rounded-xl transition"
              >
                <CheckCheck className="w-4 h-4" />
                <span>تحديد الكل كمقروء</span>
              </button>
            )}

            <button
              onClick={fetchNotifications}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
              title="تحديث"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            جميع الإشعارات ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('UNREAD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'UNREAD'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            غير المقروءة ({unreadCount})
          </button>
          <button
            onClick={() => setActiveTab('READ')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'READ'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            المقروءة ({notifications.length - unreadCount})
          </button>
        </div>

        {/* Alerts */}
        {error && <AlertBanner type="error" message={error} />}
        {success && <AlertBanner type="success" message={success} />}

        {/* Content List */}
        {!isAuthenticated ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="font-bold text-slate-900">يجب تسجيل الدخول لعرض الإشعارات</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              سجل دخولك إلى حسابك للوصول إلى مركز الإشعارات الخاص بك.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              تسجيل الدخول
            </Link>
          </div>
        ) : isLoading ? (
          <LoadingSpinner text="جاري جلب الإشعارات الخاصة بك..." />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            title={
              activeTab === 'UNREAD'
                ? 'لا توجد إشعارات غير مقروءة'
                : 'لا توجد أي إشعارات حاليًا'
            }
            description={
              activeTab === 'UNREAD'
                ? 'لقد اطلعت على جميع الإشعارات والتنبيهات الخاصة بك بنجاح.'
                : 'ستصلك تنبيهات فورية هنا فور الرد على أسئلتك، تأكيد الحجوزات، ونشر محاضرات جديدة.'
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer ${
                  n.isRead
                    ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    : 'bg-primary-50/80 border-primary-200/90 shadow-sm text-slate-900'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      n.isRead
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                    }`}
                  >
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm">{n.title}</h3>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {new Date(n.createdAt).toLocaleString('ar-EG')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      className="px-3 py-1.5 text-[11px] font-bold text-primary-700 bg-white hover:bg-primary-100 border border-primary-200 rounded-xl transition"
                    >
                      تحديد كمقروء
                    </button>
                  )}
                  {n.link && (
                    <Link
                      href={n.link}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shrink-0 shadow-sm"
                    >
                      <span>عرض</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
