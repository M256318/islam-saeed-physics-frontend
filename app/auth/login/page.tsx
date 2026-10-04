'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useSearchParams } from 'next/navigation';
import { Atom, Phone, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { AlertBanner } from '@/components/UIState';

function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const searchParams = useSearchParams();
  const verified = searchParams?.get('verified');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ phoneNumber, password });
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
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
          تسجيل الدخول إلى المنصة
        </h2>
        <p className="mt-1.5 text-xs text-slate-600">
          أدخل رقم هاتفك وكلمة المرور للوصول إلى لوحة الطالب والمحاضرات
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/80 space-y-5">
          {verified && (
            <AlertBanner
              type="success"
              message="تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول."
            />
          )}

          {error && <AlertBanner type="error" message={error} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم الهاتف المصري أو البريد الإلكتروني
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="مثال: 01012345678"
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">كلمة المرور</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] font-bold text-primary-600 hover:text-primary-700 hover:underline transition"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>جاري تسجيل الدخول...</span>
              ) : (
                <>
                  <span>دخول إلى حسابي</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-600">
              ليس لديك حساب بعد؟{' '}
              <Link
                href="/auth/register"
                className="font-bold text-primary-600 hover:text-primary-700 hover:underline"
              >
                إنشاء حساب طالب جديد
              </Link>
            </p>
            <p className="text-xs text-slate-500">
              أنت مدرس فيزياء وترغب في الانضمام لفريق الإشراف؟{' '}
              <Link
                href="/admin/apply"
                className="font-bold text-primary-600 hover:text-primary-700 hover:underline"
              >
                قدّم طلب إشراف
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">جاري التحميل...</div>}>
      <LoginForm />
    </Suspense>
  );
}

