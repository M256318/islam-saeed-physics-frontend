'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob | null) => void;
  maxDurationSeconds?: number;
  theme?: 'dark' | 'light';
}

export default function VoiceRecorder({
  onRecordingComplete,
  maxDurationSeconds = 300, // 5 minutes max
  theme = 'dark',
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isDark = theme === 'dark';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('متصفحك الحالي لا يدعم التسجيل الصوتي المباشر');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Determine best supported audio mime type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        } else {
          mimeType = ''; // Let browser use default
        }
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);

        // Stop all tracks to release microphone hardware
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      recorder.start(250); // Slice every 250ms
      setIsRecording(true);
      setRecordingDuration(0);

      // Duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev + 1 >= maxDurationSeconds) {
            stopRecording();
            return maxDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('تم رفض الإذن للوصول إلى الميكروفون. يرجى السماح بصلاحية الميكروفون من إعدادات المتصفح.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('لم يتم العثور على ميكروفون متصل بجهازك.');
      } else if (err.name === 'NotReadableError') {
        setErrorMessage('الميكروفون مستخدم حاليًا بواسطة تطبيق آخر.');
      } else {
        setErrorMessage(err.message || 'فشل في تشغيل الميكروفون والتسجيل الصوتي.');
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingDuration(0);
    setErrorMessage(null);
  };

  const removeAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingDuration(0);
    onRecordingComplete(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-3">
      {/* Error message */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* State 1: Active Recording */}
      {isRecording && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse ${
            isDark
              ? 'bg-red-950/40 border-red-500/40 text-red-200'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
            <div>
              <span className="font-bold text-xs block">جاري تسجيل الصوت عبر الميكروفون...</span>
              <span className="text-[11px] font-mono text-red-400 font-bold" dir="ltr">
                {formatDuration(recordingDuration)} / {formatDuration(maxDurationSeconds)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              إلغاء التسجيل
            </button>
            <button
              type="button"
              onClick={stopRecording}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>إنهاء وحفظ التسجيل</span>
            </button>
          </div>
        </div>
      )}

      {/* State 2: Recorded Audio Preview */}
      {!isRecording && audioUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold flex items-center gap-1.5 ${
                isDark ? 'text-amber-400' : 'text-emerald-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم تسجيل الصوت بنجاح (جاهز للإرسال):</span>
            </span>
            <button
              type="button"
              onClick={removeAudio}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف التسجيل</span>
            </button>
          </div>

          <AudioPlayer src={audioUrl} title="معاينة التسجيل الصوتي قبل الإرسال" theme={theme} />
        </div>
      )}

      {/* State 3: Ready to Record Button */}
      {!isRecording && !audioUrl && (
        <button
          type="button"
          onClick={startRecording}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            isDark
              ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white hover:border-amber-500/40'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
        >
          <Mic className="w-4 h-4 text-amber-500" />
          <span>تسجيل صوتي من الميكروفون</span>
        </button>
      )}
    </div>
  );
}
