import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Phone, Mail, MapPin, MessageSquare, Send, Clock, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="pt-28 pb-16 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              خدمة الطلاب وأولياء الأمور
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2 mb-3">
              تواصل مع فريق مستر إسلام سعيد
            </h1>
            <p className="text-sm text-slate-600">
              نحن هنا للإجابة على جميع استفساراتكم حول المجموعات، المواعيد، والاشتراكات.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Info Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">الاتصال المباشر والواتساب</h3>
                <p className="text-xs text-slate-500">فريق السكرتارية متاح يوميًا من 9 صباحًا حتى 9 مساءً.</p>
                <div className="pt-2">
                  <span className="font-mono font-bold text-sm text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg inline-block" dir="ltr">
                    +20 100 000 0000
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">البريد الإلكتروني والدعم الفني</h3>
                <p className="text-xs text-slate-500">لأي مشكلات تقنية أو استفسارات حول المنصة الإلكترونية.</p>
                <div className="pt-2">
                  <span className="font-mono text-xs text-slate-700 font-semibold">
                    support@islam-saeed-physics.com
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">مواعيد العمل</h3>
                <p className="text-xs text-slate-600">طوال أيام الأسبوع: 9:00 ص - 9:00 م (ما عدا الجمعة: 1:00 م - 8:00 م)</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6 border-r-2 border-primary-600 pr-3">
                أرسل رسالتك وسنعاود الاتصال بك
              </h2>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم بالكامل</label>
                    <input
                      type="text"
                      placeholder="مثال: أحمد محمد علي"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الهاتف (واتساب)</label>
                    <input
                      type="text"
                      placeholder="010XXXXXXXX"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">المرحلة الدراسية</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                    <option>الصف الثالث الثانوي (عام)</option>
                    <option>الصف الثالث الثانوي (أزهر)</option>
                    <option>الصف الثاني الثانوي</option>
                    <option>الصف الأول الثانوي</option>
                    <option>أولياء الأمور</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">نص الرسالة أو الاستفسار</label>
                  <textarea
                    rows={4}
                    placeholder="اكتب استفسارك بالتفصيل..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                  />
                </div>

                <button
                  type="button"
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال الرسالة</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
