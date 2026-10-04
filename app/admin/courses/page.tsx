'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CourseService } from '@/services/data.service';
import { Course, AcademicYear, ContentStatus } from '@/types';
import {
  Plus,
  Trash2,
  Calendar,
  Users,
  Search,
  Video,
  Edit,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  ArrowRight,
  ImagePlus,
  X,
} from 'lucide-react';
import { LoadingSpinner, EmptyState, AlertBanner } from '@/components/UIState';
import { resolveMediaUrl } from '@/lib/media';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: 'شرح تفصيلي للمنهج، حل نماذج الامتحانات، وبنك أسئلة فيزياء متقدم',
    academicYear: 'GRADE_12' as AcademicYear,
    thumbnailUrl: '',
    isFree: false,
    price: 250,
    currency: 'EGP',
    schedule: 'السبت والثلاثاء 6:00 مساءً',
    capacity: 50,
    status: 'DRAFT' as ContentStatus,
  });

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await CourseService.getCourses({ limit: 100 });
      if (res.success && Array.isArray(res.data)) {
        setCourses(res.data);
      } else {
        setCourses([]);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الكورسات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      content: 'شرح تفصيلي للمنهج، حل نماذج الامتحانات، وبنك أسئلة فيزياء متقدم',
      academicYear: 'GRADE_12',
      thumbnailUrl: '',
      isFree: false,
      price: 250,
      currency: 'EGP',
      schedule: 'السبت والثلاثاء 6:00 مساءً',
      capacity: 50,
      status: 'DRAFT',
    });
    setThumbnailError(null);
    setShowAddModal(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      content: course.content || '',
      academicYear: course.academicYear,
      thumbnailUrl: course.thumbnailUrl || '',
      isFree: Boolean(course.isFree || course.price === 0),
      price: Number(course.price) || 0,
      currency: course.currency || 'EGP',
      schedule: course.schedule,
      capacity: course.capacity || 50,
      status: course.status,
    });
    setThumbnailError(null);
    setShowAddModal(true);
  };

  const handleCourseThumbnailSelect = async (file: File) => {
    setThumbnailError(null);

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setThumbnailError('الصيغة غير مدعومة. المسموح: JPG أو JPEG أو PNG أو WEBP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setThumbnailError('حجم الصورة يتجاوز الحد الأقصى (5 ميجابايت)');
      return;
    }

    try {
      setIsUploadingThumbnail(true);
      const res = await CourseService.uploadCourseThumbnail(file);
      const uploadedUrl = (res.data as { url?: string })?.url;
      if (res.success && uploadedUrl) {
        setFormData((prev) => ({ ...prev, thumbnailUrl: uploadedUrl }));
      } else {
        setThumbnailError(res.message || 'فشل في رفع الصورة المصغرة');
      }
    } catch (err: unknown) {
      setThumbnailError(err instanceof Error ? err.message : 'فشل في رفع الصورة المصغرة');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setActionSuccess(null);

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        academicYear: formData.academicYear,
        thumbnailUrl: formData.thumbnailUrl || null,
        isFree: formData.isFree,
        price: formData.isFree ? 0 : Number(formData.price),
        currency: 'EGP',
        schedule: formData.schedule,
        capacity: formData.capacity ? Number(formData.capacity) : null,
        status: formData.status,
      };

      if (editingCourse) {
        const res = await CourseService.updateCourse(editingCourse.id, payload);
        if (res.success) {
          setActionSuccess('تم تحديث بيانات الكورس بنجاح!');
          setShowAddModal(false);
          fetchCourses();
        }
      } else {
        const res = await CourseService.createCourse(payload);
        if (res.success) {
          setActionSuccess('تم إنشاء الكورس الجديد بنجاح!');
          setShowAddModal(false);
          fetchCourses();
        }
      }
    } catch (err: any) {
      setError(err.message || 'فشل في حفظ الكورس');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (course: Course) => {
    const nextStatus: ContentStatus = course.status === 'PUBLISHED' ? 'ARCHIVED' : 'PUBLISHED';
    try {
      await CourseService.updateStatus(course.id, nextStatus);
      setActionSuccess(nextStatus === 'PUBLISHED' ? 'تم نشر الكورس للطلاب بنجاح!' : 'تم إخفاء/أرشفة الكورس.');
      fetchCourses();
    } catch (err: any) {
      setError(err.message || 'فشل في تغيير حالة الكورس');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف وأرشفة هذا الكورس؟')) return;
    try {
      await CourseService.deleteCourse(id);
      setActionSuccess('تم أرشفة الكورس بنجاح.');
      fetchCourses();
    } catch (err: any) {
      setError(err.message || 'فشل في حذف الكورس');
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'ALL' || c.academicYear === selectedYear;
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    return matchesSearch && matchesYear && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">إدارة الكورسات والمنهج</h1>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold">
              {courses.length} كورس
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إدارة الكورسات، تسعير المحاضرات، وإضافة وإعادة ترتيب فيديوهات الكورس المتعددة
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة كورس جديد</span>
        </button>
      </div>

      {actionSuccess && <AlertBanner type="success" message={actionSuccess} />}
      {error && <AlertBanner type="error" message={error} />}

      {/* Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو وصف الكورس..."
            className="w-full pr-10 pl-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="ALL">جميع المراحل</option>
            <option value="GRADE_12">الصف الثالث الثانوي</option>
            <option value="GRADE_11">الصف الثاني الثانوي</option>
            <option value="GRADE_10">الصف الأول الثانوي</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="PUBLISHED">المنشورة (PUBLISHED)</option>
            <option value="DRAFT">المسودات (DRAFT)</option>
            <option value="ARCHIVED">المؤرشفة (ARCHIVED)</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <LoadingSpinner text="جاري جلب الكورسات وبيانات الفيديوهات..." />
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title="لا توجد نتائج مطابقة"
          description="لم يتم العثور على كورسات تطابق معايير البحث الحالية."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isFree = course.isFree || Number(course.price) === 0;
            return (
              <div
                key={course.id}
                className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div className="aspect-video bg-slate-950 relative overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img
                      src={resolveMediaUrl(course.thumbnailUrl)}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Layers className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-4 flex flex-col justify-between flex-1">
                <div className="space-y-3">
                  {/* Badges Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full">
                      {course.academicYear === 'GRADE_12'
                        ? '3 ثانوي'
                        : course.academicYear === 'GRADE_11'
                        ? '2 ثانوي'
                        : '1 ثانوي'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isFree ? (
                        <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          مجاني
                        </span>
                      ) : (
                        <span className="text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                          {Number(course.price).toFixed(2)} ج.م
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          course.status === 'PUBLISHED'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : course.status === 'ARCHIVED'
                            ? 'text-red-400 bg-red-500/10'
                            : 'text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {course.status === 'PUBLISHED'
                          ? 'منشور'
                          : course.status === 'ARCHIVED'
                          ? 'مخفي'
                          : 'مسودة'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-black text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Meta Details */}
                  <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Video className="w-3.5 h-3.5 text-amber-400" />
                        فيديوهات الكورس:
                      </span>
                      <span className="font-bold text-white bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                        {course.videosCount ?? (course.videos ? course.videos.length : 0)} فيديو
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                      <span className="truncate">{course.schedule}</span>
                    </div>

                    {course.capacity && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Users className="w-3.5 h-3.5" />
                          المقاعد المتاحة:
                        </span>
                        <span className="font-bold text-white">
                          {course.activeBookingsCount || 0} / {course.capacity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                    title="فتح الكورس وإدارة الفيديوهات"
                  >
                    <Layers className="w-4 h-4" />
                    <span>إدارة الكورس / فتح الكورس</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(course)}
                      className={`p-2 rounded-xl border transition-colors ${
                        course.status === 'PUBLISHED'
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-red-400'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                      title={course.status === 'PUBLISHED' ? 'إخفاء الكورس' : 'نشر الكورس'}
                    >
                      {course.status === 'PUBLISHED' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => openEditModal(course)}
                      className="p-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                      title="تعديل بيانات الكورس"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 bg-slate-800 border border-slate-700 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                      title="أرشفة الكورس"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Course */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">
                {editingCourse ? 'تعديل بيانات الكورس' : 'إضافة كورس فيزياء جديد'}
              </h2>
              <span className="text-xs text-slate-400 font-bold">تسعير وإعدادات الكورس</span>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم الكورس *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: كورس الميكانيكا والكهربية - الصف الثالث الثانوي"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">المرحلة الدراسية</label>
                  <select
                    value={formData.academicYear}
                    onChange={(e: any) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="GRADE_12">الصف الثالث الثانوي</option>
                    <option value="GRADE_11">الصف الثاني الثانوي</option>
                    <option value="GRADE_10">الصف الأول الثانوي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">حالة النشر</label>
                  <select
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="DRAFT">مسودة (DRAFT)</option>
                    <option value="PUBLISHED">منشور للطلاب (PUBLISHED)</option>
                    <option value="ARCHIVED">مؤرشف (ARCHIVED)</option>
                  </select>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-400">إعدادات التسعير (Pricing)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFreeCheckbox"
                      checked={formData.isFree}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFree: e.target.checked,
                          price: e.target.checked ? 0 : (formData.price || 200),
                        })
                      }
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                    />
                    <label htmlFor="isFreeCheckbox" className="text-xs font-bold text-slate-300 cursor-pointer">
                      كورس مجاني بالكامل (Free)
                    </label>
                  </div>
                </div>

                {!formData.isFree && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        السعر بالجنيه المصري (EGP) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        required={!formData.isFree}
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        placeholder="250.00"
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">العملة</label>
                      <input
                        type="text"
                        disabled
                        value="ج.م (EGP)"
                        className="w-full px-3.5 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">المواعيد والجدول *</label>
                  <input
                    type="text"
                    required
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    placeholder="مثال: متاح أسبوعياً أو الأحد والأربعاء"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">السعة القصوى للمقاعد</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    placeholder="مثال: 50"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">صورة الكورس المصغرة (اختياري)</label>
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    className={`cursor-pointer px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      isUploadingThumbnail
                        ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-wait'
                        : 'bg-slate-950 border-slate-700 text-amber-400 hover:border-amber-500'
                    }`}
                  >
                    <ImagePlus className="w-4 h-4" />
                    <span>{isUploadingThumbnail ? 'جاري رفع الصورة...' : 'رفع صورة من الكمبيوتر أو الهاتف'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      disabled={isUploadingThumbnail}
                      onChange={(e) => {
                        const selected = e.target.files?.[0];
                        if (selected) handleCourseThumbnailSelect(selected);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  {formData.thumbnailUrl && (
                    <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                      <img
                        src={resolveMediaUrl(formData.thumbnailUrl) || formData.thumbnailUrl}
                        alt="معاينة صورة الكورس"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
                        className="absolute top-1 left-1 p-0.5 bg-black/70 rounded text-red-400 hover:text-red-300"
                        title="إزالة الصورة"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="أو الصق رابط صورة مباشر (https://...)"
                  className="mt-2 w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />

                {thumbnailError && (
                  <p className="mt-1.5 text-[11px] font-bold text-red-400">{thumbnailError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">وصف الكورس *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="اكتب نبذة ومميزات الكورس..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white resize-none focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : editingCourse ? 'تحديث الكورس' : 'حفظ وإنشاء الكورس'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
