'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Atom, CheckCircle2, AlertCircle, Clock, RefreshCw, ArrowLeft, Mail } from 'lucide-react';
import { apiClient } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'used' | 'invalid'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setErrorMessage('لم يتم العثور على رمز تأكيد في الرابط.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await apiClient('/auth/verify-email', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });

        if (response.success) {
          setStatus('success');
        } else {
          handleFailure(response.message || '');
        }
      } catch (err: any) {
        handleFailure(err.message || '');
      }
    };

    const handleFailure = (msg: string) => {
      if (msg.includes('انتهت صلاحية') || msg.includes('expired')) {
        setStatus('expired');
      } else if (msg.includes('مسبقاً') || msg.includes('used') || msg.includes('مفعل')) {
        setStatus('used');
      } else {
        setStatus('invalid');
      }
      setErrorMessage(msg || 'فشل في تأكيد البريد الإلكتروني');
    };

    verifyToken();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setIsResending(true);
    setResendSuccess(null);
    setResendError(null);

    try {
      const res = await apiClient('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: resendEmail.trim() }),
      });
      setResendSuccess(res.message || 'تم إرسال رابط تأكيد جديد إلى بريدك الإلكتروني');
    } catch (err: any) {
      setResendError(err.message || 'فشل في إعادة الإرسال، يرجى المحاولة لاحقاً');
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
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/80 text-center">
          {/* 1. LOADING STATE */}
          {status === 'loading' && (
            <div className="py-8 space-y-4">
              <div className="w-14 h-14 mx-auto border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              <h2 className="text-xl font-black text-slate-900">جاري التحقق من بريدك الإلكتروني...</h2>
              <p className="text-xs text-slate-600">لحظات وسنقوم بتفعيل حسابك</p>
            </div>
          )}

          {/* 2. SUCCESS STATE */}
          {status === 'success' && (
            <div className="py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">تم تأكيد البريد بنجاح! 🎉</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                أهلاً بك في منصة مستر إسلام سعيد للفيزياء. تم تفعيل حسابك بنجاح ويمكنك الآن تسجيل الدخول والاستفادة من كافة الدروس.
              </p>
              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all inline-flex items-center justify-center gap-2"
                >
                  <span>تسجيل الدخول إلى حسابك</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* 3. ALREADY USED STATE */}
          {status === 'used' && (
            <div className="py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-black text-slate-900">الحساب مفعل بالفعل ℹ️</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                تم استخدام رابط التأكيد هذا مسبقاً وبريدك الإلكتروني مفعل. يمكنك تسجيل الدخول مباشرة.
              </p>
              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all inline-flex items-center justify-center gap-2"
                >
                  <span>الانتقال لتسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* 4. EXPIRED STATE */}
          {status === 'expired' && (
            <div className="py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-black text-slate-900">انتهت صلاحية الرابط ⏳</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                رابط التأكيد صالح لمدة 30 دقيقة فقط وقد انتهت صلاحيته. يمكنك طلب رابط تأكيد جديد بإدخال بريدك أدناه:
              </p>

              <form onSubmit={handleResend} className="pt-2 space-y-3">
                {resendSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-medium">
                    {resendSuccess}
                  </div>
                )}
                {resendError && (
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium">
                    {resendError}
                  </div>
                )}
                <div className="relative text-right">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني"
                    className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isResending ? (
                    <span>جاري الإرسال...</span>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>إرسال رابط تأكيد جديد</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* 5. INVALID STATE */}
          {status === 'invalid' && (
            <div className="py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-black text-slate-900">رابط غير صالح ⚠️</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {errorMessage || 'الرابط الذي تحاول استخدامه غير صحيح أو تالف.'}
              </p>
              <div className="pt-4 space-y-2">
                <Link
                  href="/auth/register"
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all block"
                >
                  الرجوع لصفحة التسجيل
                </Link>
                <Link
                  href="/auth/login"
                  className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl transition-all block"
                >
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

