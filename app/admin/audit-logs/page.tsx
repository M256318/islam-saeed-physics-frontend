'use client';

import React, { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { AuditLog } from '@/types';
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  Shield,
  Clock,
  User as UserIcon,
  Globe,
  RefreshCw,
  X,
  FileCode,
} from 'lucide-react';
import { LoadingSpinner, EmptyState } from '@/components/UIState';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchAction, setSearchAction] = useState('');
  const [searchEntity, setSearchEntity] = useState('');
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<AuditLog | null>(null);

  const fetchLogs = async (currentPage = 1) => {
    setIsLoading(true);
    try {
      const res = await AdminService.getAuditLogs({
        page: currentPage,
        limit: 20,
        action: searchAction || undefined,
        entity: searchEntity || undefined,
      });

      if (res.success && res.data) {
        setLogs(res.data);
        if (res.meta?.pagination) {
          setTotalPages(res.meta.pagination.totalPages);
          setPage(res.meta.pagination.page);
        }
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [searchAction, searchEntity]);

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATED') || action.includes('APPROVED')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (action.includes('DELETED') || action.includes('REJECTED') || action.includes('DISABLED')) {
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
    if (action.includes('UPDATED') || action.includes('PERMISSIONS')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">سجلات النشاط والأمان (Audit Logs)</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              تتبع تلقائي لكافة العمليات الإدارية الحساسة والتعديلات وتغييرات الصلاحيات
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchLogs(page)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث السجلات</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">نوع العملية (Action)</label>
          <select
            value={searchAction}
            onChange={(e) => setSearchAction(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">جميع العمليات</option>
            <option value="USER_LOGIN">تسجيل الدخول (USER_LOGIN)</option>
            <option value="ADMIN_REQUEST_SUBMITTED">طلب إشراف جديد (ADMIN_REQUEST_SUBMITTED)</option>
            <option value="ADMIN_REQUEST_APPROVED">الموافقة على مشرف (ADMIN_REQUEST_APPROVED)</option>
            <option value="ADMIN_REQUEST_REJECTED">رفض مشرف (ADMIN_REQUEST_REJECTED)</option>
            <option value="ADMIN_PERMISSIONS_UPDATED">تعديل الصلاحيات (ADMIN_PERMISSIONS_UPDATED)</option>
            <option value="ADMIN_STATUS_CHANGED">تغيير حالة المشرف (ADMIN_STATUS_CHANGED)</option>
            <option value="STUDENT_STATUS_TOGGLED">تعديل حالة الطالب (STUDENT_STATUS_TOGGLED)</option>
            <option value="COURSE_CREATED">إنشاء كورس (COURSE_CREATED)</option>
            <option value="LECTURE_CREATED">إنشاء محاضرة (LECTURE_CREATED)</option>
            <option value="BOOKING_STATUS_CHANGED">تعديل حجز (BOOKING_STATUS_CHANGED)</option>
            <option value="QUESTION_ANSWERED">الرد على سؤال (QUESTION_ANSWERED)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">الكيان المستهدف (Entity)</label>
          <select
            value={searchEntity}
            onChange={(e) => setSearchEntity(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">جميع الكيانات</option>
            <option value="USER">المستخدمين (USER)</option>
            <option value="AdminRequest">طلبات الإشراف (AdminRequest)</option>
            <option value="UserPermission">الصلاحيات (UserPermission)</option>
            <option value="Course">الكورسات (Course)</option>
            <option value="Lecture">المحاضرات (Lecture)</option>
            <option value="Booking">الحجوزات (Booking)</option>
            <option value="Question">الأسئلة (Question)</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchAction('');
              setSearchEntity('');
            }}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="py-20">
          <LoadingSpinner text="جاري جلب سجلات النشاط..." />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          title="لا توجد سجلات تطابق الفلتر"
          description="تظهر هنا كافة العمليات الإدارية الحساسة فور إجرائها في المنصة."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">التاريخ والوقت</th>
                  <th className="py-3.5 px-4">المستخدم / المشرف</th>
                  <th className="py-3.5 px-4">نوع العملية</th>
                  <th className="py-3.5 px-4">الكيان المستهدف</th>
                  <th className="py-3.5 px-4">عنوان الـ IP</th>
                  <th className="py-3.5 px-4 text-center">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(log.createdAt).toLocaleString('ar-EG')}</span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="py-3.5 px-4">
                      {log.user ? (
                        <div>
                          <span className="font-bold text-white block">
                            {log.user.firstName} {log.user.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {log.user.phoneNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">النظام / ضيف</span>
                      )}
                    </td>

                    {/* Action Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Entity */}
                    <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">
                      {log.entity}
                    </td>

                    {/* IP Address */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-500" />
                        <span>{log.ipAddress || 'غير محدد'}</span>
                      </div>
                    </td>

                    {/* Details View Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedLogForDetails(log)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 rounded-lg transition-colors font-bold text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>عرض</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950">
              <span>
                صفحة {page} من {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchLogs(page - 1)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40"
                >
                  السابق
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => fetchLogs(page + 1)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedLogForDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">تفاصيل السجل الإداري</h3>
              </div>
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 font-bold block">نوع العملية:</span>
                  <span className="font-mono text-amber-400 font-bold">{selectedLogForDetails.action}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">الكيان:</span>
                  <span className="font-mono text-white">{selectedLogForDetails.entity}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">التاريخ والوقت:</span>
                  <span className="font-mono text-slate-300">
                    {new Date(selectedLogForDetails.createdAt).toLocaleString('ar-EG')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">عنوان IP:</span>
                  <span className="font-mono text-slate-300">{selectedLogForDetails.ipAddress || 'N/A'}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-300 block mb-1">
                  البيانات المسجلة (Sanitized Payload):
                </span>
                <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-emerald-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(selectedLogForDetails.details || '{}'), null, 2);
                    } catch {
                      return selectedLogForDetails.details || 'لا توجد تفاصيل إضافية مسجلة';
                    }
                  })()}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
