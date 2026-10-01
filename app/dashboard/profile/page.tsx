'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { User, Phone, Mail, GraduationCap, ShieldCheck, Calendar, CheckCircle2 } from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const getGradeName = (grade: string) => {
    switch (grade) {
      case 'GRADE_10':
        return 'الصف الأول الثانوي';
      case 'GRADE_11':
        return 'الصف الثاني الثانوي';
      case 'GRADE_12':
        return 'الصف الثالث الثانوي (العام والأزهر)';
      default:
        return grade;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">الملف الشخصي للطالب</h1>
        <p className="text-xs text-slate-600 mt-1">
          بيانات حسابك الأكاديمي ورقم الهاتف المسجل بالمنصة
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Avatar & Header */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-700 to-primary-500 text-white flex items-center justify-center font-black text-2xl shadow-lg">
            {user.firstName ? user.firstName[0] : 'S'}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {user.firstName} {user.middleName || ''} {user.lastName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                حساب طالب مفعّل
              </span>
              <span className="text-xs text-slate-500 font-mono" dir="ltr">
                {user.phoneNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-primary-600" />
              المرحلة الدراسية
            </span>
            <p className="font-bold text-sm text-slate-900">{getGradeName(user.academicYear)}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary-600" />
              النوع
            </span>
            <p className="font-bold text-sm text-slate-900">
              {user.gender === 'MALE' ? 'طالب (ذكر)' : 'طالبة (أنثى)'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-primary-600" />
              رقم الهاتف المعتمد
            </span>
            <p className="font-bold text-sm text-slate-900 font-mono" dir="ltr">
              {user.phoneNumber}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-primary-600" />
              البريد الإلكتروني
            </span>
            <p className="font-bold text-sm text-slate-900 font-mono">
              {user.email || 'لم يتم التسجيل'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
