import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Atom, Phone, Mail, MapPin, Award, CheckCircle2, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-800 p-1 flex items-center justify-center text-white shadow-md border border-slate-700/60 overflow-hidden relative">
                <Image
                  src="/WEB.png"
                  alt="شعار منصة مستر إسلام سعيد"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white block">
                  مستر إسلام سعيد
                </span>
                <span className="text-xs text-primary-400 block font-medium">
                  خبير تدريس الفيزياء للثانوية العامة
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              خبرة أكثر من 10 سنوات في تبسيط مفاهيم الفيزياء لطلاب الثانوية العامة والأزهرية بأساليب مبتكرة تعتمد على الفهم والتطبيق العملي.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 w-fit">
              <Award className="w-4 h-4" />
              <span>معد ومقدم البرامج التعليمية التلفزيونية</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 border-r-2 border-primary-500 pr-2.5">
              روابط سريعة
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-primary-400 transition-colors">
                  الصفحة الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-400 transition-colors">
                  عن مستر إسلام سعيد
                </Link>
              </li>
              <li>
                <Link href="/lectures" className="hover:text-primary-400 transition-colors">
                  المحاضرات والشروحات
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition-colors">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Years */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 border-r-2 border-primary-500 pr-2.5">
              المراحل التعليمية
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-400" />
                <span>الصف الثالث الثانوي (العام والأزهر)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-400" />
                <span>الصف الثاني الثانوي</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-400" />
                <span>الصف الأول الثانوي</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-400" />
                <span>مراجعات ليلة الامتحان والبنك الشامل</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact info */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 border-r-2 border-primary-500 pr-2.5">
              بيانات التواصل
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-primary-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">الدعم الفني والواتساب:</span>
                  <span className="font-mono font-bold text-white" dir="ltr">+20 100 000 0000</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-primary-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">البريد الإلكتروني:</span>
                  <span className="font-mono text-white">contact@islam-saeed-physics.com</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-primary-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">المحافظات المتاحة:</span>
                  <span>محافظة المنيا (مركز سمالوط) – ومتاح أونلاين لكافة المحافظات</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} جميع الحقوق محفوظة لمنصة مستر إسلام سعيد للفيزياء.</p>
          <p className="flex items-center gap-1">
            صُنعت بإتقان لخدمة أبنائنا طلاب الثانوية العامة والأزهرية
          </p>
        </div>
      </div>
    </footer>
  );
}
