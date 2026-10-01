'use client';

import React, { useState, useEffect } from 'react';
import { Lecture } from '@/types';
import { LectureService } from '@/services/data.service';
import { Loader2, AlertCircle, Play, ShieldAlert } from 'lucide-react';

interface UniversalVideoPlayerProps {
  lecture: Lecture;
}

export default function UniversalVideoPlayer({ lecture }: UniversalVideoPlayerProps) {
  const [playbackData, setPlaybackData] = useState<{
    videoSource: 'YOUTUBE' | 'HOSTED';
    youtubeVideoId?: string;
    playbackUrl?: string;
    thumbnailUrl?: string;
    token?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lecture?.id) return;

    if (lecture.videoSource === 'YOUTUBE' || !lecture.videoSource) {
      setPlaybackData({
        videoSource: 'YOUTUBE',
        youtubeVideoId: lecture.youtubeVideoId || undefined,
      });
      setIsLoading(false);
      return;
    }

    // Hosted video -> fetch playback token & URL
    setIsLoading(true);
    setError(null);

    LectureService.getPlaybackToken(lecture.id)
      .then((res) => {
        if (res.success && res.data) {
          setPlaybackData(res.data);
        } else {
          setError(res.message || 'فشل في استخراج تصريح تشغيل الفيديو');
        }
      })
      .catch((err) => {
        setError(err.message || 'فشل في تشغيل المحاضرة');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [lecture?.id, lecture?.videoSource, lecture?.youtubeVideoId]);

  if (isLoading) {
    return (
      <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl aspect-video relative border border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-xs font-bold">جاري تجهيز مشغل الفيديو والتشفير الآمن...</p>
      </div>
    );
  }

  if (error || !playbackData) {
    return (
      <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl aspect-video relative border border-slate-800 flex flex-col items-center justify-center p-6 text-center text-red-400 gap-2">
        <ShieldAlert className="w-8 h-8 text-red-400 mb-1" />
        <p className="text-sm font-bold">{error || 'الفيديو غير متوفر حاليًا'}</p>
        <p className="text-xs text-slate-400 max-w-md">
          إذا كانت المحاضرة قيد المعالجة، يرجى الانتظار قليلاً وإعادة تحديث الصفحة.
        </p>
      </div>
    );
  }

  // 1. YouTube Mode
  if (playbackData.videoSource === 'YOUTUBE') {
    return (
      <div className="bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative border border-slate-800">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${playbackData.youtubeVideoId || lecture.youtubeVideoId}?rel=0&modestbranding=1`}
          title={lecture.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // 2. Hosted Cloud Stream Video Player (with secure download prevention)
  return (
    <div className="bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative border border-slate-800 group">
      <video
        src={playbackData.playbackUrl}
        poster={playbackData.thumbnailUrl || lecture.thumbnailUrl || undefined}
        controls
        controlsList="nodownload"
        playsInline
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full object-contain focus:outline-none"
      >
        <source src={playbackData.playbackUrl} type="video/mp4" />
        متصفحك لا يدعم تشغيل هذا الفيديو مباشرة.
      </video>
    </div>
  );
}
