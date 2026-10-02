'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { QuestionService } from '@/services/data.service';
import { Question } from '@/types';
import { 
  HelpCircle, 
  Image as ImageIcon, 
  X, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Trash2,
  FileCheck2,
  UploadCloud
} from 'lucide-react';
import { LoadingSpinner, AlertBanner, EmptyState, ErrorState } from '@/components/UIState';
import AudioPlayer from '@/components/AudioPlayer';

export default function StudentQuestionsPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [chapter, setChapter] = useState('الباب الأول: التيار الكهربي وقانون أوم');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await QuestionService.getMyQuestions();
      if (res.success && Array.isArray(res.data)) {
        setQuestions(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الأسئلة');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة كبير جدًا. الحد الأقصى المسموح به هو 5 ميجابايت.');
      return;
    }

    // Validate type (JPG, JPEG, PNG, WEBP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('نوع الملف غير مدعوم. يرجى رفع صورة صالحة بصيغة JPG أو PNG أو WEBP.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const pendingCount = questions.filter((q) => q.status === 'PENDING').length;
    if (pendingCount >= 2) {
      setError('لا يمكنك إرسال سؤال جديد؛ لديك بالفعل سؤالان معلقان لم يتم الرد عليهما بعد.');
      return;
    }

    if (!content.trim() && !selectedFile) {
      setError('يرجى كتابة تفاصيل السؤال أو اختيار صورة المسألة من جهازك.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim() || 'مرفق صورة المسألة مع السؤال');
    formData.append('chapter', chapter);
    formData.append('academicYear', user?.academicYear || 'GRADE_12');
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      const res = await QuestionService.askQuestion(formData);
      if (res.success) {
        setSuccess('تم إرسال سؤالك إلى مستر إسلام سعيد بنجاح! سيتم إشعارك فور الرد.');
        setTitle('');
        setContent('');
        handleRemoveImage();
        fetchQuestions();
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال السؤال');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingQuestionsCount = questions.filter((q) => q.status === 'PENDING').length;
  const isLimitReached = pendingQuestionsCount >= 2;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">اسأل مستر إسلام سعيد</h1>
        <p className="text-xs text-slate-600 mt-1">
          واجهتك مسألة أو استفسار فيزيائي؟ اكتب سؤالك أو ارفع صورة المسألة من جهازك وسيقوم المستر بالرد والشرح.
        </p>
      </div>

      {/* 2-Question Limit Banner */}
      <div
        className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 ${
          isLimitReached
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-primary-50 border-primary-200 text-primary-900'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <AlertCircle className={`w-5 h-5 shrink-0 ${isLimitReached ? 'text-amber-600' : 'text-primary-600'}`} />
          <div>
            <span className="font-bold block">
              نظام الأسئلة العادلة (الحد الأقصى: سؤالان قيد الانتظار)
            </span>
            <span className="text-[11px] opacity-80">
              الأسئلة المعلقة الحالية لديك:{' '}
              <strong className="font-bold">{pendingQuestionsCount} / 2</strong>
            </span>
          </div>
        </div>

        {isLimitReached && (
          <span className="px-2.5 py-1 bg-amber-200/80 text-amber-950 font-bold rounded-lg text-[10px] shrink-0">
            تم استنفاد الحد مؤقتًا
          </span>
        )}
      </div>

      {/* Action alerts */}
      {error && <AlertBanner type="error" message={error} />}
      {success && <AlertBanner type="success" message={success} />}

      {/* Question Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-900 border-r-2 border-primary-600 pr-2.5">
          طرح مسألة أو سؤال جديد
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان السؤال أو رقم المسألة *</label>
              <input
                type="text"
                required
                disabled={isLimitReached}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: استفسار حول توصيل المقاومات وقانون كيرشوف"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">الباب / الفصل *</label>
              <select
                disabled={isLimitReached}
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-50"
              >
                <option value="الباب الأول: التيار الكهربي وقانون أوم">الباب الأول: التيار الكهربي وقانون أوم</option>
                <option value="الباب الثاني: التأثير المغناطيسي للتيار الكهربي">الباب الثاني: التأثير المغناطيسي للتيار الكهربي</option>
                <option value="الباب الثالث: الحث الكهرومغناطيسي">الباب الثالث: الحث الكهرومغناطيسي</option>
                <option value="الباب الرابع: دوائر التيار المتردد">الباب الرابع: دوائر التيار المتردد</option>
                <option value="الفيزياء الحديثة: ازدواجية الموجة والجسيم">الفيزياء الحديثة: ازدواجية الموجة والجسيم</option>
                <option value="الفيزياء الحديثة: الأطياف الذرية والليزر">الفيزياء الحديثة: الأطياف الذرية والليزر</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              تفاصيل المسألة أو السؤال <span className="text-slate-400 font-normal">(اختياري عند إرفاق صورة)</span>
            </label>
            <textarea
              rows={4}
              disabled={isLimitReached}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب أين توقفت في الحل وما النقطة غير المفهومة..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Image Upload Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              صورة المسألة أو الرسم البياني (JPG, JPEG, PNG, WEBP حتى 5MB)
            </label>

            {imagePreview && selectedFile ? (
              <div className="relative border border-primary-200 rounded-2xl p-4 bg-primary-50/40 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="معاينة المسألة" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <FileCheck2 className="w-4 h-4 text-emerald-600" />
                        <span className="truncate max-w-[220px] sm:max-w-xs">{selectedFile.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                        الحجم: {formatFileSize(selectedFile.size)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إزالة الصورة</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !isLimitReached && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50 hover:border-primary-400 transition-all ${
                  isLimitReached ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <UploadCloud className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">اضغط هنا لاختيار صورة المسألة من جهازك</p>
                <p className="text-[11px] text-slate-400 mt-1">يدعم JPG, JPEG, PNG, WEBP (الحد الأقصى 5 ميجابايت)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLimitReached}
            className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>جاري إرسال السؤال...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>إرسال السؤال للمستر</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Questions History List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">سجل أسئلتك وإجابات المستر</h2>

        {isLoading ? (
          <LoadingSpinner text="جاري تحميل سجل الأسئلة..." />
        ) : questions.length === 0 ? (
          <EmptyState
            title="لم تقم بطرح أي سؤال بعد"
            description="جميع أسئلتك التي تطرحها ستظهر هنا مع إجابات مستر إسلام سعيد المباشرة."
          />
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{q.title}</span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-medium">
                      {q.chapter}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      q.status === 'ANSWERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {q.status === 'ANSWERED' ? 'تمت الإجابة' : 'قيد انتظار رد المستر'}
                  </span>
                </div>

                {q.content && (
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{q.content}</p>
                )}

                {/* Question Image if uploaded */}
                {q.imageUrl && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1.5">صورة المسألة المرفقة:</span>
                    <div className="relative inline-block group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={q.imageUrl}
                        alt="صورة السؤال"
                        onClick={() => setModalImage(q.imageUrl || null)}
                        className="max-h-64 rounded-xl border border-slate-200 object-contain bg-slate-50 cursor-pointer group-hover:opacity-90 transition-opacity"
                      />
                      <button
                        type="button"
                        onClick={() => setModalImage(q.imageUrl || null)}
                        className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/70 hover:bg-black/90 text-white rounded-lg text-[10px] font-bold backdrop-blur-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="w-3 h-3" />
                        <span>عرض بالحجم الكامل</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Teacher Answer Box */}
                {q.status === 'ANSWERED' && (q.answerText || q.answerImageUrl || q.answerAudioUrl) ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                      <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>إجابة وتوضيح مستر إسلام سعيد:</span>
                      </span>
                      {q.answeredAt && (
                        <span className="text-[10px] text-emerald-700 font-mono">
                          {new Date(q.answeredAt).toLocaleString('ar-EG')}
                        </span>
                      )}
                    </div>

                    {/* 1. Answer Text */}
                    {q.answerText && (
                      <p className="text-xs text-emerald-900 leading-relaxed whitespace-pre-wrap font-medium">
                        {q.answerText}
                      </p>
                    )}

                    {/* 2. Answer Image */}
                    {q.answerImageUrl && (
                      <div className="pt-2 space-y-1">
                        <span className="text-[11px] font-bold text-emerald-900 block">الصورة المرفقة مع الإجابة:</span>
                        <div className="relative inline-block group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={q.answerImageUrl}
                            alt="صورة إجابة المستر"
                            onClick={() => setModalImage(q.answerImageUrl || null)}
                            className="max-h-64 rounded-xl border border-emerald-300 object-contain bg-white cursor-pointer group-hover:opacity-90 transition-opacity"
                          />
                          <button
                            type="button"
                            onClick={() => setModalImage(q.answerImageUrl || null)}
                            className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/70 hover:bg-black/90 text-white rounded-lg text-[10px] font-bold backdrop-blur-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="w-3 h-3" />
                            <span>تكبير الصورة</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 3. Answer Audio */}
                    {q.answerAudioUrl && (
                      <div className="pt-2">
                        <AudioPlayer
                          src={q.answerAudioUrl}
                          title="تسجيل صوتي من مستر إسلام سعيد"
                          theme="light"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>سؤالك قيد المراجعة حاليًا من قبل مستر إسلام سعيد وسيتم إشعارك فور كتابة الشرح أو إرسال التسجيل الصوتي.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full-Size Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-2 border border-slate-200 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">معاينة الصورة بالحجم الكامل</span>
              <button
                type="button"
                onClick={() => setModalImage(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center overflow-auto max-h-[80vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={modalImage}
                alt="معاينة الصورة"
                className="max-h-[75vh] w-auto rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
