'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, KeyRound, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { AlertBanner } from '@/components/UIState';
import { AuthService } from '@/services/auth.service';

function ForgotPasswordForm() {
  const router = useRouter();

  // Step state: 1 = Request OTP, 2 = Verify OTP & Set New Password, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form fields
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cooldown timer (60 seconds)
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  // Handle Step 1: Send Email OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('يرجى إدخال البريد الإلكتروني المسجل');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthService.forgotPassword(trimmedEmail);
      setSuccessMessage(res.message || 'تم إرسال رمز التحقق إلى بريدك الإلكتروني إذا كان الحساب مسجلاً.');
      setCooldown(60);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'فشل في إرسال رمز التحقق. يرجى التأكد من البريد الإلكتروني والمحاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (cooldown > 0 || isLoading) return;
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await AuthService.forgotPassword(email.trim());
      setSuccessMessage(res.message || 'تم إعادة إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح.');
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'فشل في إعادة إرسال رمز التحقق.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('رمز التحقق يجب أن يتكون من 6 أرقام');
      return;
    }

    if (newPassword.length < 8) {
      setError('كلمة المرور يجب ألا تقل عن 8 أحرف وأرقام');
      return;
    }

    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('يجب أن تحتوي كلمة المرور على أحرف إنجليزية وأرقام');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.resetPassword({
        email: email.trim(),
        otp: cleanOtp,
        newPassword,
        confirmPassword,
      });

      setStep(3);
    } catch (err: any) {
      setError(err.message || 'فشل في إعادة تعيين كلمة المرور. يرجى التأكد من صحة رمز التحقق.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md border border-slate-200/80 group-hover:scale-105 transition-transform overflow-hidden relative">
            <Image
              src="/WEB.png"
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
          استعادة كلمة المرور
        </h2>
        <p className="mt-1.5 text-xs text-slate-600">
          {step === 1 && 'أدخل بريدك الإلكتروني المسجل لاستلام رمز التحقق وإعادة تعيين كلمة المرور'}
          {step === 2 && 'أدخل رمز التحقق المكون من 6 أرقام وكلمة المرور الجديدة'}
          {step === 3 && 'تم إعادة تعيين كلمة المرور بنجاح'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/80 space-y-5">
          {/* Messages */}
          {error && <AlertBanner type="error" message={error} />}
          {successMessage && step !== 3 && <AlertBanner type="success" message={successMessage} />}

          {/* ========================================================================= */}
          {/* STEP 1: EMAIL INPUT */}
          {/* ========================================================================= */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  البريد الإلكتروني المسجل في المنصة
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  سيتم إرسال رمز تحقق مكوّن من 6 أرقام إلى هذا البريد الإلكتروني.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري إرسال الرمز...</span>
                  </span>
                ) : (
                  <>
                    <span>إرسال رمز التحقق</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: OTP + NEW PASSWORD */}
          {/* ========================================================================= */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700 truncate max-w-[240px]">
                  <Mail className="w-4 h-4 text-primary-600 flex-shrink-0" />
                  <span className="truncate">البريد: <strong className="font-mono text-slate-900">{email}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError(null);
                  }}
                  className="text-primary-600 hover:text-primary-700 font-bold text-[11px] hover:underline flex-shrink-0"
                >
                  تغيير البريد
                </button>
              </div>

              {/* 6-Digit OTP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رمز التحقق (6 أرقام)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-mono tracking-widest text-center text-sm"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="8 أحرف وأرقام إنجليزية على الأقل"
                    className="w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  تأكيد كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    className="w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري تغيير كلمة المرور...</span>
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>تغيير كلمة المرور وتأكيد الحساب</span>
                  </>
                )}
              </button>

              {/* Resend OTP Cooldown */}
              <div className="text-center pt-2">
                {cooldown > 0 ? (
                  <p className="text-xs text-slate-500">
                    يمكنك طلب رمز جديد بعد <span className="font-bold text-primary-600 font-mono">{cooldown}</span> ثانية
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline transition inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة إرسال رمز التحقق</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: SUCCESS CONFIRMATION */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900">
                  تم تغيير كلمة المرور بنجاح!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  تم تحديث كلمة المرور لحسابك وإبطال الجلسات السابقة بأمان. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
                </p>
              </div>

              <div className="pt-3">
                <Link
                  href="/auth/login"
                  className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>الانتقال لتسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          {step !== 3 && (
            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                href="/auth/login"
                className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 transition"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة إلى تسجيل الدخول</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">جاري التحميل...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
