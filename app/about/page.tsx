import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Award, BookOpen, GraduationCap, CheckCircle2, Star, Atom } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="pt-28 pb-16 flex-1">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                السيرة الذاتية والخبرات
              </span>
              <h1 className="text-3xl sm:text-5xl font-black">مستر إسلام سعيد</h1>
              <p className="text-primary-200 text-base sm:text-lg leading-relaxed">
                خبير وموجه أول مادة الفيزياء، ومعد البرامج التعليمية بقنوات النيل التعليمية، ومؤلف أقوى سلاسل الشرح وبنوك الأسئلة لمرحلة الثانوية العامة.
              </p>
            </div>
          </div>

          {/* Bio Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
            {/* Main Story */}
            <div className="lg:col-span-2 space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 border-r-4 border-primary-600 pr-3">
                  رحلة أكثر من 6 سنوات في خدمة طلاب مصر
                </h2>
                <p className="text-sm text-slate-600 leading-loose">
                  بدأت مسيرة مستر إسلام سعيد منذ أكثر من 6 سنوات بهدف واحد وواضح: تحويل مادة الفيزياء من مصدر خوف وتعقيد لطلاب الثانوية إلى مادة ممتعة، مفهومة، ومضمونة في الدرجات. اعتمدت طريقته دائمًا على ربط القوانين النظرية بالتطبيقات الحياتية والتجارب المعملية الحية.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">فلسفة التدريس المعتمدة:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">الفهم والاستنتاج أولاً</h4>
                      <p className="text-xs text-slate-500 mt-1">تفكيك كل قانون ومعرفة من أين جاء قبل حفظه وتطبيقه.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">أفكار المستويات العليا</h4>
                      <p className="text-xs text-slate-500 mt-1">التدريب على المسائل المركبة والرسوم البيانية المعقدة.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">التدريب على الوقت</h4>
                      <p className="text-xs text-slate-500 mt-1">حل الامتحانات في أزمنة قياسية مع تجنب الأخطاء الشائعة.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">متابعة فردية للطالب</h4>
                      <p className="text-xs text-slate-500 mt-1">الإجابة المباشرة على أسئلة الطالب ومراجعة مستواه باستمرار.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="bg-primary-50 rounded-3xl p-6 border border-primary-100 space-y-4">
                <h3 className="font-bold text-base text-primary-900">إحصائيات المنصة</h3>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-2xl border border-primary-100 flex items-center justify-between">
                    <span className="text-xs text-slate-600">سنوات الخبرة</span>
                    <span className="font-black text-lg text-primary-700">+6 سنوات</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-primary-100 flex items-center justify-between">
                    <span className="text-xs text-slate-600">الطلاب المتفوقين</span>
                    <span className="font-black text-lg text-primary-700">+10,000</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-primary-100 flex items-center justify-between">
                    <span className="text-xs text-slate-600">أوائل الجمهورية والمحافظات</span>
                    <span className="font-black text-lg text-amber-600">+150 طالب</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 text-white text-center space-y-4">
                <Atom className="w-10 h-10 text-primary-400 mx-auto animate-spin" />
                <h4 className="font-bold text-base">هل أنت مستعد للانضمام؟</h4>
                <p className="text-xs text-slate-300">احجز مكانك في مجموعات الشرح والمراجعة النهائية الآن.</p>
                <Link
                  href="/auth/register"
                  className="block w-full py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-bold text-xs transition-colors"
                >
                  سجل حسابك الآن
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
