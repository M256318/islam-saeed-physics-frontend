'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Atom, Phone, Lock, User as UserIcon, ArrowLeft, Mail, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { AlertBanner } from '@/components/UIState';
import { apiClient } from '@/lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    academicYear: 'GRADE_12' as 'GRADE_10' | 'GRADE_11' | 'GRADE_12',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Resend state
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic client validation
    if (!formData.email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تتكون من 8 أحرف وأرقام على الأقل');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          middleName: formData.middleName ? formData.middleName.trim() : undefined,
          lastName: formData.lastName.trim(),
          gender: formData.gender,
          academicYear: formData.academicYear,
          phoneNumber: formData.phoneNumber.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      if (response.success) {
        setIsRegistered(true);
        setRegisteredEmail(formData.email.toLowerCase().trim());
        setCooldown(60);
      } else {
        setError(response.message || 'فشل في إنشاء الحساب');
      }
    } catch (err: any) {
      setError(err.message || 'فشل في إنشاء الحساب، يرجى مراجعة البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setResendSuccess(null);
    setResendError(null);

    try {
      const res = await apiClient('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: registeredEmail }),
      });
      setResendSuccess(res.message || 'تم إرسال رابط تأكيد جديد إلى بريدك الإلكتروني');
      setCooldown(60);
    } catch (err: any) {
      setResendError(err.message || 'فشل في إعادة إرسال الرابط');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
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
          إنشاء حساب طالب جديد
        </h2>
        <p className="mt-1.5 text-xs text-slate-600">
          انضم إلى منصة مستر إسلام سعيد للفيزياء واستفد من جميع الدروس والشروحات
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/80 space-y-5">
          {/* SUCCESS STATE */}
          {isRegistered ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Mail className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                تم إنشاء حسابك بنجاح! 📧
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                أرسلنا رابط تأكيد الحساب إلى بريدك الإلكتروني: <br />
                <strong className="text-slate-900 text-sm dir-ltr font-mono">{registeredEmail}</strong>
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 text-right space-y-2">
                <p>📌 <strong>الخطوات التالية:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>افتح صندوق الوارد في بريدك الإلكتروني.</li>
                  <li>اضغط على زر <strong>"تأكيد البريد الإلكتروني"</strong> في الرسالة.</li>
                  <li>بعد التأكيد، ستتمكن من تسجيل الدخول مباشرة إلى حسابك.</li>
                </ol>
              </div>

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

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || isResending}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  {cooldown > 0 ? (
                    <span>إعادة إرسال الرابط خلال ({cooldown} ثانية)</span>
                  ) : (
                    <span>لم يصلك البريد؟ إعادة إرسال رابط التأكيد</span>
                  )}
                </button>

                <Link
                  href="/auth/login"
                  className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all inline-flex items-center justify-center gap-2"
                >
                  <span>الانتقال لصفحة تسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && <AlertBanner type="error" message={error} />}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Names (3-part) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الأول *</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="مثال: أحمد"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم الأب</label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      placeholder="مثال: محمد"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم العائلة *</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="مثال: علي"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Academic Year & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المرحلة الدراسية *</label>
                    <select
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    >
                      <option value="GRADE_12">الصف الثالث الثانوي (العام والأزهر)</option>
                      <option value="GRADE_11">الصف الثاني الثانوي</option>
                      <option value="GRADE_10">الصف الأول الثانوي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">النوع *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    >
                      <option value="MALE">طالب (ذكر)</option>
                      <option value="FEMALE">طالبة (أنثى)</option>
                    </select>
                  </div>
                </div>

                {/* Email (Required) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البريد الإلكتروني * (يُرسل إليه رابط التفعيل)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="student@example.com"
                      className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف المصري *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      required
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="010XXXXXXXX أو 011XXXXXXXX أو 012XXXXXXXX"
                      className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="8 أحرف وأرقام على الأقل"
                        className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تأكيد كلمة المرور *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="أعد إدخال كلمة المرور"
                        className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <span>جاري إنشاء الحساب وإرسال رابط التفعيل...</span>
                  ) : (
                    <>
                      <span>إنشاء الحساب وتأكيد البريد</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  لديك حساب بالفعل؟{' '}
                  <Link
                    href="/auth/login"
                    className="font-bold text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    تسجيل الدخول
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

