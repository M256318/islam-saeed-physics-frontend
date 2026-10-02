'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QuestionService } from '@/services/data.service';
import { Question } from '@/types';
import { 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  Send, 
  Eye, 
  User, 
  Calendar, 
  ImageIcon, 
  Trash2, 
  FileCheck2, 
  UploadCloud,
  Volume2,
  X,
  ExternalLink
} from 'lucide-react';
import { LoadingSpinner, EmptyState, ErrorState, AlertBanner } from '@/components/UIState';
import AudioPlayer from '@/components/AudioPlayer';
import VoiceRecorder from '@/components/VoiceRecorder';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ANSWERED' | 'ALL'>('PENDING');

  // Answer state
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Full-size image modal state
  const [modalImage, setModalImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = activeTab !== 'ALL' ? { status: activeTab } : undefined;
      const res = await QuestionService.getAllQuestions(params);
      if (res.success && Array.isArray(res.data)) {
        setQuestions(res.data);
      } else {
        setQuestions([]);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الأسئلة');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [activeTab]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setActionError('حجم الصورة كبير جدًا. الحد الأقصى المسموح به هو 5 ميجابايت.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setActionError('نوع الصورة غير مدعوم. يرجى رفع ملف من نوع JPG, JPEG, PNG, WEBP.');
      return;
    }

    setActionError(null);
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartAnswering = (questionId: string) => {
    setAnsweringId(questionId);
    setAnswerText('');
    handleRemoveImage();
    setAudioBlob(null);
    setActionError(null);
    setActionSuccess(null);
  };

  const handleCancelAnswering = () => {
    setAnsweringId(null);
    setAnswerText('');
    handleRemoveImage();
    setAudioBlob(null);
    setActionError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAnswerSubmit = async (questionId: string) => {
    const trimmedText = answerText.trim();
    if (!trimmedText && !selectedImage && !audioBlob) {
      setActionError('يرجى كتابة نص الإجابة، أو إرفاق صورة توضيحية، أو تسجيل صوتي');
      return;
    }

    setIsSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const formData = new FormData();
      if (trimmedText) {
        formData.append('answerText', trimmedText);
      }
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      if (audioBlob) {
        // Name audio file with appropriate extension
        const ext = audioBlob.type.includes('ogg')
          ? 'ogg'
          : audioBlob.type.includes('wav')
          ? 'wav'
          : audioBlob.type.includes('mp4')
          ? 'm4a'
          : 'webm';
        formData.append('audio', audioBlob, `voice-reply.${ext}`);
      }

      formData.append('status', 'ANSWERED');

      const res = await QuestionService.answerQuestion(questionId, formData);
      if (res.success) {
        setActionSuccess('تم إرسال إجابتك للطالب بنجاح وتحديث حالة السؤال وإشعاره فوريًا!');
        handleCancelAnswering();
        fetchQuestions();
      }
    } catch (err: any) {
      setActionError(err.message || 'حدث خطأ أثناء إرسال الإجابة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAnyAnswerContent = answerText.trim() || selectedImage || audioBlob;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">إدارة أسئلة ومسائل الطلاب (اسأل المستر)</h1>
        <p className="text-xs text-slate-400 mt-1">
          مراجعة المسائل المرفوعة من قبل الطلاب والرد عبر الشرح الكتابي، الصور التوضيحية، أو التسجيلات الصوتية المباشرة
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PENDING'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          الأسئلة بانتظار الرد (معلقة)
        </button>
        <button
          onClick={() => setActiveTab('ANSWERED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ANSWERED'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          الأسئلة المجاب عليها
        </button>
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          كافة الأسئلة
        </button>
      </div>

      {actionSuccess && <AlertBanner type="success" message={actionSuccess} />}
      {actionError && <AlertBanner type="error" message={actionError} />}

      {isLoading ? (
        <LoadingSpinner text="جاري جلب الأسئلة..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchQuestions} />
      ) : questions.length === 0 ? (
        <EmptyState
          title="لا توجد أي أسئلة في هذا القسم"
          description="جميع أسئلة الطلاب تمت مراجعتها والرد عليها."
        />
      ) : (
        <div className="space-y-5">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4 shadow-sm"
            >
              {/* Question Top Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    ؟
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{q.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{q.chapter}</span>
                      <span>•</span>
                      <span>
                        الطالب: {q.user ? `${q.user.firstName} ${q.user.lastName}` : 'طالب مسجل'}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-500" dir="ltr">{q.user?.phoneNumber}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                    q.status === 'ANSWERED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {q.status === 'ANSWERED' ? 'تمت الإجابة' : 'بانتظار الرد'}
                </span>
              </div>

              {/* Question Text */}
              {q.content && (
                <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800/50">
                  {q.content}
                </div>
              )}

              {/* Attached Student Image */}
              {q.imageUrl && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 block">صورة المسألة المرفوعة من الطالب:</span>
                  <div className="relative inline-block group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.imageUrl}
                      alt="صورة المسألة"
                      onClick={() => setModalImage(q.imageUrl || null)}
                      className="max-h-72 rounded-2xl border border-slate-800 object-contain bg-black cursor-pointer group-hover:opacity-90 transition-opacity"
                    />
                    <button
                      type="button"
                      onClick={() => setModalImage(q.imageUrl || null)}
                      className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/70 hover:bg-black/90 text-white rounded-lg text-[10px] font-bold backdrop-blur-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-3 h-3" />
                      <span>عرض بالحجم الكامل</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Answer or Answer Form */}
              {q.status === 'ANSWERED' && (q.answerText || q.answerImageUrl || q.answerAudioUrl) ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-3">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-bold border-b border-emerald-800/40 pb-2">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>الإجابة المرسلة للطالب (مستر إسلام سعيد):</span>
                    </span>
                    {q.answeredAt && (
                      <span className="font-mono text-[10px] text-emerald-500">
                        {new Date(q.answeredAt).toLocaleString('ar-EG')}
                      </span>
                    )}
                  </div>

                  {/* 1. Answer Text */}
                  {q.answerText && (
                    <p className="text-xs text-emerald-200 whitespace-pre-wrap leading-relaxed">
                      {q.answerText}
                    </p>
                  )}

                  {/* 2. Answer Image */}
                  {q.answerImageUrl && (
                    <div className="pt-2 space-y-1.5">
                      <span className="text-[11px] font-bold text-emerald-300 block">الصورة التوضيحية المرفقة مع الرد:</span>
                      <div className="relative inline-block group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={q.answerImageUrl}
                          alt="صورة الإجابة"
                          onClick={() => setModalImage(q.answerImageUrl || null)}
                          className="max-h-64 rounded-xl border border-emerald-800/60 object-contain bg-black cursor-pointer group-hover:opacity-90 transition-opacity"
                        />
                        <button
                          type="button"
                          onClick={() => setModalImage(q.answerImageUrl || null)}
                          className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 hover:bg-black text-white rounded-lg text-[10px] font-bold backdrop-blur-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                        title="التسجيل الصوتي التوضيحي المرسل للطالب"
                        theme="dark"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-2">
                  {answeringId === q.id ? (
                    <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-amber-500/40">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <label className="text-xs font-bold text-amber-400">
                          إرسال الرد والشرح للطالب (نصي / صورة / تسجيل صوتي):
                        </label>
                        <span className="text-[10px] text-slate-500">
                          يمكنك إرسال أي تركيبة ترغب بها
                        </span>
                      </div>

                      {/* Text Input */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          الشرح والنص المكتوب <span className="text-slate-500 font-normal">(اختياري عند إرفاق صورة أو تسجيل صوتي)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="اكتب خطوات الحل بالتفصيل والقوانين المستخدمة..."
                          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                        />
                      </div>

                      {/* Image Attachment Box */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-300">
                          إرفاق صورة توضيحية من جهازك (JPG, JPEG, PNG, WEBP حتى 5MB):
                        </label>

                        {imagePreview && selectedImage ? (
                          <div className="flex items-center justify-between p-3 bg-slate-900 border border-amber-500/30 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg border border-slate-700 overflow-hidden bg-black shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreview} alt="معاينة" className="w-full h-full object-contain" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-white block truncate max-w-xs">{selectedImage.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{formatFileSize(selectedImage.size)}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="حذف الصورة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-colors"
                            >
                              <ImageIcon className="w-4 h-4 text-amber-400" />
                              <span>اختيار صورة للشرح</span>
                            </button>
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

                      {/* Voice Recorder Box */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-300">
                          التسجيل الصوتي المباشر عبر الميكروفون:
                        </label>
                        <VoiceRecorder
                          onRecordingComplete={(blob) => setAudioBlob(blob)}
                          theme="dark"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={handleCancelAnswering}
                          className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting || !hasAnyAnswerContent}
                          onClick={() => handleAnswerSubmit(q.id)}
                          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-50 transition-all transform hover:scale-105"
                        >
                          {isSubmitting ? (
                            <span>جاري إرسال الرد...</span>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>إرسال الرد للطالب الآن</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartAnswering(q.id)}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>الرد على هذا السؤال (شرح / صورة / صوت)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Full-Size Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl p-2 border border-slate-700 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white">معاينة الصورة بالحجم الكامل</span>
              <button
                type="button"
                onClick={() => setModalImage(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
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
