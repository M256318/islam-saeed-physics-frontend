import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Atom, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  Award, 
  ArrowLeft, 
  Play, 
  Users, 
  Clock, 
  Star,
  Target,
  GraduationCap,
  MapPin
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
        {/* Background Physics Grid & Blur Glows */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/70 via-white to-slate-50 -z-10" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-200/30 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left/Right RTL Text Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100/80 border border-primary-200 text-primary-800 text-xs sm:text-sm font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-primary-600 animate-spin" />
                <span>المنصة الرسمية المعتمدة لمادة الفيزياء 2026/2027</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.2] lg:leading-[1.15]">
                افهم الفيزياء بأسلوب علمي مبسّط مع{' '}
                <span className="bg-gradient-to-l from-primary-700 via-primary-600 to-primary-500 bg-clip-text text-transparent block mt-1">
                  مستر إسلام سعيد
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                خبرة أكثر من 6 سنوات في تدريس الفيزياء للثانوية العامة والأزهرية. شرح وافٍ للمنهج من الأساسيات حتى أصعب أفكار امتحانات الثانوية مع متابعة يومية وحل المسائل خطوة بخطوة.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-base font-extrabold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>ابدأ رحلة التفوق مجانًا</span>
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <Link
                  href="/lectures"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm transition-all"
                >
                  <Play className="w-4 h-4 text-primary-600" />
                  <span>استعرض المحاضرات</span>
                </Link>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-6 max-w-lg mx-auto lg:mx-0 border-t border-slate-200/80">
                <div className="text-center lg:text-right">
                  <span className="block text-2xl sm:text-3xl font-black text-slate-900">+6</span>
                  <span className="text-xs font-semibold text-slate-500">سنوات من الخبرة</span>
                </div>
                <div className="text-center lg:text-right border-x border-slate-200 px-2">
                  <span className="block text-2xl sm:text-3xl font-black text-primary-600">+10,000</span>
                  <span className="text-xs font-semibold text-slate-500">طالب متفوق</span>
                </div>
                <div className="text-center lg:text-right">
                  <span className="block text-2xl sm:text-3xl font-black text-amber-500">60/60</span>
                  <span className="text-xs font-semibold text-slate-500">هدفنا الدرجة النهائية</span>
                </div>
              </div>
            </div>

            {/* Visual Hero Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-gradient-to-b from-primary-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-primary-900/40 border border-primary-800/50">
                {/* Physics floating icon */}
                <div className="absolute -top-6 -right-6 w-14 h-14 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg animate-float">
                  <Atom className="w-8 h-8" />
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-600/30 border border-primary-500/40 flex items-center justify-center text-primary-400 font-bold text-xl">
                      إ.س
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-white">مستر إسلام سعيد</h3>
                      <p className="text-xs text-primary-300">كبير معلمي الفيزياء بمحافظة المنيا (مركز سمالوط)</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                      <span>نظام المتابعة المستمرة</span>
                      <span className="text-emerald-400 font-bold">100% تفاعلي</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>شرح نظري وتجارب عملية موثقة بالفيديو</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>بنك أسئلة لأفكار المستويات العليا والوزارة</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>خدمة "اسأل المستر" للإجابة الفورية على المسائل</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                    <Award className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-300">أوائل الجمهورية على مدار سنوات</h4>
                      <p className="text-[11px] text-amber-200/80">تخريج المئات من طلبة كليات الطب والهندسة سنويًا</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Grid */}
      <section className="py-16 bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-extrabold text-primary-600 uppercase tracking-wider mb-2">
              لماذا تختار منصتنا؟
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              كل ما يحتاجه طالب الثانوية العامة لإتقان الفيزياء
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">محاضرات HD منظمة</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                تقسيم المنهج وفق الأبواب والفصول، مع التركيز على الاستنتاجات وتطبيقات القوانين.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">اسأل المستر مباشرة</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                صور أي مسألة تقف معك وارفعها على المنصة وسيرد عليك مستر إسلام سعيد شخصيًا بالشرح.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">مجموعات وكورسات منتظمة</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                حجز المجموعات الحضورية والأونلاين مع تحديد المواعيد ومتابعة نسبة الحضور والغياب.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">امتحانات وتقييم دوري</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                اختبارات بعد كل حصة وبنك أسئلة شامل يحاكي مواصفات امتحان نهاية العام تمامًا.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Academic Stages Callout */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              اختر مرحلتك الدراسية وابدأ المشاهدة
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              محتوى مخصص ومفصل لكل صف دراسي حسب أحدث مقررات وزارة التربية والتعليم والأزهر الشريف.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/lectures?grade=GRADE_12"
              className="group p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-primary-500 hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-black text-xl mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                3ث
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-primary-600 transition-colors">
                الصف الثالث الثانوي
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">الكهربية والتيار المتردد، والفيزياء الحديثة وإلكترونيات الحالة الصلبة.</p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600">
                <span>تصفح المحاضرات</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/lectures?grade=GRADE_11"
              className="group p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-primary-500 hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-black text-xl mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                2ث
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-primary-600 transition-colors">
                الصف الثاني الثانوي
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">الحركة الموجية، الضوء، خواص الموائع الساكنة والمتحركة، وقوانين الغازات.</p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600">
                <span>تصفح المحاضرات</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/lectures?grade=GRADE_10"
              className="group p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-primary-500 hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-black text-xl mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                1ث
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-primary-600 transition-colors">
                الصف الأول الثانوي
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">الكميات الفيزيائية ووحدات القياس، الحركة الخطية والسرعة، وقوانين نيوتن.</p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600">
                <span>تصفح المحاضرات</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Available Governorates & Centers Section */}
      <section className="py-16 bg-white border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-3">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>أماكن التواجد والمجموعات الحضورية</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              المحافظات والمراكز المتاحة
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              نوفر الحضور المباشر في السناتر والمجموعات بالإضافة إلى المتابعة الإلكترونية الكاملة عبر المنصة.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Minya / Samalut Governorate Card */}
            <div className="bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-primary-800/40 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -z-0" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-primary-600/30 border border-primary-500/40 flex items-center justify-center text-primary-400">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">المحافظة الرئيسية</span>
                      <h3 className="text-2xl font-black text-white">محافظة المنيا</h3>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>متاح حاليًا في مركز سمالوط – محافظة المنيا</span>
                  </div>
                </div>

                {/* Center Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>مركز سمالوط (المقر الرئيسي)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      مجموعات الشرح الحضوري، المراجعات المكثفة، وحل بنوك الأسئلة لطلاب سمالوط والقرى المجاورة.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-primary-300 font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-primary-400 shrink-0" />
                      <span>المنصة الأونلاين (كافة المراكز والمحافظات)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      مشاهدة كافة المحاضرات بجودة HD وبنك الأسئلة التفاعلي متاح لجميع الطلاب في أنحاء الجمهورية.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>الحجز متاح الآن للمرحلة الثانوية بصفوفها الثلاثة</span>
                  </p>
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 text-primary-300 hover:text-white font-bold transition-colors"
                  >
                    <span>عرض مواعيد مجموعات سمالوط والكورسات المتاحة</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Final CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-primary-800 via-primary-700 to-primary-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black">
            مستعد تقفل امتحان الفيزياء وتضمن مستقبلك؟
          </h2>
          <p className="text-primary-100 text-sm sm:text-base max-w-2xl mx-auto">
            سجل الآن وانضم لآلاف الطلاب في أكبر مجتمع لتعلم الفيزياء للثانوية العامة والأزهرية في مصر.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-black text-primary-900 bg-amber-400 hover:bg-amber-300 shadow-xl transition-all transform hover:scale-105"
            >
              <span>سجل حسابك مجانًا الآن</span>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
