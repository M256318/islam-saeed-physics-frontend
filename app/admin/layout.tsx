'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  ShieldCheck,
  Crown,
  LayoutDashboard,
  Users,
  UserCheck,
  PlayCircle,
  BookOpen,
  HelpCircle,
  CalendarCheck,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Home,
  AlertTriangle,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/UIState';

// POST /api/v1/admin/apply is public on the backend, so this page must stay reachable
// for visitors who are not (yet) administrators.
const PUBLIC_ADMIN_PATH = '/admin/apply';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  ownerOnly?: boolean;
  requiredPermission?: string;
  badge?: string;
}

/**
 * Reads ?tab= so '/admin/admins' and '/admin/admins?tab=requests' are not both
 * highlighted. Wrapped in <Suspense> by the caller because useSearchParams
 * opts a route out of static rendering.
 */
function AdminNavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate: () => void;
}) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  return (
    <>
      {items.map((item) => {
        const [itemPath, itemQuery] = item.href.split('?');
        const itemTab = itemQuery ? new URLSearchParams(itemQuery).get('tab') : null;
        const isActive = itemTab
          ? pathname === itemPath && currentTab === itemTab
          : pathname === itemPath && !currentTab;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </>
  );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, isAdmin, isOwner, hasPermission, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isPublicAdminPage = pathname === PUBLIC_ADMIN_PATH;

  useEffect(() => {
    if (!isLoading && !isPublicAdminPage) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=' + encodeURIComponent(pathname));
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, isPublicAdminPage, router, pathname]);

  if (isPublicAdminPage) {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated || !isAdmin || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <LoadingSpinner text="جاري التحقق من صلاحيات الإدارة..." />
      </div>
    );
  }

  // Define navigation items with required permissions
  const allNavItems: NavItem[] = [
    {
      name: 'لوحة الإحصائيات (KPIs)',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'إدارة المشرفين والصلاحيات',
      href: '/admin/admins',
      icon: Crown,
      ownerOnly: true,
    },
    {
      name: 'طلبات الانضمام للإشراف',
      href: '/admin/admins?tab=requests',
      icon: UserCheck,
      ownerOnly: true,
    },
    {
      name: 'إدارة الطلاب المشتركين',
      href: '/admin/students',
      icon: Users,
      requiredPermission: 'users:read',
    },
    {
      name: 'إدارة المحاضرات والفيديوهات',
      href: '/admin/lectures',
      icon: PlayCircle,
      requiredPermission: 'lectures:read',
    },
    {
      name: 'إدارة الكورسات والمجموعات',
      href: '/admin/courses',
      icon: BookOpen,
      requiredPermission: 'courses:read',
    },
    {
      name: 'إدارة حجوزات المجموعات',
      href: '/admin/bookings',
      icon: CalendarCheck,
      requiredPermission: 'bookings:manage',
    },
    {
      name: 'إدارة أسئلة الطلاب والردود',
      href: '/admin/questions',
      icon: HelpCircle,
      requiredPermission: 'questions:answer',
    },
    {
      name: 'سجلات النشاط والأمان (Audit)',
      href: '/admin/audit-logs',
      icon: ClipboardList,
      requiredPermission: 'audit:read',
    },
  ];

  // Filter nav items based on user's roles and permissions
  const visibleNavItems = allNavItems.filter((item) => {
    if (isOwner) return true;
    if (item.ownerOnly) return false;
    if (!item.requiredPermission) return true;
    return hasPermission(item.requiredPermission);
  });

  // Client Route Guard: Check if current page is unauthorized for the current user
  const isCurrentPageUnauthorized = () => {
    if (isOwner) return false;
    if (pathname.startsWith('/admin/admins') && !isOwner) return true;
    if (pathname.startsWith('/admin/audit-logs') && !hasPermission('audit:read')) return true;
    if (pathname.startsWith('/admin/students') && !hasPermission('users:read')) return true;
    if (pathname.startsWith('/admin/lectures') && !hasPermission('lectures:read')) return true;
    if (pathname.startsWith('/admin/courses') && !hasPermission('courses:read')) return true;
    if (pathname.startsWith('/admin/bookings') && !hasPermission('bookings:manage')) return true;
    if (pathname.startsWith('/admin/questions') && !hasPermission('questions:answer')) return true;
    return false;
  };

  const isUnauthorized = isCurrentPageUnauthorized();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-cairo" dir="rtl">
      {/* Mobile Top bar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
            {isOwner ? <Crown className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <span className="font-extrabold text-sm text-white">
            {isOwner ? 'لوحة المالك (Owner)' : 'لوحة تحكم المشرف'}
          </span>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg"
          aria-label="القائمة"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-slate-900 border-l border-slate-800 p-5 z-50 flex flex-col justify-between transition-transform duration-300 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Header */}
          <Link href="/admin" className="flex items-center gap-3 px-2 py-1 group">
            <div className="w-10 h-10 rounded-xl bg-slate-800 p-1 flex items-center justify-center text-white shadow-md border border-slate-700/60 overflow-hidden relative group-hover:scale-105 transition-transform">
              <Image
                src="/WEB.png"
                alt="منصة مستر إسلام سعيد"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-black text-sm text-white block">منصة الفيزياء</span>
              <span className="text-[11px] text-amber-400 font-semibold block">
                مستر إسلام سعيد
              </span>
            </div>
          </Link>

          {/* User Role Card */}
          <div className={`rounded-2xl p-3.5 border ${
            isOwner
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-slate-800/80 border-slate-700/60 text-slate-300'
          }`}>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isOwner ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-700 text-slate-200'
              }`}>
                {isOwner ? 'مالك المنصة (OWNER)' : 'مشرف مساعد (ADMIN)'}
              </span>
            </div>
            <p className="font-bold text-sm text-white truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{user.phoneNumber}</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <Suspense
              fallback={
                <div className="space-y-1" aria-hidden="true">
                  {visibleNavItems.map((item) => (
                    <div key={item.href} className="h-10 rounded-xl bg-slate-800/40" />
                  ))}
                </div>
              }
            >
              <AdminNavLinks
                items={visibleNavItems}
                pathname={pathname}
                onNavigate={() => setSidebarOpen(false)}
              />
            </Suspense>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>معاينة الموقع العام</span>
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

      {/* Main Admin Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {isUnauthorized ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto my-12">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">غير مصرح بالوصول إلى هذه الصفحة</h2>
              <p className="text-sm text-slate-400 mb-6">
                حسابك لا يمتلك الصلاحية المطلوبة للوصول إلى هذا القسم. إذا كنت بحاجة للوصول، يرجى التواصل مع مالك المنصة (مستر إسلام سعيد).
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-sm hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>العودة للوحة الإحصائيات</span>
              </Link>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}

