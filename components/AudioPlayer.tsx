'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title?: string;
  theme?: 'dark' | 'light';
}

export default function AudioPlayer({
  src,
  title = 'تسجيل صوتي توضيحي',
  theme = 'light',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Audio playback error:', err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds === 0) return '0:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
        isDark
          ? 'bg-slate-950/80 border-amber-500/30 text-white shadow-inner'
          : 'bg-emerald-50/90 border-emerald-300 text-slate-900 shadow-sm'
      }`}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex flex-col gap-2.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold flex items-center gap-1.5 ${
              isDark ? 'text-amber-400' : 'text-emerald-950'
            }`}
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            <span>{title}</span>
          </span>
          <span
            className={`text-[11px] font-mono font-medium ${
              isDark ? 'text-slate-400' : 'text-emerald-800'
            }`}
            dir="ltr"
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Player Controls & Progress Slider */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-md transition-all transform active:scale-95 ${
              isDark
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          {/* Progress Bar */}
          <div className="flex-1 flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none ${
                isDark
                  ? 'bg-slate-800 accent-amber-500'
                  : 'bg-emerald-200 accent-emerald-600'
              }`}
            />
          </div>

          {/* Restart & Mute Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRestart}
              title="إعادة من البداية"
              className={`p-2 rounded-xl transition-colors ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  : 'hover:bg-emerald-200/60 text-emerald-800 hover:text-emerald-950'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
              className={`p-2 rounded-xl transition-colors ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  : 'hover:bg-emerald-200/60 text-emerald-800 hover:text-emerald-950'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
