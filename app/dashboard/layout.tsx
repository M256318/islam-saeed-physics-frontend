'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { 
  Atom, 
  LayoutDashboard, 
  BookOpen, 
  HelpCircle, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X,
  PlayCircle,
  Layers,
  Home
} from 'lucide-react';
import { LoadingSpinner } from '@/components/UIState';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent(pathname));
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner text="جاري التحقق من هوية الطالب..." />
      </div>
    );
  }

  const navItems = [
    { name: 'الرئيسية (لوحة التحكم)', href: '/dashboard', icon: LayoutDashboard },
    { name: 'المحاضرات والشروحات', href: '/lectures', icon: PlayCircle },
    { name: 'كورساتي', href: '/dashboard/courses', icon: Layers },
    { name: 'حجوزاتي', href: '/dashboard/bookings', icon: BookOpen },
    { name: 'اسأل المستر', href: '/dashboard/questions', icon: HelpCircle },
    { name: 'مركز الإشعارات', href: '/dashboard/notifications', icon: Bell },
    { name: 'الملف الشخصي', href: '/dashboard/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-cairo">
      {/* Mobile Top bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 p-0.5 flex items-center justify-center overflow-hidden relative">
            <Image
              src="/WEB.png"
              alt="لوحة الطالب"
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-extrabold text-sm text-slate-900">لوحة الطالب</span>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile drawer */}
      <aside
        className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-slate-900 text-slate-200 p-5 z-50 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <Link href="/" className="flex items-center gap-3 px-2 py-1 group">
            <div className="w-10 h-10 rounded-xl bg-slate-800 p-1 flex items-center justify-center text-white shadow-md border border-slate-700/60 overflow-hidden relative group-hover:scale-105 transition-transform">
              <Image
                src="/WEB.png"
                alt="مستر إسلام سعيد"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-black text-base text-white block">مستر إسلام سعيد</span>
              <span className="text-[11px] text-primary-400 font-semibold block">منصة الفيزياء</span>
            </div>
          </Link>

          {/* Student Quick Bio Card */}
          <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/60">
            <p className="text-[11px] text-slate-400 font-medium">مرحبًا بك يا بطل،</p>
            <p className="font-bold text-sm text-white truncate">
              {user.firstName} {user.lastName}
            </p>
            <span className="inline-block mt-1 bg-primary-500/20 text-primary-300 text-[10px] font-bold px-2 py-0.5 rounded">
              {user.academicYear === 'GRADE_12'
                ? 'الصف 3 ثانوي'
                : user.academicYear === 'GRADE_11'
                ? 'الصف 2 ثانوي'
                : 'الصف 1 ثانوي'}
            </span>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>الموقع الرئيسي</span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

