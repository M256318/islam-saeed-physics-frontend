'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LectureService, CourseService } from '@/services/data.service';
import { Lecture, Course, AcademicYear, VideoSource, ContentStatus, VideoStatus } from '@/types';
import {
  PlayCircle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Video,
  Youtube,
  UploadCloud,
  FileVideo,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen,
  Search,
  Filter,
  RefreshCw,
  LayoutGrid,
  List,
  Sparkles,
  Calendar,
  Layers,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { LoadingSpinner, EmptyState, ErrorState, AlertBanner } from '@/components/UIState';
import VideoUploader from '@/components/video-upload/VideoUploader';
import UniversalVideoPlayer from '@/components/video-player/UniversalVideoPlayer';

export default function AdminLecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // View Mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [previewLecture, setPreviewLecture] = useState<Lecture | null>(null);
  const [deletingLecture, setDeletingLecture] = useState<Lecture | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    videoSource: 'YOUTUBE' | 'HOSTED';
    youtubeUrl: string;
    videoPlaybackId: string;
    videoUploadId: string;
    videoProvider: string;
    videoStatus: VideoStatus;
    videoMetadata: any;
    academicYear: AcademicYear;
    chapter: string;
    courseId: string;
    durationMinutes: number;
    status: ContentStatus;
  }>({
    title: '',
    description: '',
    videoSource: 'HOSTED',
    youtubeUrl: '',
    videoPlaybackId: '',
    videoUploadId: '',
    videoProvider: 'SIMULATOR',
    videoStatus: 'UPLOADING',
    videoMetadata: null,
    academicYear: 'GRADE_12',
    chapter: 'الباب الأول: التيار الكهربي وقانون أوم',
    courseId: '',
    durationMinutes: 45,
    status: 'DRAFT',
  });

  const fetchLectures = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [lecturesRes, coursesRes] = await Promise.all([
        LectureService.getLectures(),
        CourseService.getCourses(),
      ]);

      if (lecturesRes.success && Array.isArray(lecturesRes.data)) {
        setLectures(lecturesRes.data);
      } else {
        setLectures([]);
      }

      if (coursesRes.success && Array.isArray(coursesRes.data)) {
        setCourses(coursesRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل المحاضرات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      videoSource: 'HOSTED',
      youtubeUrl: '',
      videoPlaybackId: '',
      videoUploadId: '',
      videoProvider: 'SIMULATOR',
      videoStatus: 'UPLOADING',
      videoMetadata: null,
      academicYear: 'GRADE_12',
      chapter: 'الباب الأول: التيار الكهربي وقانون أوم',
      courseId: '',
      durationMinutes: 45,
      status: 'DRAFT',
    });
    setEditingLecture(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setFormData({
      title: lecture.title,
      description: lecture.description || '',
      videoSource: lecture.videoSource || (lecture.youtubeVideoId ? 'YOUTUBE' : 'HOSTED'),
      youtubeUrl: lecture.youtubeUrl || '',
      videoPlaybackId: lecture.videoPlaybackId || '',
      videoUploadId: lecture.videoUploadId || '',
      videoProvider: lecture.videoProvider || 'SIMULATOR',
      videoStatus: lecture.videoStatus || 'READY',
      videoMetadata: lecture.videoMetadata || null,
      academicYear: lecture.academicYear,
      chapter: lecture.chapter,
      courseId: lecture.courseId || '',
      durationMinutes: lecture.durationMinutes,
      status: lecture.status,
    });
    setShowAddModal(true);
  };

  const handleVideoUploadSuccess = (videoData: {
    videoId: string;
    videoUploadId: string;
    videoProvider: string;
    durationMinutes: number;
    videoStatus: 'READY' | 'PROCESSING';
    videoMetadata: any;
  }) => {
    setFormData((prev) => ({
      ...prev,
      videoPlaybackId: videoData.videoId,
      videoUploadId: videoData.videoUploadId,
      videoProvider: videoData.videoProvider,
      videoStatus: videoData.videoStatus,
      durationMinutes: videoData.durationMinutes || prev.durationMinutes,
      videoMetadata: videoData.videoMetadata,
    }));
  };

  const handleSubmitLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setActionSuccess(null);

    // Form Validation
    if (formData.videoSource === 'HOSTED') {
      if (!formData.videoPlaybackId && !formData.videoUploadId) {
        setError('يرجى رفع ملف فيديو المحاضرة أولاً');
        return;
      }
      if (formData.status === 'PUBLISHED' && formData.videoStatus !== 'READY') {
        setError('لا يمكن نشر المحاضرة قبل اكتمال معالجة وجاهزية الفيديو (READY)');
        return;
      }
    } else {
      if (!formData.youtubeUrl || formData.youtubeUrl.trim().length < 5) {
        setError('يرجى إدخال رابط YouTube صالح للمحاضرة');
        return;
      }
    }

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        videoSource: formData.videoSource,
        academicYear: formData.academicYear,
        chapter: formData.chapter,
        courseId: formData.courseId || null,
        durationMinutes: formData.durationMinutes,
        status: formData.status,
      };

      if (formData.videoSource === 'YOUTUBE') {
        payload.youtubeUrl = formData.youtubeUrl;
      } else {
        payload.videoPlaybackId = formData.videoPlaybackId;
        payload.videoUploadId = formData.videoUploadId;
        payload.videoProvider = formData.videoProvider;
        payload.videoStatus = formData.videoStatus;
        payload.videoMetadata = formData.videoMetadata;
      }

      if (editingLecture) {
        const res = await LectureService.updateLecture(editingLecture.id, payload);
        if (res.success) {
          setActionSuccess('تم تحديث بيانات المحاضرة بنجاح!');
        }
      } else {
        const res = await LectureService.createLecture(payload);
        if (res.success) {
          setActionSuccess('تم إنشاء ونشر المحاضرة بنجاح!');
        }
      }

      setShowAddModal(false);
      resetForm();
      fetchLectures();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'فشل في حفظ بيانات المحاضرة');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleTogglePublish = async (lecture: Lecture) => {
    const newStatus = lecture.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    if (newStatus === 'PUBLISHED' && lecture.videoSource === 'HOSTED' && lecture.videoStatus !== 'READY') {
      setError('لا يمكن نشر المحاضرة قبل اكتمال معالجة الفيديو');
      setTimeout(() => setError(null), 4000);
      return;
    }

    try {
      const res = await LectureService.updateStatus(lecture.id, newStatus);
      if (res.success) {
        setActionSuccess(`تم ${newStatus === 'PUBLISHED' ? 'نشر' : 'إلغاء نشر'} المحاضرة بنجاح.`);
        setLectures((prev) =>
          prev.map((l) => (l.id === lecture.id ? { ...l, status: newStatus } : l))
        );
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تعديل حالة المحاضرة');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteLecture = async () => {
    if (!deletingLecture) return;
    setIsDeleting(true);
    try {
      await LectureService.deleteLecture(deletingLecture.id);
      setActionSuccess('تم حذف المحاضرة وملف الفيديو المرتبط بها نهائيًا.');
      setDeletingLecture(null);
      fetchLectures();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'فشل في حذف المحاضرة');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered lectures
  const filteredLectures = useMemo(() => {
    return lectures.filter((lec) => {
      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchTitle = lec.title.toLowerCase().includes(term);
        const matchChapter = lec.chapter?.toLowerCase().includes(term);
        const matchCourse = lec.course?.title?.toLowerCase().includes(term);
        if (!matchTitle && !matchChapter && !matchCourse) return false;
      }

      // Grade
      if (gradeFilter !== 'ALL' && lec.academicYear !== gradeFilter) return false;

      // Video Source
      if (sourceFilter !== 'ALL') {
        const src = lec.videoSource || (lec.youtubeVideoId ? 'YOUTUBE' : 'HOSTED');
        if (src !== sourceFilter) return false;
      }

      // Status
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PUBLISHED' && lec.status !== 'PUBLISHED') return false;
        if (statusFilter === 'DRAFT' && lec.status !== 'DRAFT') return false;
        if (statusFilter === 'ARCHIVED' && lec.status !== 'ARCHIVED') return false;
        if (statusFilter === 'PROCESSING' && (lec.videoStatus !== 'PROCESSING' && lec.videoStatus !== 'UPLOADING')) return false;
      }

      return true;
    });
  }, [lectures, searchTerm, gradeFilter, sourceFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = lectures.length;
    const published = lectures.filter((l) => l.status === 'PUBLISHED').length;
    const hosted = lectures.filter((l) => l.videoSource === 'HOSTED').length;
    const youtube = lectures.filter((l) => l.videoSource === 'YOUTUBE' || (!l.videoSource && !!l.youtubeVideoId)).length;
    return { total, published, hosted, youtube };
  }, [lectures]);

  const getGradeLabel = (grade: string) => {
    switch (grade) {
      case 'GRADE_12':
        return 'الصف الثالث الثانوي';
      case 'GRADE_11':
        return 'الصف الثاني الثانوي';
      case 'GRADE_10':
        return 'الصف الأول الثانوي';
      default:
        return grade;
    }
  };

  const canPublish =
    formData.videoSource === 'YOUTUBE' ||
    (formData.videoSource === 'HOSTED' && formData.videoStatus === 'READY');

  return (
    <div className="space-y-6" dir="rtl">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Video className="w-6 h-6 text-amber-500" />
            إدارة محاضرات الفيزياء
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            إضافة وإدارة ونشر محاضرات الفيزياء للطلاب، استضافة الفيديوهات السحابية، وربط روابط YouTube
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLectures}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition shadow-sm"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة محاضرة جديدة</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">إجمالي المحاضرات</span>
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2 font-mono">{stats.total}</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">المحاضرات المنشورة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">{stats.published}</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">فيديوهات سحابية</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <UploadCloud className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-400 mt-2 font-mono">{stats.hosted}</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">فيديوهات YouTube</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
              <Youtube className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-400 mt-2 font-mono">{stats.youtube}</p>
        </div>
      </div>

      {actionSuccess && <AlertBanner type="success" message={actionSuccess} />}
      {error && <AlertBanner type="error" message={error} />}

      {/* 3. Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بعنوان المحاضرة أو الباب أو الكورس..."
              className="w-full pr-9 pl-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Grade Filter */}
          <div>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="ALL">جميع المراحل الدراسية</option>
              <option value="GRADE_10">الصف الأول الثانوي</option>
              <option value="GRADE_11">الصف الثاني الثانوي</option>
              <option value="GRADE_12">الصف الثالث الثانوي</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="ALL">جميع مصادر الفيديو</option>
              <option value="HOSTED">فيديوهات مرفوعة ومستضافة سحابياً</option>
              <option value="YOUTUBE">روابط YouTube</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="ALL">جميع الحالات</option>
              <option value="PUBLISHED">منشورة (PUBLISHED)</option>
              <option value="DRAFT">مسودة (DRAFT)</option>
              <option value="PROCESSING">جاري المعالجة (PROCESSING)</option>
              <option value="ARCHIVED">مؤرشفة (ARCHIVED)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary & View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <span>عدد النتائج:</span>
            <span className="font-bold text-amber-400 font-mono">{filteredLectures.length}</span>
            <span>محاضرة</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                viewMode === 'table' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>جدول</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                viewMode === 'cards' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بطاقات</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Lectures Presentation (Table or Cards) */}
      {isLoading ? (
        <LoadingSpinner text="جاري جلب المحاضرات..." />
      ) : filteredLectures.length === 0 ? (
        <EmptyState
          title="لا توجد محاضرات تطابق البحث"
          description="جرّب تغيير كلمات البحث أو الفلاتر المحددة، أو أضف محاضرة فيزياء جديدة."
          actionText="إضافة محاضرة الآن"
          onAction={handleOpenAddModal}
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-bold">
                  <th className="py-3.5 px-4">عنوان المحاضرة</th>
                  <th className="py-3.5 px-4">المرحلة الدراسية</th>
                  <th className="py-3.5 px-4">الباب / الفصل</th>
                  <th className="py-3.5 px-4">مصدر الفيديو</th>
                  <th className="py-3.5 px-4">حالة المحاضرة</th>
                  <th className="py-3.5 px-4">المدة والمشاهدات</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredLectures.map((lec) => {
                  const isHosted = lec.videoSource === 'HOSTED';
                  const isPublished = lec.status === 'PUBLISHED';
                  return (
                    <tr key={lec.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Title */}
                      <td className="py-3.5 px-4 font-bold text-white max-w-xs">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => setPreviewLecture(lec)}
                            className="w-8 h-8 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 transition-colors"
                            title="تشغيل ومعاينة الفيديو"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                          <div className="truncate">
                            <p className="truncate text-white font-bold">{lec.title}</p>
                            {lec.course && (
                              <p className="text-[11px] text-amber-400/90 truncate">كورس: {lec.course.title}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Grade */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
                          {getGradeLabel(lec.academicYear)}
                        </span>
                      </td>

                      {/* Chapter */}
                      <td className="py-3.5 px-4 text-slate-300 font-medium truncate max-w-[180px]">
                        {lec.chapter}
                      </td>

                      {/* Video Source */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isHosted
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {isHosted ? <UploadCloud className="w-3.5 h-3.5" /> : <Youtube className="w-3.5 h-3.5" />}
                          <span>{isHosted ? 'سحابي (Hosted)' : 'YouTube'}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isPublished
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400' : 'bg-slate-500'}`}
                          />
                          <span>{isPublished ? 'منشورة' : 'مسودة (DRAFT)'}</span>
                        </span>
                      </td>

                      {/* Duration & Views */}
                      <td className="py-3.5 px-4 text-slate-400">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <p>⏱️ {lec.durationMinutes} دقيقة</p>
                          <p>👁️ {lec.viewsCount} مشاهدة</p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPreviewLecture(lec)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                            title="معاينة الفيديو"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleTogglePublish(lec)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isPublished
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                            }`}
                            title={isPublished ? 'إلغاء النشر (تحويل لمسودة)' : 'نشر المحاضرة للطلاب'}
                          >
                            {isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(lec)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                            title="تعديل المحاضرة"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeletingLecture(lec)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            title="حذف المحاضرة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLectures.map((lec) => {
            const isHosted = lec.videoSource === 'HOSTED';
            const isPublished = lec.status === 'PUBLISHED';
            return (
              <div
                key={lec.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                        isHosted
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {isHosted ? <UploadCloud className="w-3.5 h-3.5" /> : <Youtube className="w-3.5 h-3.5" />}
                      <span>{isHosted ? 'فيديو سحابي' : 'YouTube'}</span>
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPublished
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPublished ? 'منشورة' : 'مسودة (DRAFT)'}
                    </span>
                  </div>

                  {/* Title & Info */}
                  <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{lec.title}</h3>

                  <div className="text-xs text-slate-400 space-y-1">
                    <p className="truncate">📂 {lec.chapter}</p>
                    <p className="text-[11px] text-slate-500">🎓 {getGradeLabel(lec.academicYear)}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lec.durationMinutes} دقيقة
                      </span>
                      <span>👁️ {lec.viewsCount} مشاهدة</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewLecture(lec)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>معاينة</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePublish(lec)}
                      className={`p-2 rounded-xl transition-colors ${
                        isPublished ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                      title={isPublished ? 'إلغاء النشر' : 'نشر المحاضرة'}
                    >
                      {isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(lec)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      title="تعديل المحاضرة"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeletingLecture(lec)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                      title="حذف المحاضرة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Add / Edit Lecture Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">
                    {editingLecture ? 'تعديل محاضرة الفيزياء' : 'إضافة محاضرة فيزياء جديدة'}
                  </h2>
                  <p className="text-[11px] text-slate-400">حدد مصدر الفيديو وبيانات المحاضرة الأكاديمية</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLecture} className="space-y-4">
              {/* Lecture Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان المحاضرة *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: شرح قانون كيرشوف الأول والثاني وتطبيقات المسائل المعقدة"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              {/* Video Source Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">مصدر الفيديو *</label>
                <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, videoSource: 'HOSTED' })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.videoSource === 'HOSTED'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>رفع فيديو من الجهاز (سحابي)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, videoSource: 'YOUTUBE' })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.videoSource === 'YOUTUBE'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Youtube className="w-4 h-4" />
                    <span>رابط فيديو YouTube</span>
                  </button>
                </div>
              </div>

              {/* Source-specific input */}
              {formData.videoSource === 'HOSTED' ? (
                <div className="space-y-2">
                  <VideoUploader
                    onUploadSuccess={handleVideoUploadSuccess}
                    lectureTitle={formData.title}
                    initialVideoId={formData.videoPlaybackId || undefined}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رابط فيديو YouTube *</label>
                  <input
                    type="url"
                    required={formData.videoSource === 'YOUTUBE'}
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    dir="ltr"
                  />
                </div>
              )}

              {/* Academic Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">المرحلة الدراسية *</label>
                  <select
                    value={formData.academicYear}
                    onChange={(e: any) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  >
                    <option value="GRADE_12">الصف الثالث الثانوي</option>
                    <option value="GRADE_11">الصف الثاني الثانوي</option>
                    <option value="GRADE_10">الصف الأول الثانوي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">المدة التقريبية (بالدقائق)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 45 })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الباب / الفصل *</label>
                  <input
                    type="text"
                    required
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    placeholder="مثال: الباب الثاني - التأثير المغناطيسي للتيار"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">ربط بكورس (اختياري)</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  >
                    <option value="">بدون كورس (محاضرة عامة)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">حالة النشر والظهور</label>
                <select
                  value={formData.status}
                  onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                >
                  <option value="DRAFT">مسودة (DRAFT) - غير مرئية للطلاب</option>
                  <option value="PUBLISHED" disabled={!canPublish}>
                    منشورة (PUBLISHED) {canPublish ? '✅ جاهزة للنشر للطلاب' : '⚠️ (يشترط اكتمال معالجة الفيديو أولاً)'}
                  </option>
                  <option value="ARCHIVED">مؤرشفة (ARCHIVED)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الوصف والملاحظات (اختياري)</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ملاحظات المحاضرة، روابط المذكرات، أو تنبيهات للطلاب..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all hover:scale-[1.02]"
                >
                  {editingLecture ? 'حفظ التعديلات' : 'إنشاء المحاضرة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Video Preview Modal */}
      {previewLecture && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{previewLecture.title}</h3>
                <p className="text-xs text-slate-400">
                  {previewLecture.videoSource === 'HOSTED' ? 'فيديو سحابي مشفر' : 'فيديو YouTube'} •{' '}
                  {previewLecture.durationMinutes} دقيقة • {getGradeLabel(previewLecture.academicYear)}
                </p>
              </div>
              <button
                onClick={() => setPreviewLecture(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <UniversalVideoPlayer lecture={previewLecture} />
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {deletingLecture && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">تأكيد حذف المحاضرة</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                هل أنت متأكد من حذف محاضرة <span className="text-white font-bold">({deletingLecture.title})</span>؟ سيتم
                حذف ملف الفيديو نهائياً وسجلات المحاضرة.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingLecture(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
              >
                تراجع
              </button>
              <button
                onClick={handleDeleteLecture}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl shadow-lg transition disabled:opacity-50"
              >
                {isDeleting ? 'جاري الحذف...' : 'نعم، احذف المحاضرة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
