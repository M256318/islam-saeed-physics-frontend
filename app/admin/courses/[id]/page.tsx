'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CourseService } from '@/services/data.service';
import { Course, CourseVideo, ContentStatus, VideoSource, VideoStatus } from '@/types';
import {
  ArrowRight,
  Plus,
  Trash2,
  Edit,
  Video,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Play,
  Sparkles,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Youtube,
  Cloud,
  FileVideo,
  ImagePlus,
  X,
} from 'lucide-react';
import { LoadingSpinner, EmptyState, AlertBanner } from '@/components/UIState';
import VideoUploader from '@/components/video-upload/VideoUploader';
import { resolveMediaUrl } from '@/lib/media';
import { extractYoutubeVideoId } from '@/lib/youtube';

interface PageProps {
  params: { id: string };
}

export default function CourseDetailPage({ params }: PageProps) {
  const courseId = params.id;
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Video Modals
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<CourseVideo | null>(null);
  const [previewVideo, setPreviewVideo] = useState<CourseVideo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  // Add/Edit Video Form State
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    videoSource: 'YOUTUBE' as VideoSource,
    youtubeUrl: '',
    youtubeVideoId: '',
    videoProvider: 'SIMULATOR',
    videoPlaybackId: '',
    videoUploadId: '',
    videoStatus: 'READY' as VideoStatus,
    videoMetadata: null as any,
    durationMinutes: 45,
    orderIndex: '' as string,
    status: 'PUBLISHED' as ContentStatus,
  });

  const fetchCourseDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await CourseService.getCourseById(courseId);
      if (res.success && res.data) {
        setCourse(res.data);
        if (res.data.videos && Array.isArray(res.data.videos)) {
          setVideos(res.data.videos.sort((a: CourseVideo, b: CourseVideo) => a.orderIndex - b.orderIndex));
        } else {
          // Fetch videos separately if needed
          const videosRes = await CourseService.getCourseVideos(courseId);
          if (videosRes.success && Array.isArray(videosRes.data)) {
            setVideos(videosRes.data.sort((a: CourseVideo, b: CourseVideo) => a.orderIndex - b.orderIndex));
          }
        }
      } else {
        setError('الكورس غير موجود أو تم حذفه');
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل تفاصيل الكورس');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const handleThumbnailSelect = async (file: File) => {
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
      const uploadedUrl = (res.data as any)?.url;
      if (res.success && uploadedUrl) {
        setVideoFormData((prev) => ({ ...prev, thumbnailUrl: uploadedUrl }));
      } else {
        setThumbnailError(res.message || 'فشل في رفع الصورة المصغرة');
      }
    } catch (err: any) {
      setThumbnailError(err.message || 'فشل في رفع الصورة المصغرة');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const openAddVideoModal = () => {
    setEditingVideo(null);
    setVideoFormData({
      title: '',
      description: '',
      thumbnailUrl: '',
      videoSource: 'YOUTUBE',
      youtubeUrl: '',
      youtubeVideoId: '',
      videoProvider: 'SIMULATOR',
      videoPlaybackId: '',
      videoUploadId: '',
      videoStatus: 'READY',
      videoMetadata: null,
      durationMinutes: 45,
      orderIndex: '',
      status: 'PUBLISHED',
    });
    setShowAddVideoModal(true);
  };

  const openEditVideoModal = (v: CourseVideo) => {
    setEditingVideo(v);
    setVideoFormData({
      title: v.title,
      description: v.description || '',
      thumbnailUrl: v.thumbnailUrl || '',
      videoSource: v.videoSource || 'YOUTUBE',
      youtubeUrl: v.youtubeUrl || '',
      youtubeVideoId: v.youtubeVideoId || '',
      videoProvider: v.videoProvider || 'SIMULATOR',
      videoPlaybackId: v.videoPlaybackId || '',
      videoUploadId: v.videoUploadId || '',
      videoStatus: v.videoStatus || 'READY',
      videoMetadata: v.videoMetadata || null,
      durationMinutes: v.durationMinutes || 0,
      orderIndex: v.orderIndex !== undefined && v.orderIndex !== null ? String(v.orderIndex) : '',
      status: v.status || 'DRAFT',
    });
    setShowAddVideoModal(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setActionSuccess(null);

    // Build payload; convert orderIndex only when provided (empty string => append at the end)
    const payload: any = { ...videoFormData };
    if (videoFormData.orderIndex === '') {
      delete payload.orderIndex;
    } else {
      const parsedOrder = Number(videoFormData.orderIndex);
      if (Number.isFinite(parsedOrder) && parsedOrder >= 0) {
        payload.orderIndex = parsedOrder;
      } else {
        delete payload.orderIndex;
      }
    }

    try {
      if (editingVideo) {
        const res = await CourseService.updateCourseVideo(courseId, editingVideo.id, payload);
        if (res.success) {
          setActionSuccess('تم تحديث بيانات الفيديو بنجاح!');
          setShowAddVideoModal(false);
          fetchCourseDetails();
        }
      } else {
        const res = await CourseService.addCourseVideo(courseId, payload);
        if (res.success) {
          setActionSuccess('تم إضافة الفيديو الجديد إلى الكورس بنجاح!');
          setShowAddVideoModal(false);
          fetchCourseDetails();
        }
      }
    } catch (err: any) {
      setError(err.message || 'فشل في حفظ الفيديو');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفيديو من الكورس؟')) return;
    try {
      await CourseService.deleteCourseVideo(courseId, videoId);
      setActionSuccess('تم حذف الفيديو بنجاح.');
      fetchCourseDetails();
    } catch (err: any) {
      setError(err.message || 'فشل في حذف الفيديو');
    }
  };

  const handleToggleVideoStatus = async (video: CourseVideo) => {
    const nextStatus: ContentStatus = video.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await CourseService.updateCourseVideo(courseId, video.id, { status: nextStatus });
      setActionSuccess(nextStatus === 'PUBLISHED' ? 'تم نشر الفيديو بنجاح!' : 'تم تحويل الفيديو إلى مسودة.');
      fetchCourseDetails();
    } catch (err: any) {
      setError(err.message || 'فشل في تحديث حالة الفيديو');
    }
  };

  const handleMoveVideo = async (index: number, direction: 'UP' | 'DOWN') => {
    if ((direction === 'UP' && index === 0) || (direction === 'DOWN' && index === videos.length - 1)) {
      return;
    }

    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    const newVideos = [...videos];
    const temp = newVideos[index];
    newVideos[index] = newVideos[targetIndex];
    newVideos[targetIndex] = temp;

    // Optimistic UI update
    setVideos(newVideos);

    const videoIds = newVideos.map((v) => v.id);
    try {
      await CourseService.reorderCourseVideos(courseId, { videoIds });
      setActionSuccess('تم حفظ الترتيب الجديد للفيديوهات.');
    } catch (err: any) {
      setError(err.message || 'فشل في حفظ ترتيب الفيديوهات');
      fetchCourseDetails();
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="جاري تحميل بيانات الكورس والفيديوهات..." />;
  }

  if (!course) {
    return (
      <EmptyState
        title="الكورس غير موجود"
        description="لم يتم العثور على الكورس المطلوب. ربما تم نقله أو حذفه."
      />
    );
  }

  const isFree = course.isFree || Number(course.price) === 0;

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/admin/courses" className="hover:text-amber-400 flex items-center gap-1">
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة إلى قائمة الكورسات</span>
        </Link>
        <span>/</span>
        <span className="text-white font-bold truncate max-w-xs">{course.title}</span>
      </div>

      {actionSuccess && <AlertBanner type="success" message={actionSuccess} />}
      {error && <AlertBanner type="error" message={error} />}

      {/* Course Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full">
                {course.academicYear === 'GRADE_12'
                  ? 'الصف الثالث الثانوي'
                  : course.academicYear === 'GRADE_11'
                  ? 'الصف الثاني الثانوي'
                  : 'الصف الأول الثانوي'}
              </span>

              {isFree ? (
                <span className="text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  كورس مجاني (Free)
                </span>
              ) : (
                <span className="text-sm font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full">
                  {Number(course.price).toFixed(2)} ج.م (EGP)
                </span>
              )}

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  course.status === 'PUBLISHED'
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : course.status === 'ARCHIVED'
                    ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                    : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                }`}
              >
                {course.status === 'PUBLISHED' ? 'منشور للطلاب' : course.status === 'ARCHIVED' ? 'مؤرشف' : 'مسودة'}
              </span>
            </div>

            <h1 className="text-2xl font-black text-white">{course.title}</h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">{course.description}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={openAddVideoModal}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فيديو للكورس</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي الفيديوهات</span>
            <span className="text-lg font-black text-white">{videos.length} فيديو</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي الدقائق</span>
            <span className="text-lg font-black text-amber-400">
              {videos.reduce((acc, v) => acc + (v.durationMinutes || 0), 0)} دقيقة
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">المواعيد</span>
            <span className="text-xs font-bold text-slate-200 truncate block">{course.schedule}</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">المقاعد المتاحة</span>
            <span className="text-xs font-bold text-slate-200">
              {course.capacity ? `${course.activeBookingsCount || 0} / ${course.capacity}` : 'غير محدد'}
            </span>
          </div>
        </div>
      </div>

      {/* Videos Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-amber-400" />
              <span>فيديوهات الكورس ({videos.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              يمكنك إضافة أي عدد من الفيديوهات وتعديلها ونشرها وإعادة ترتيبها بالسحب أو الأسهم
            </p>
          </div>

          <button
            onClick={openAddVideoModal}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة فيديو</span>
          </button>
        </div>

        {videos.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <FileVideo className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">لا توجد فيديوهات في هذا الكورس بعد</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                ابدأ بإضافة أول فيديو أو محاضرة لهذا الكورس باستخدام يوتيوب أو الرفع المباشر.
              </p>
            </div>
            <button
              onClick={openAddVideoModal}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أول فيديو للكورس</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all group"
              >
                {/* Left side: Order + Details */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {/* Order Index Badge */}
                  <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-black text-amber-400 shrink-0">
                    {index + 1}
                  </div>

                  {/* Thumbnail / Source Icon */}
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 text-slate-400 overflow-hidden relative">
                    {video.thumbnailUrl ? (
                      <img
                        src={resolveMediaUrl(video.thumbnailUrl) || video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : video.videoSource === 'YOUTUBE' ? (
                      <Youtube className="w-6 h-6 text-red-500" />
                    ) : (
                      <Cloud className="w-6 h-6 text-amber-400" />
                    )}
                  </div>

                  {/* Title & Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          video.status === 'PUBLISHED'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {video.status === 'PUBLISHED' ? 'منشور' : 'مسودة'}
                      </span>

                      <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {video.durationMinutes} دقيقة
                      </span>

                      <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {video.videoSource === 'YOUTUBE' ? 'YouTube' : 'استضافة فيديو'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{video.description}</p>
                    )}
                  </div>
                </div>

                {/* Right side: Reorder + Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Reorder Buttons */}
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
                    <button
                      onClick={() => handleMoveVideo(index, 'UP')}
                      disabled={index === 0}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                      title="تحريك لأعلى"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveVideo(index, 'DOWN')}
                      disabled={index === videos.length - 1}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                      title="تحريك لأسفل"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Preview Button */}
                  <button
                    onClick={() => setPreviewVideo(video)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                    title="معاينة وتشغيل الفيديو"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  {/* Toggle Status */}
                  <button
                    onClick={() => handleToggleVideoStatus(video)}
                    className={`p-2 rounded-xl border transition-colors ${
                      video.status === 'PUBLISHED'
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-amber-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}
                    title={video.status === 'PUBLISHED' ? 'تحويل لمسودة' : 'نشر الفيديو'}
                  >
                    {video.status === 'PUBLISHED' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditVideoModal(video)}
                    className="p-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                    title="تعديل بيانات الفيديو"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="p-2 bg-slate-800 border border-slate-700 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                    title="حذف الفيديو من الكورس"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Add / Edit Video */}
      {showAddVideoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">
                {editingVideo ? 'تعديل فيديو الكورس' : 'إضافة فيديو جديد للكورس'}
              </h2>
              <button onClick={() => setShowAddVideoModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان الفيديو *</label>
                <input
                  type="text"
                  required
                  value={videoFormData.title}
                  onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                  placeholder="مثال: المحاضرة 1: مقدمة في تفاضل المتجهات وقوانين نيوتن"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Video Source Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">مصدر الفيديو</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVideoFormData({ ...videoFormData, videoSource: 'YOUTUBE' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      videoFormData.videoSource === 'YOUTUBE'
                        ? 'bg-red-500/10 border-red-500/40 text-red-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Youtube className="w-4 h-4" />
                    <span>رابط YouTube</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoFormData({ ...videoFormData, videoSource: 'HOSTED' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      videoFormData.videoSource === 'HOSTED'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Cloud className="w-4 h-4" />
                    <span>رفع فيديو مستضاف</span>
                  </button>
                </div>
              </div>

              {/* YouTube Input or Video Uploader */}
              {videoFormData.videoSource === 'YOUTUBE' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رابط فيديو YouTube *</label>
                  <input
                    type="url"
                    required
                    value={videoFormData.youtubeUrl}
                    onChange={(e) => setVideoFormData({ ...videoFormData, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">رفع ملف الفيديو</label>
                  <VideoUploader
                    lectureTitle={videoFormData.title || course.title}
                    initialVideoId={videoFormData.videoPlaybackId || undefined}
                    onUploadSuccess={(data) => {
                      setVideoFormData({
                        ...videoFormData,
                        videoPlaybackId: data.videoId,
                        videoUploadId: data.videoUploadId,
                        videoProvider: data.videoProvider,
                        videoStatus: data.videoStatus,
                        videoMetadata: data.videoMetadata,
                        durationMinutes: data.durationMinutes || videoFormData.durationMinutes,
                      });
                      setActionSuccess('تم رفع ومعالجة ملف الفيديو بنجاح!');
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الصورة المصغرة (اختياري)</label>
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    className={`cursor-pointer px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      isUploadingThumbnail
                        ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-wait'
                        : 'bg-slate-950 border-slate-700 text-amber-400 hover:border-amber-500'
                    }`}
                  >
                    <ImagePlus className="w-4 h-4" />
                    <span>{isUploadingThumbnail ? 'جاري رفع الصورة...' : 'اختيار صورة من الكمبيوتر أو الهاتف'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      disabled={isUploadingThumbnail}
                      onChange={(e) => {
                        const selected = e.target.files?.[0];
                        if (selected) handleThumbnailSelect(selected);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  {videoFormData.thumbnailUrl && (
                    <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                      <img
                        src={resolveMediaUrl(videoFormData.thumbnailUrl) || videoFormData.thumbnailUrl}
                        alt="معاينة الصورة المصغرة"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setVideoFormData({ ...videoFormData, thumbnailUrl: '' })}
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
                  value={videoFormData.thumbnailUrl}
                  onChange={(e) => setVideoFormData({ ...videoFormData, thumbnailUrl: e.target.value })}
                  placeholder="أو الصق رابط صورة مباشر (https://...)"
                  className="mt-2 w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />

                {thumbnailError && (
                  <p className="mt-1.5 text-[11px] font-bold text-red-400">{thumbnailError}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">مدة الفيديو (بالدقائق) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={videoFormData.durationMinutes}
                    onChange={(e) => setVideoFormData({ ...videoFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم/ترتيب الفيديو</label>
                  <input
                    type="number"
                    min="0"
                    value={videoFormData.orderIndex}
                    onChange={(e) => setVideoFormData({ ...videoFormData, orderIndex: e.target.value })}
                    placeholder="اتركه فارغًا للإضافة في النهاية"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">حالة الفيديو</label>
                  <select
                    value={videoFormData.status}
                    onChange={(e: any) => setVideoFormData({ ...videoFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PUBLISHED">منشور للطلاب (PUBLISHED)</option>
                    <option value="DRAFT">مسودة (DRAFT)</option>
                    <option value="ARCHIVED">مؤرشف (ARCHIVED)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">وصف الفيديو (اختياري)</label>
                <textarea
                  rows={2}
                  value={videoFormData.description}
                  onChange={(e) => setVideoFormData({ ...videoFormData, description: e.target.value })}
                  placeholder="اكتب النقاط الرئيسية التي تم شرحها في هذه المحاضرة..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white resize-none focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddVideoModal(false)}
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
                  {isSubmitting ? 'جاري الحفظ...' : editingVideo ? 'تحديث الفيديو' : 'إضافة الفيديو للكورس'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white truncate max-w-md">{previewVideo.title}</h3>
              <button onClick={() => setPreviewVideo(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-black rounded-2xl overflow-hidden aspect-video border border-slate-800">
              {previewVideo.videoSource === 'YOUTUBE' ? (
                (() => {
                  const videoId = extractYoutubeVideoId(previewVideo.youtubeVideoId || previewVideo.youtubeUrl);
                  return videoId ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=1`}
                      title={previewVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 p-6 text-center">
                      <p className="text-xs font-bold">لا يتوفر رابط YouTube صالح لمعاينة هذا الفيديو.</p>
                    </div>
                  );
                })()
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
                  <Play className="w-10 h-10 text-amber-400" />
                  <p className="text-xs font-bold text-white">فيديو مستضاف ({previewVideo.videoProvider})</p>
                  <p className="text-[11px] text-slate-500">معرف التشغيل: {previewVideo.videoPlaybackId || 'READY'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
