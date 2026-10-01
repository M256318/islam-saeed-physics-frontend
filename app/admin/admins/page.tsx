'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AdminService, CreateAdminPayload, AdminDetail } from '@/services/admin.service';
import { AdminMember, AdminRequest, PERMISSION_GROUPS } from '@/types';
import {
  Crown,
  ShieldCheck,
  UserCheck,
  UserX,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Lock,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  FileText,
  Sliders,
  RefreshCw,
  Eye,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { LoadingSpinner, EmptyState } from '@/components/UIState';

export default function AdminManagementPage() {
  const { isOwner } = useAuth();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'requests' ? 'requests' : 'admins';

  const [activeTab, setActiveTab] = useState<'admins' | 'requests'>(defaultTab);
  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Modals state
  const [selectedAdminForPerms, setSelectedAdminForPerms] = useState<AdminMember | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [isPermsModalOpen, setIsPermsModalOpen] = useState(false);
  const [isPermsSaving, setIsPermsSaving] = useState(false);

  // Create Admin Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateAdminPayload>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    gender: 'MALE',
    academicYear: 'GRADE_12',
    permissions: [],
  });
  const [isCreateSaving, setIsCreateSaving] = useState(false);

  // Review Request Modal state
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<AdminRequest | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewPerms, setReviewPerms] = useState<string[]>([]);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReviewSaving, setIsReviewSaving] = useState(false);

  // Admin Details Modal State
  const [selectedAdminDetail, setSelectedAdminDetail] = useState<AdminDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Delete Admin Modal State
  const [adminToDelete, setAdminToDelete] = useState<AdminMember | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [adminsRes, requestsRes] = await Promise.all([
        AdminService.getAdminsList(),
        AdminService.getAdminRequests(),
      ]);

      if (adminsRes.success && adminsRes.data?.admins) {
        setAdmins(adminsRes.data.admins);
      }
      if (requestsRes.success && requestsRes.data) {
        setRequests(requestsRes.data);
      }
    } catch (err: any) {
      showMessage('error', err.message || 'فشل في جلب البيانات من الخادم');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered admins
  const filteredAdmins = useMemo(() => {
    return admins.filter(
      (a) =>
        a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.phoneNumber.includes(searchQuery) ||
        (a.email && a.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [admins, searchQuery]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (requestFilter !== 'ALL' && r.status !== requestFilter) return false;
      if (!searchQuery) return true;
      return (
        r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phoneNumber.includes(searchQuery) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [requests, requestFilter, searchQuery]);

  // Handle Edit Permissions
  const handleOpenPermsModal = (admin: AdminMember) => {
    setSelectedAdminForPerms(admin);
    setSelectedPerms([...admin.permissions]);
    setIsPermsModalOpen(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedAdminForPerms) return;
    setIsPermsSaving(true);
    try {
      const res = await AdminService.updateAdminPermissions(selectedAdminForPerms.id, selectedPerms);
      if (res.success) {
        showMessage('success', 'تم تحديث مصفوفة صلاحيات المشرف بنجاح');
        setIsPermsModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showMessage('error', err.message || 'فشل في تحديث الصلاحيات');
    } finally {
      setIsPermsSaving(false);
    }
  };

  // Handle Toggle Admin Status
  const handleToggleAdminStatus = async (admin: AdminMember) => {
    if (admin.isOwner) {
      showMessage('error', 'غير مسموح أمنياً بتعطيل حساب مالك المنصة');
      return;
    }

    try {
      const res = await AdminService.toggleAdminStatus(admin.id, !admin.isActive);
      if (res.success) {
        showMessage('success', `تم ${!admin.isActive ? 'تفعيل' : 'تعطيل'} حساب المشرف بنجاح`);
        loadData();
      }
    } catch (err: any) {
      showMessage('error', err.message || 'فشل في تغيير حالة المشرف');
    }
  };

  // Handle Admin Details
  const handleOpenAdminDetails = async (adminId: string) => {
    setIsDetailModalOpen(true);
    setIsDetailLoading(true);
    try {
      const res = await AdminService.getAdminById(adminId);
      if (res.success && res.data) {
        setSelectedAdminDetail(res.data);
      }
    } catch (err: any) {
      showMessage('error', err.message || 'فشل في جلب تفاصيل المشرف');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Handle Delete Admin Modal
  const handleOpenDeleteModal = (admin: AdminMember) => {
    if (admin.isOwner) {
      showMessage('error', 'غير مسموح بحذف حساب مالك المنصة');
      return;
    }
    setAdminToDelete(admin);
    setDeleteConfirmationText('');
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDeleteAdmin = async () => {
    if (!adminToDelete || deleteConfirmationText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      const res = await AdminService.deleteAdmin(adminToDelete.id, deleteConfirmationText);
      if (res.success) {
        showMessage('success', `تم حذف حساب المشرف (${adminToDelete.fullName}) نهائياً بنجاح`);
        setIsDeleteModalOpen(false);
        setAdminToDelete(null);
        loadData();
      }
    } catch (err: any) {
      showMessage('error', err.message || 'فشل في حذف حساب المشرف');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Create Admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateSaving(true);
    try {
      const res = await AdminService.createAdmin(createForm);
      if (res.success) {
        showMessage('success', 'تم إنشاء حساب المشرف وتعيين الصلاحيات بنجاح');
        setIsCreateModalOpen(false);
        setCreateForm({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          email: '',
          password: '',
          gender: 'MALE',
          academicYear: 'GRADE_12',
          permissions: [],
        });
        loadData();
      }
    } catch (err: any) {
      showMessage('error', err.message || 'فشل في إنشاء المشرف');
    } finally {
      setIsCreateSaving(false);
    }
  };

  // Handle Review Request
  const handleOpenReviewModal = (req: AdminRequest, status: 'APPROVED' | 'REJECTED') => {
    setSelectedRequestForReview(req);
    setReviewStatus(status);
    setReviewPerms([]);
    setReviewNotes('');
    setIsReviewModalOpen(true);
  };

  const handleSaveReviewRequest = async () => {
    if (!selectedRequestForReview) return;
    setIsReviewSaving(true);
    try {
      const res = await AdminService.reviewAdminRequest(selectedRequestForReview.id, {
        status: reviewStatus,
        grantedPermissions: reviewStatus === 'APPROVED' ? reviewPerms : undefined,
        reviewNotes: reviewNotes || undefined,
      });

      if (res.success) {
        showMessage(
          'success',
          reviewStatus === 'APPROVED'
            ? 'تمت الموافقة على الطلب وتفعيل حساب المشرف بنجاح'
            : 'تم رفض طلب الانضمام'
        );
        setIsReviewModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showMessage('error', err.message || 'فشل في اتخاذ القرار');
    } finally {
      setIsReviewSaving(false);
    }
  };

  const togglePerm = (code: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(code)) {
      setList(list.filter((c) => c !== code));
    } else {
      setList([...list, code]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Crown className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white">إدارة المشرفين والصلاحيات</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            لوحة تحكم مالك المنصة الحصرية لإدارة فريق العمل، قبول الطلبات، وتعيين الصلاحيات الدقيقة والحذف النهائي
          </p>
        </div>

        {/* Create Direct Admin Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مشرف جديد</span>
        </button>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold border transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'admins'
                ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>المشرفون الحاليون</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950 text-slate-400 font-mono">
              {admins.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>طلبات الانضمام</span>
            {requests.filter((r) => r.status === 'PENDING').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold animate-pulse font-mono">
                {requests.filter((r) => r.status === 'PENDING').length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={loadData}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition"
          title="تحديث البيانات"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search & Sub-filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'admins' ? 'ابحث بالاسم أو الهاتف...' : 'ابحث في الطلبات...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {activeTab === 'requests' && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setRequestFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                  requestFilter === st
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL'
                  ? 'الكل'
                  : st === 'PENDING'
                  ? 'قيد الانتظار'
                  : st === 'APPROVED'
                  ? 'المقبولة'
                  : 'المرفوضة'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading ? (
        <LoadingSpinner text="جاري جلب بيانات المشرفين والطلبات..." />
      ) : activeTab === 'admins' ? (
        /* TAB 1: ACTIVE ADMINS */
        filteredAdmins.length === 0 ? (
          <EmptyState
            title="لا يوجد مشرفون"
            description="لم يتم العثور على أي مشرفين مطابقين للبحث."
          />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/70 text-slate-400 font-medium border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">المشرف</th>
                    <th className="py-3.5 px-4">بيانات التواصل</th>
                    <th className="py-3.5 px-4">الدور الوظيفي</th>
                    <th className="py-3.5 px-4">الصلاحيات الممنوحة</th>
                    <th className="py-3.5 px-4">الحالة</th>
                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                              admin.isOwner
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            }`}
                          >
                            {admin.isOwner ? <Crown className="w-4 h-4" /> : admin.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{admin.fullName}</span>
                            <span className="text-[10px] text-slate-400 block">
                              انضم في {new Date(admin.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4 font-mono text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{admin.phoneNumber}</span>
                        </div>
                        {admin.email && (
                          <div className="flex items-center gap-1.5 text-slate-400 mt-1 text-[11px]">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>{admin.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        {admin.isOwner ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[11px]">
                            <Crown className="w-3 h-3" />
                            <span>مالك المنصة (Owner)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold text-[11px] border border-slate-700">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>مشرف مساعد (Admin)</span>
                          </span>
                        )}
                      </td>

                      {/* Permissions Chips */}
                      <td className="py-4 px-4 max-w-xs">
                        {admin.isOwner ? (
                          <span className="text-amber-400 text-xs font-semibold">
                            ⭐ كامل الصلاحيات دون استثناء
                          </span>
                        ) : admin.permissions.length === 0 ? (
                          <span className="text-slate-500 text-[11px] italic">
                            صلاحيات أساسية (دخول اللوحة فقط)
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {admin.permissions.map((p) => (
                              <span
                                key={p}
                                className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            admin.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              admin.isActive ? 'bg-emerald-400' : 'bg-red-400'
                            }`}
                          />
                          <span>{admin.isActive ? 'نشط' : 'معطل'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Details Button */}
                          <button
                            onClick={() => handleOpenAdminDetails(admin.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                            title="عرض التفاصيل الشاملة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {admin.isOwner ? (
                            <span className="text-slate-500 text-[11px] italic px-2">حساب محمي</span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenPermsModal(admin)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 rounded-lg transition-colors"
                                title="تعديل مصفوفة الصلاحيات"
                              >
                                <Sliders className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleToggleAdminStatus(admin)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  admin.isActive
                                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                                }`}
                                title={admin.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                              >
                                {admin.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </button>

                              {/* Delete Admin Button */}
                              {isOwner && (
                                <button
                                  onClick={() => handleOpenDeleteModal(admin)}
                                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                                  title="حذف المشرف نهائياً"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* TAB 2: ADMIN REQUESTS */
        filteredRequests.length === 0 ? (
          <EmptyState
            title="لا توجد طلبات انضمام"
            description="لم يتم العثور على أي طلبات في هذه الحالة."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-sm">
                      {req.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{req.fullName}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono">{req.phoneNumber}</span>
                        <span>•</span>
                        <span>{req.email}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : req.status === 'REJECTED'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                    }`}
                  >
                    {req.status === 'APPROVED'
                      ? 'تمت الموافقة'
                      : req.status === 'REJECTED'
                      ? 'مرفوض'
                      : 'قيد الانتظار'}
                  </span>
                </div>

                {req.notes && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                    <span className="text-slate-500 text-[10px] block mb-1">نبذة التقديم:</span>
                    {req.notes}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>تاريخ الطلب: {new Date(req.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>

                  {req.status === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenReviewModal(req, 'REJECTED')}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold transition"
                      >
                        رفض
                      </button>
                      <button
                        onClick={() => handleOpenReviewModal(req, 'APPROVED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition"
                      >
                        موافقة وتعيين صلاحيات
                      </button>
                    </div>
                  ) : req.reviewedAt ? (
                    <div className="text-[10px] text-slate-400">
                      تمت المراجعة في {new Date(req.reviewedAt).toLocaleDateString('ar-EG')}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT ADMIN PERMISSIONS */}
      {/* ========================================================================= */}
      {isPermsModalOpen && selectedAdminForPerms && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>تعديل مصفوفة الصلاحيات للمشرف</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  المشرف: {selectedAdminForPerms.fullName} ({selectedAdminForPerms.phoneNumber})
                </p>
              </div>
              <button
                onClick={() => setIsPermsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.name} className="space-y-3">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    {group.name}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {group.permissions.map((perm) => {
                      const isChecked = selectedPerms.includes(perm.code);
                      return (
                        <label
                          key={perm.code}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition text-xs ${
                            isChecked
                              ? 'bg-amber-500/10 border-amber-500/40 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePerm(perm.code, selectedPerms, setSelectedPerms)}
                            className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500/20"
                          />
                          <div>
                            <span className="font-bold text-white block">{perm.label}</span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {perm.description}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                              Code: {perm.code}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <button
                onClick={() => setSelectedPerms([])}
                className="text-xs text-slate-500 hover:text-red-400 font-bold"
              >
                إلغاء تحديد الكل
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPermsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={isPermsSaving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isPermsSaving ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE ADMIN DIRECTLY */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>إنشاء مشرف جديد مباشرة</span>
                </h3>
                <p className="text-xs text-slate-400">
                  إدخال بيانات المشرف وتعيين كلمة المرور والصلاحيات وتفعيل حسابه فورياً
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الأول *</label>
                  <input
                    type="text"
                    required
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="محمد"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم العائلة *</label>
                  <input
                    type="text"
                    required
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="أحمد"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={createForm.phoneNumber}
                    onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="01012345678"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="admin@physics.local"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور الابتدائية *</label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="8 أحرف على الأقل تحتوي حرف كبير ورقم"
                />
              </div>

              {/* Permissions Selector */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  الصلاحيات الابتدائية الممنوحة
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto">
                  {PERMISSION_GROUPS.flatMap((g) => g.permissions).map((perm) => {
                    const isChecked = createForm.permissions.includes(perm.code);
                    return (
                      <label
                        key={perm.code}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500/40 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            togglePerm(perm.code, createForm.permissions, (perms) =>
                              setCreateForm({ ...createForm, permissions: perms })
                            )
                          }
                          className="mt-0.5 rounded text-amber-500"
                        />
                        <div>
                          <span className="font-bold text-white block text-[11px]">{perm.label}</span>
                          <span className="text-[10px] text-slate-400 block">{perm.description}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 -mx-6 -mb-6 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCreateSaving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isCreateSaving ? 'جاري الإنشاء...' : 'إنشاء المشرف وتفعيل الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REVIEW ADMIN REQUEST (APPROVE/REJECT) */}
      {/* ========================================================================= */}
      {isReviewModalOpen && selectedRequestForReview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">
                  {reviewStatus === 'APPROVED' ? 'الموافقة على طلب الإشراف' : 'رفض طلب الإشراف'}
                </h3>
                <p className="text-xs text-slate-400">
                  المتقدم: {selectedRequestForReview.fullName} ({selectedRequestForReview.phoneNumber})
                </p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {reviewStatus === 'APPROVED' ? (
                <>
                  <p className="text-xs text-slate-300">
                    حدد الصلاحيات التي ترغب في منحها لهذا المشرف عند تفعيل حسابه:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {PERMISSION_GROUPS.flatMap((g) => g.permissions).map((perm) => {
                      const isChecked = reviewPerms.includes(perm.code);
                      return (
                        <label
                          key={perm.code}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs ${
                            isChecked
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePerm(perm.code, reviewPerms, setReviewPerms)}
                            className="mt-0.5 rounded text-emerald-500"
                          />
                          <div>
                            <span className="font-bold text-white block text-[11px]">{perm.label}</span>
                            <span className="text-[10px] text-slate-400 block">{perm.description}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">سبب الرفض (اختياري)</label>
                  <textarea
                    rows={3}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                    placeholder="اكتب ملاحظة توضح سبب رفض الطلب..."
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveReviewRequest}
                disabled={isReviewSaving}
                className={`px-5 py-2 font-bold text-xs rounded-xl shadow-lg disabled:opacity-50 ${
                  reviewStatus === 'APPROVED'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    : 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                }`}
              >
                {isReviewSaving
                  ? 'جاري الحفظ...'
                  : reviewStatus === 'APPROVED'
                  ? 'تأكيد الموافقة وتفعيل المشرف'
                  : 'تأكيد الرفض'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADMIN DETAILS MODAL */}
      {/* ========================================================================= */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                بيانات وتفاصيل المشرف
              </h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {isDetailLoading ? (
              <LoadingSpinner text="جاري جلب تفاصيل المشرف..." />
            ) : selectedAdminDetail ? (
              <div className="space-y-6 text-xs">
                {/* Admin Card */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-white">{selectedAdminDetail.fullName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {selectedAdminDetail.isOwner ? '👑 مالك المنصة الرئيسي' : 'مشرف إداري'}
                      </div>
                    </div>
                    <div>
                      {selectedAdminDetail.isActive ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          نشط
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          معطل
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono">{selectedAdminDetail.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{selectedAdminDetail.email || 'غير مسجل'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>تاريخ الإنشاء: {new Date(selectedAdminDetail.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>الأدوار: {selectedAdminDetail.roles.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Permissions List */}
                <div className="space-y-2">
                  <h3 className="font-bold text-white flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-500" />
                    مصفوفة الصلاحيات المخصصة
                  </h3>
                  {selectedAdminDetail.isOwner ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 font-bold text-center">
                      ⭐ مالك المنصة يمتلك جميع الصلاحيات الإدارية دون أي قيود
                    </div>
                  ) : selectedAdminDetail.permissions.length === 0 ? (
                    <div className="text-slate-500 p-3 bg-slate-950 rounded-xl text-center">
                      صلاحيات أساسية (دخول لوحة التحكم فقط)
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedAdminDetail.permissions.map((perm) => (
                        <div key={perm} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-mono text-[11px] text-slate-300">{perm}</span>
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
      {/* MODAL 5: DELETE ADMIN CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && adminToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">تأكيد الحذف النهائي لحساب المشرف</h3>
                <p className="text-[11px] text-rose-400/90 mt-0.5">تحذير أمني: هذا الإجراء نهائي ولا يمكن التراجع عنه.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-300">
                <span className="text-slate-500">اسم المشرف:</span> <strong className="text-white">{adminToDelete.fullName}</strong>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">رقم الهاتف:</span> <span className="font-mono text-amber-400">{adminToDelete.phoneNumber}</span>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">الأدوار:</span> {adminToDelete.roles.join(', ')}
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
                onClick={handleExecuteDeleteAdmin}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
