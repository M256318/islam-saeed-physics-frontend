'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AdminService, StudentDetail } from '@/services/admin.service';
import { User } from '@/types';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  GraduationCap,
  Trash2,
  Eye,
  Calendar,
  AlertTriangle,
  Lock,
  Filter,
  RefreshCw,
  Clock,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { LoadingSpinner, EmptyState, ErrorState, AlertBanner } from '@/components/UIState';

export default function AdminStudentsPage() {
  const { isOwner } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');

  // Details Modal State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Delete Modal State
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Toggle Status Modal State
  const [studentToToggle, setStudentToToggle] = useState<{ id: string; name: string; phone: string; currentStatus: boolean } | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);

  const fetchStudents = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit: 10,
        search: searchTerm || undefined,
        academicYear: gradeFilter !== 'ALL' ? gradeFilter : undefined,
        isActive: statusFilter === 'ACTIVE' ? true : statusFilter === 'DISABLED' ? false : undefined,
        isEmailVerified: verificationFilter === 'VERIFIED' ? true : verificationFilter === 'UNVERIFIED' ? false : undefined,
      };

      const res = await AdminService.getStudents(params);
      if (res.success && Array.isArray(res.data)) {
        setStudents(res.data);
        if (res.meta?.pagination) {
          setPagination(res.meta.pagination);
        }
      } else {
        setStudents([]);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل قائمة الطلاب');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, gradeFilter, statusFilter, verificationFilter]);

  useEffect(() => {
    fetchStudents(1);
  }, [fetchStudents]);

  const openToggleModal = (student: User) => {
    setStudentToToggle({
      id: student.id,
      name: `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`,
      phone: student.phoneNumber,
      currentStatus: student.isActive,
    });
    setIsToggleModalOpen(true);
  };

  const handleExecuteToggleStatus = async () => {
    if (!studentToToggle) return;
    setIsTogglingStatus(true);
    try {
      const res = await AdminService.toggleStudentStatus(studentToToggle.id, !studentToToggle.currentStatus);
      if (res.success) {
        setActionSuccess(`تم ${!studentToToggle.currentStatus ? 'تفعيل' : 'إيقاف'} حساب الطالب بنجاح.`);
        setStudents((prev) =>
          prev.map((s) => (s.id === studentToToggle.id ? { ...s, isActive: !studentToToggle.currentStatus } : s))
        );
        setIsToggleModalOpen(false);
        setStudentToToggle(null);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تغيير حالة الطالب');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const openStudentDetails = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsDetailModalOpen(true);
    setIsDetailLoading(true);
    try {
      const res = await AdminService.getStudentById(studentId);
      if (res.success && res.data) {
        setStudentDetail(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل تفاصيل الطالب');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const openDeleteModal = (student: User) => {
    setStudentToDelete(student);
    setDeleteConfirmationText('');
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!studentToDelete || deleteConfirmationText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      const res = await AdminService.deleteStudent(studentToDelete.id, deleteConfirmationText);
      if (res.success) {
        setActionSuccess(`تم حذف حساب الطالب (${studentToDelete.firstName} ${studentToDelete.lastName}) نهائياً بنجاح.`);
        setIsDeleteModalOpen(false);
        setStudentToDelete(null);
        fetchStudents(pagination.page);
        setTimeout(() => setActionSuccess(null), 5000);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في حذف حساب الطالب');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const getGradeName = (grade: string) => {
    switch (grade) {
      case 'GRADE_10':
        return 'الصف الأول الثانوي';
      case 'GRADE_11':
        return 'الصف الثاني الثانوي';
      case 'GRADE_12':
        return 'الصف الثالث الثانوي';
      default:
        return grade;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            إدارة الطلاب المشتركين
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            البحث والفلترة، عرض التفاصيل الأكاديمية، تفعيل أو تعطيل الحسابات، والحذف النهائي الآمن
          </p>
        </div>

        <button
          onClick={() => fetchStudents(pagination.page)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث القائمة
        </button>
      </div>

      {actionSuccess && <AlertBanner type="success" message={actionSuccess} />}
      {error && <AlertBanner type="error" message={error} />}

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو الهاتف أو البريد..."
              className="w-full pr-9 pl-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Grade Filter */}
          <div className="relative">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none"
            >
              <option value="ALL">جميع المراحل الدراسية</option>
              <option value="GRADE_10">الصف الأول الثانوي</option>
              <option value="GRADE_11">الصف الثاني الثانوي</option>
              <option value="GRADE_12">الصف الثالث الثانوي</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none"
            >
              <option value="ALL">جميع حالات الحساب</option>
              <option value="ACTIVE">الحسابات النشطة فقط</option>
              <option value="DISABLED">الحسابات المعطلة فقط</option>
            </select>
          </div>

          {/* Verification Filter */}
          <div className="relative">
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none"
            >
              <option value="ALL">جميع حالات التحقق</option>
              <option value="VERIFIED">البريد المؤكد (Verified)</option>
              <option value="UNVERIFIED">البريد غير المؤكد</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {isLoading ? (
        <LoadingSpinner text="جاري جلب قائمة الطلاب..." />
      ) : students.length === 0 ? (
        <EmptyState
          title="لا يوجد طلاب مطابقين"
          description="لم يتم العثور على أي طلاب مطابقين لشروط البحث والفلترة المحددة."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">الطالب</th>
                  <th className="py-3 px-4">رقم الهاتف</th>
                  <th className="py-3 px-4">البريد الإلكتروني</th>
                  <th className="py-3 px-4">المرحلة الدراسية</th>
                  <th className="py-3 px-4">التحقق</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">تاريخ التسجيل</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/30 transition">
                    {/* Student Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-xs">
                          {student.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">
                            {student.firstName} {student.middleName ? student.middleName + ' ' : ''}{student.lastName}
                          </div>
                          <div className="text-[10px] text-slate-500">ID: {student.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 font-mono text-slate-300 dir-ltr text-right">
                      {student.phoneNumber}
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 text-slate-300">
                      {student.email || <span className="text-slate-600">غير مسجل</span>}
                    </td>

                    {/* Grade */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <GraduationCap className="w-3 h-3" />
                        {getGradeName(student.academicYear)}
                      </span>
                    </td>

                    {/* Verification */}
                    <td className="py-3 px-4">
                      {student.isEmailVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          مؤكد
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                          <Clock className="w-3 h-3" />
                          غير موثق
                        </span>
                      )}
                    </td>

                    {/* Active Status */}
                    <td className="py-3 px-4">
                      {student.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          موقوف
                        </span>
                      )}
                    </td>

                    {/* Registered Date */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString('ar-EG') : '-'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Details */}
                        <button
                          onClick={() => openStudentDetails(student.id)}
                          title="عرض التفاصيل الأكاديمية"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Status Action Button */}
                        {student.isActive ? (
                          <button
                            onClick={() => openToggleModal(student)}
                            title="إيقاف حساب الطالب"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>إيقاف الحساب</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openToggleModal(student)}
                            title="تفعيل حساب الطالب"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>تفعيل الحساب</span>
                          </button>
                        )}

                        {/* Delete (Owner only) */}
                        {isOwner && (
                          <button
                            onClick={() => openDeleteModal(student)}
                            title="حذف نهائي"
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div>
                إجمالي الطلاب: <span className="font-bold text-white">{pagination.total}</span> | الصفحة {pagination.page} من {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchStudents(pagination.page - 1)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-lg text-slate-300 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchStudents(pagination.page + 1)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-lg text-slate-300 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STUDENT DETAILS MODAL */}
      {/* ========================================================================= */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-500" />
                الملف الأكاديمي الشامل للطالب
              </h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {isDetailLoading ? (
              <LoadingSpinner text="جاري جلب تفاصيل الطالب..." />
            ) : studentDetail ? (
              <div className="space-y-6 text-xs">
                {/* Basic Info Card */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-white">{studentDetail.fullName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{getGradeName(studentDetail.academicYear)}</div>
                    </div>
                    <div>
                      {studentDetail.isActive ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          الحساب نشط
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          الحساب معطل
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono">{studentDetail.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{studentDetail.email || 'غير مسجل'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>تاريخ الانضمام: {new Date(studentDetail.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>التحقق: {studentDetail.isEmailVerified ? 'بريد مؤكد' : 'قيد التأكيد'}</span>
                    </div>
                  </div>
                </div>

                {/* Academic Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
                    <div className="text-xl font-black text-amber-500">{studentDetail.stats.totalBookings}</div>
                    <div className="text-slate-400 text-[11px] mt-1 flex items-center justify-center gap-1">
                      <BookOpen className="w-3 h-3 text-amber-500" />
                      إجمالي الحجوزات والمجموعات
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
                    <div className="text-xl font-black text-indigo-400">{studentDetail.stats.totalQuestions}</div>
                    <div className="text-slate-400 text-[11px] mt-1 flex items-center justify-center gap-1">
                      <HelpCircle className="w-3 h-3 text-indigo-400" />
                      الأسئلة والاستفسارات
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="space-y-2">
                  <h3 className="font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    أحدث الحجوزات
                  </h3>
                  {studentDetail.recentBookings.length === 0 ? (
                    <div className="text-slate-500 p-3 bg-slate-950 rounded-xl text-center">لا توجد حجوزات مسجلة بعد</div>
                  ) : (
                    <div className="space-y-2">
                      {studentDetail.recentBookings.map((b) => (
                        <div key={b.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">{b.course.title}</div>
                            <div className="text-[10px] text-slate-400">{new Date(b.createdAt).toLocaleDateString('ar-EG')}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {b.status === 'CONFIRMED' ? 'مؤكد' : b.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Questions */}
                <div className="space-y-2">
                  <h3 className="font-bold text-white flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    أحدث الأسئلة المطروحة
                  </h3>
                  {studentDetail.recentQuestions.length === 0 ? (
                    <div className="text-slate-500 p-3 bg-slate-950 rounded-xl text-center">لم يطرح أي أسئلة بعد</div>
                  ) : (
                    <div className="space-y-2">
                      {studentDetail.recentQuestions.map((q) => (
                        <div key={q.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">{q.title}</div>
                            <div className="text-[10px] text-slate-400">الباب: {q.chapter}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.status === 'ANSWERED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {q.status === 'ANSWERED' ? 'تمت الإجابة' : 'قيد الانتظار'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DELETE STUDENT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">تأكيد الحذف النهائي لحساب الطالب</h3>
                <p className="text-[11px] text-rose-400/90 mt-0.5">تحذير أمني: هذا الإجراء نهائي ولا يمكن التراجع عنه.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-300">
                <span className="text-slate-500">اسم الطالب:</span> <strong className="text-white">{studentToDelete.firstName} {studentToDelete.lastName}</strong>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">رقم الهاتف:</span> <span className="font-mono text-amber-400">{studentToDelete.phoneNumber}</span>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">المرحلة:</span> {getGradeName(studentToDelete.academicYear)}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">
                لتأكيد الحذف، يرجى كتابة <span className="font-mono font-bold text-rose-400">DELETE</span> في الحقل أدناه:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="اكتب DELETE هنا..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-rose-500/40 rounded-xl text-xs text-rose-400 font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
                onClick={handleExecuteDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TOGGLE STUDENT STATUS CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isToggleModalOpen && studentToToggle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  studentToToggle.currentStatus
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {studentToToggle.currentStatus ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {studentToToggle.currentStatus ? 'تأكيد إيقاف حساب الطالب' : 'تأكيد تفعيل حساب الطالب'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {studentToToggle.name} ({studentToToggle.phone})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {studentToToggle.currentStatus
                ? 'عند إيقاف الحساب، لن يتمكن الطالب من تسجيل الدخول إلى المنصة أو مشاهدة المحاضرات حتى تتم إعادة تفعيله.'
                : 'عند تفعيل الحساب، سيتمكن الطالب من تسجيل الدخول فوراً والوصول إلى كافة خدمات المنصة.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isTogglingStatus}
                onClick={() => {
                  setIsToggleModalOpen(false);
                  setStudentToToggle(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={isTogglingStatus}
                onClick={handleExecuteToggleStatus}
                className={`px-5 py-2 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition ${
                  studentToToggle.currentStatus
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isTogglingStatus ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري التنفيذ...</span>
                  </span>
                ) : (
                  <span>
                    {studentToToggle.currentStatus ? 'نعم، إيقاف الحساب' : 'نعم، تفعيل الحساب'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
