'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AdminService, DashboardStats } from '@/services/admin.service';
import { QuestionService, BookingService } from '@/services/data.service';
import { Question, Booking } from '@/types';
import {
  Users,
  HelpCircle,
  CalendarCheck,
  PlayCircle,
  BookOpen,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Crown,
  UserCheck,
  ClipboardList,
  Shield,
  Plus,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/UIState';

export default function AdminOverviewPage() {
  const { isOwner, hasPermission } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setStatsError(null);

    const [statsRes, questionsRes, bookingsRes] = await Promise.all([
      AdminService.getDashboardStats().catch((err: any) => ({
        success: false as const,
        data: null,
        message: err?.message || 'تعذر تحميل إحصائيات المنصة.',
      })),
      QuestionService.getAllQuestions({ status: 'PENDING' }).catch(() => ({ success: false, data: [] })),
      BookingService.getAllBookings().catch(() => ({ success: false, data: [] })),
    ]);

    if (statsRes.success && statsRes.data) {
      setStats(statsRes.data);
    } else {
      // Never render all-zero KPIs as if the platform were empty
      setStats(null);
      setStatsError(statsRes.message || 'تعذر تحميل إحصائيات المنصة.');
    }
    if (questionsRes.success) setPendingQuestions(questionsRes.data || []);
    if (bookingsRes.success) setRecentBookings(bookingsRes.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="جاري تحميل إحصائيات لوحة التحكم..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {isOwner ? 'لوحة تحكم مالك المنصة (Owner Dashboard)' : 'لوحة تحكم المشرف المساعد'}
            </h1>
            {isOwner && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                <span>مستر إسلام سعيد</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            متابعة لحظية لأداء المنصة والطلاب والمجموعات وسجلات النشاط
          </p>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              href="/admin/admins"
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-colors"
            >
              <Crown className="w-4 h-4" />
              <span>إدارة المشرفين</span>
            </Link>
          </div>
        )}
      </div>

      {/* Owner Highlight Banner (If there are pending admin requests) */}
      {isOwner && (stats?.pendingAdminRequests ?? 0) > 0 && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">
                يوجد {stats?.pendingAdminRequests} طلب انضمام جديد لفريق الإشراف بانتظار موافقتك!
              </span>
              <span className="text-xs text-amber-300">
                يمكنك مراجعة المؤهلات وتعيين الصلاحيات المخصصة لكل مشرف قبل تفعيل حسابه.
              </span>
            </div>
          </div>

          <Link
            href="/admin/admins?tab=requests"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors whitespace-nowrap"
          >
            مراجعة الطلبات الآن
          </Link>
        </div>
      )}

      {/* KPI Stats Cards */}
      {statsError ? (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-white mb-1">تعذر تحميل مؤشرات الأداء (KPIs)</p>
          <p className="text-xs text-slate-400 mb-4">{statsError}</p>
          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Students */}
        {(isOwner || hasPermission('users:read')) && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">إجمالي الطلاب المسجلين</span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-black text-white block">
              {stats?.totalStudents ?? 0}
            </span>
            <span className="text-[11px] text-blue-400 block font-semibold">
              +{stats?.newStudents7d ?? 0} طالب جديد آخر 7 أيام
            </span>
          </div>
        )}

        {/* Questions */}
        {(isOwner || hasPermission('questions:answer')) && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">الأسئلة بانتظار الرد</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-black text-amber-400 block">
              {stats?.pendingQuestions ?? pendingQuestions.length}
            </span>
            <span className="text-[11px] text-amber-300/80 block font-semibold">
              تحتاج لإجابة وشرح المدرس
            </span>
          </div>
        )}

        {/* Bookings */}
        {(isOwner || hasPermission('bookings:manage')) && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">طلبات حجز المجموعات</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-black text-emerald-400 block">
              {stats?.totalBookings ?? 0}
            </span>
            <span className="text-[11px] text-emerald-300/80 block font-semibold">
              {stats?.pendingBookings ?? 0} حجز قيد التأكيد
            </span>
          </div>
        )}

        {/* Content & Lectures */}
        {(isOwner || hasPermission('lectures:read')) && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">المحاضرات المنشورة</span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <PlayCircle className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-black text-white block">
              {stats?.totalLectures ?? 0}
            </span>
            <span className="text-[11px] text-purple-300/80 block font-semibold">
              في {stats?.activeCourses ?? 0} كورسات ومجموعات نشطة
            </span>
          </div>
        )}
      </div>
      )}

      {/* 2-Column Action Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Questions Quick Box */}
        {(isOwner || hasPermission('questions:answer')) && (
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>أسئلة ومسائل الطلاب الأخيرة</span>
              </h2>
              <Link
                href="/admin/questions"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>لوحة الردود الكاملة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingQuestions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                رائع! لا توجد أي أسئلة معلقة حاليًا. جميع أسئلة الطلاب تمت الإجابة عليها.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingQuestions.slice(0, 4).map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate max-w-[200px]">
                        {q.title}
                      </span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                        {q.academicYear === 'GRADE_12' ? '3 ثانوي' : q.academicYear === 'GRADE_11' ? '2 ثانوي' : '1 ثانوي'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{q.content}</p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        الطالب: {q.user ? `${q.user.firstName} ${q.user.lastName}` : 'غير معروف'}
                      </span>
                      <Link
                        href="/admin/questions"
                        className="text-amber-400 font-bold hover:underline"
                      >
                        كتابة الإجابة الآن &larr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Bookings Quick Box */}
        {(isOwner || hasPermission('bookings:manage')) && (
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <span>آخر طلبات حجز الكورسات والمجموعات</span>
              </h2>
              <Link
                href="/admin/bookings"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>إدارة الحجوزات</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                لا توجد طلبات حجز جديدة حتى الآن.
              </p>
            ) : (
              <div className="space-y-3">
                {recentBookings.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">
                        {b.course?.title || 'كورس فيزياء'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                          : 'معلق'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>
                        الطالب: {b.user ? `${b.user.firstName} ${b.user.lastName}` : 'طالب مسجل'}
                      </span>
                      <span className="font-mono text-slate-500" dir="ltr">
                        {b.user?.phoneNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
