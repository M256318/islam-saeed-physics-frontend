'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminService } from '@/services/admin.service';
import {
  ShieldCheck,
  UserCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Phone,
  Mail,
  User as UserIcon,
  FileText,
  Sparkles,
} from 'lucide-react';

export default function AdminApplyPage() {
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await AdminService.applyForAdmin(form);
      if (res.success) {
        setIsSubmitted(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل في إرسال طلب الانضمام، يرجى المحاولة لاحقًا');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-cairo" dir="rtl">
      <div className="max-w-xl w-full mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold mx-auto shadow-xl shadow-amber-500/20">
            <UserCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            طلب الانضمام لفريق إشراف منصة الفيزياء
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            انضم إلى فريق عمل مستر إسلام سعيد للمساعدة في إدارة المجموعات، متابعة الطلاب، والرد على الاستفسارات الفيزيائية.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {isSubmitted ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">تم استلام طلبك بنجاح!</h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                  طلبك الآن قيد المراجعة المباشرة من قِبل <strong className="text-amber-400">مستر إسلام سعيد</strong>. سيتم مراجعة بياناتك والتواصل معك هاتفيًا أو عبر البريد الإلكتروني لتفعيل حسابك وتحديد صلاحياتك.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة للصفحة الرئيسية</span>
                </Link>

                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-amber-500/20"
                >
                  <span>تسجيل الدخول</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  الاسم الرباعي الكامل <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="مثال: أحمد محمد علي حسن"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  رقم الهاتف المحمول (المصري) <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    placeholder="01012345678"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  البريد الإلكتروني <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="example@domain.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Notes / Qualifications */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  المؤهل الدراسي والخبرات وسبب الرغبة في الانضمام
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="اكتب نبذة عن مؤهلك (مثل: خريج كلية علوم/تربية فيزياء) وخبرتك في التدريس أو إدارة المجموعات..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <span>جاري إرسال الطلب...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال طلب الانضمام للإدارة</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  العودة للصفحة الرئيسية
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
