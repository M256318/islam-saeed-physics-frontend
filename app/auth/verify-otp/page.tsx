'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useSearchParams } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { Atom, KeyRound, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AlertBanner } from '@/components/UIState';

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const phoneFromQuery = searchParams?.get('phone') || '';

  const [phoneNumber, setPhoneNumber] = useState(phoneFromQuery);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  const { verifyPhone } = useAuth();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (otp.length !== 6) {
      setError('رمز التحقق يجب أن يتكون من 6 أرقام');
      return;
    }

    setIsLoading(true);
    try {
      await verifyPhone(phoneNumber, otp);
    } catch (err: any) {
      setError(err.message || 'رمز التحقق غير صحيح أو انتهت صلاحيته');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    setError(null);
    try {
      const res = await AuthService.resendOtp(phoneNumber, 'PHONE_VERIFICATION');
      if (res.success) {
        setSuccessMessage('تم إرسال كود تحقق جديد إلى هاتفك بنجاح.');
        setCountdown(60);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في إعادة إرسال الكود');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md border border-slate-200/80 group-hover:scale-105 transition-transform overflow-hidden relative">
            <Image
              src="/logo.png"
              alt="شعار منصة مستر إسلام سعيد للفيزياء"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="font-extrabold text-xl text-slate-900">
            مستر إسلام سعيد
          </span>
        </Link>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          تفعيل حساب الطالب
        </h2>
        <p className="mt-1.5 text-xs text-slate-600">
          تم إرسال رمز تحقق مكون من 6 أرقام إلى هاتفك عبر رسالة SMS
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/80 space-y-5">
          {error && <AlertBanner type="error" message={error} />}
          {successMessage && <AlertBanner type="success" message={successMessage} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الهاتف</label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="010XXXXXXXX"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">رمز التحقق (OTP) *</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono tracking-widest font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>جاري التحقق والتفعيل...</span>
              ) : (
                <>
                  <span>تفعيل الحساب الآن</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">لم يصلك الرمز؟</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || isResending}
              className={`font-bold transition-colors ${
                countdown > 0
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-primary-600 hover:text-primary-700'
              }`}
            >
              {countdown > 0 ? `إعادة الإرسال بعد (${countdown}s)` : 'إعادة إرسال الكود'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">جاري التحميل...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
